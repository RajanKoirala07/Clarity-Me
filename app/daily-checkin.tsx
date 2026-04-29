import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { setItem, getItem } from "@/services/storage";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Lazy require so the app doesn't crash in Expo Go or without a native build.
// The native module is only available after `expo prebuild && expo run:ios`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ExpoHealthKit: any = null;
try {
  ExpoHealthKit = require("@kayzmann/expo-healthkit");
} catch {
  // Native module not linked — HealthKit features will be silently disabled.
}

const { width } = Dimensions.get("window");

const TEAL = "#0D9488";
const TEAL_DARK = "#0F766E";
const TEAL_LIGHT = "#E6FAF5";
const GRAY_BG = "#F3F4F6";
const GRAY_TEXT = "#6B7280";
const DARK_TEXT = "#1F2937";
const TRACK_BG = "#E5E7EB";

const TOTAL_QUESTIONS = 9;
const CHECKIN_STORAGE_KEY = "clarity_daily_checkin";

const SLIDER_QUESTIONS = [
  {
    key: "feeling",
    label: "How are you feeling?",
    icon: "📊",
    emojis: ["😞", "😐", "😊"],
    min: 1,
    max: 10,
    defaultVal: 7,
  },
  {
    key: "energy",
    label: "How energized?",
    icon: "📊",
    emojis: ["😴", "😐", "⚡"],
    min: 1,
    max: 10,
    defaultVal: 6,
  },
  {
    key: "stress",
    label: "How stressed?",
    icon: "📊",
    emojis: ["😌", "😐", "🔥"],
    min: 1,
    max: 10,
    defaultVal: 4,
  },
  {
    key: "sleep_quality",
    label: "Sleep quality?",
    icon: "📊",
    emojis: ["😴", "😐", "😊"],
    min: 1,
    max: 10,
    defaultVal: 8,
    skippable: true,
  },
] as const;

const STEPPER_QUESTIONS = [
  {
    key: "sleep_hours",
    label: "Sleep hours",
    icon: "🛏️",
    min: 0,
    max: 16,
    step: 0.5,
    defaultVal: 7.5,
    unit: "h",
    quickValues: [0, 6, 7.5, 9, 12],
  },
  {
    key: "productive_hours",
    label: "Productive hours",
    icon: "📊",
    min: 0,
    max: 16,
    step: 0.5,
    defaultVal: 6,
    unit: "h",
    quickValues: [0, 4, 6, 8, 12],
  },
] as const;

const CHIP_QUESTIONS = [
  {
    key: "social",
    label: "Social interactions",
    icon: "💬",
    options: ["0", "1", "2", "3", "5+"],
    defaultVal: "3",
  },
  {
    key: "exercise",
    label: "Exercise",
    icon: "🏃",
    options: ["0", "15", "30", "60", "120+"],
    defaultVal: "30",
    unitLabel: "minutes",
  },
  {
    key: "meditation",
    label: "Meditation",
    icon: "🧘",
    options: ["0", "5", "10", "20+"],
    defaultVal: "0",
    unitLabel: "minutes",
  },
] as const;

type CheckinData = {
  feeling: number | null;
  energy: number | null;
  stress: number | null;
  sleep_quality: number | null;
  sleep_hours: number;
  productive_hours: number;
  social: string;
  exercise: string;
  meditation: string;
};

type Recommendation = {
  id: string;
  icon: string;
  title: string;
  body: string;
  category:
    | "sleep"
    | "movement"
    | "stress"
    | "mindfulness"
    | "energy"
    | "social";
  youtubeQuery: string;
  duration: string;
  level: string;
};

type HKContext = {
  steps: number | null;
  heartRate: number | null;
};

/* ─── HealthKit helpers ─── */

function minutesToExerciseChip(minutes: number): string {
  if (minutes <= 0) return "0";
  if (minutes < 22) return "15";
  if (minutes < 45) return "30";
  if (minutes < 90) return "60";
  return "120+";
}

function deriveSleepQuality(sleepHours: number, deepRemRatio: number): number {
  let base: number;
  if (sleepHours >= 8) base = 8;
  else if (sleepHours >= 7) base = 7;
  else if (sleepHours >= 6) base = 5;
  else if (sleepHours >= 5) base = 3;
  else base = 2;
  if (deepRemRatio > 0.4) base = Math.min(10, base + 2);
  else if (deepRemRatio > 0.25) base = Math.min(10, base + 1);
  return base;
}

async function fetchHealthKitData(): Promise<{
  sleepHours: number | null;
  sleepQuality: number | null;
  exerciseChip: string | null;
  hkContext: HKContext;
}> {
  const now = new Date();
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const sleepWindowStart = new Date();
  sleepWindowStart.setDate(sleepWindowStart.getDate() - 1);
  sleepWindowStart.setHours(20, 0, 0, 0);

  const [stepsResult, heartRateResult, workoutsResult, sleepResult] =
    await Promise.allSettled([
      ExpoHealthKit.getSteps(todayMidnight, now),
      ExpoHealthKit.getLatestHeartRate(),
      ExpoHealthKit.queryWorkouts({
        startDate: todayMidnight,
        endDate: now,
        limit: 20,
      }),
      ExpoHealthKit.getSleepSamples(sleepWindowStart, now),
    ]);

  let sleepHours: number | null = null;
  let sleepQuality: number | null = null;
  if (sleepResult.status === "fulfilled") {
    const samples = sleepResult.value as Array<{
      value: string;
      duration: number;
    }>;
    const asleepSamples = samples.filter((s) =>
      ["asleep", "core", "deep", "rem"].includes(s.value),
    );
    const totalSec = asleepSamples.reduce((sum, s) => sum + s.duration, 0);
    if (totalSec > 0) {
      const rawHours = totalSec / 3600;
      sleepHours = Math.min(16, Math.max(0, Math.round(rawHours * 2) / 2));
      const deepRemSec = samples
        .filter((s) => ["deep", "rem"].includes(s.value))
        .reduce((sum, s) => sum + s.duration, 0);
      sleepQuality = deriveSleepQuality(
        sleepHours,
        totalSec > 0 ? deepRemSec / totalSec : 0,
      );
    }
  }

  let exerciseChip: string | null = null;
  if (workoutsResult.status === "fulfilled") {
    const workouts = workoutsResult.value as Array<{ duration: number }>;
    const totalSec = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    exerciseChip = minutesToExerciseChip(Math.round(totalSec / 60));
  }

  return {
    sleepHours,
    sleepQuality,
    exerciseChip,
    hkContext: {
      steps:
        stepsResult.status === "fulfilled"
          ? (stepsResult.value as number)
          : null,
      heartRate:
        heartRateResult.status === "fulfilled"
          ? (heartRateResult.value as number | null)
          : null,
    },
  };
}

/* ─── Recommendation engine ─── */

function generateRecommendations(
  data: CheckinData,
  skipped: Set<string>,
  hk: HKContext,
): Recommendation[] {
  const exerciseMin =
    data.exercise === "120+" ? 120 : parseInt(data.exercise, 10);
  const meditationMin =
    data.meditation === "20+" ? 20 : parseInt(data.meditation, 10);
  const socialCount = data.social === "5+" ? 5 : parseInt(data.social, 10);
  const recs: Recommendation[] = [];

  if (data.sleep_hours < 6) {
    recs.push({
      id: "sleep_low",
      icon: "😴",
      title: "Prioritize Sleep Tonight",
      body: `You only got ${data.sleep_hours}h of sleep. Aim for 7–9 hours — dim screens 1h before bed and keep a consistent schedule.`,
      category: "sleep",
      duration: "7 min",
      level: "Relaxing",
      youtubeQuery: "how to fall asleep faster and sleep better tonight",
    });
  } else if (data.sleep_hours < 7) {
    recs.push({
      id: "sleep_medium",
      icon: "🛏️",
      title: "Boost Your Sleep",
      body: "A bit more sleep can significantly improve focus and mood. Try a consistent bedtime routine tonight.",
      category: "sleep",
      duration: "5 min",
      level: "Relaxing",
      youtubeQuery: "bedtime routine for better sleep quality",
    });
  }

  if (
    !skipped.has("sleep_quality") &&
    data.sleep_quality !== null &&
    data.sleep_quality <= 5
  ) {
    recs.push({
      id: "sleep_quality",
      icon: "🌙",
      title: "Improve Sleep Quality",
      body: "Poor sleep quality drains energy all day. Avoid caffeine after 2pm, keep your room cool and dark.",
      category: "sleep",
      duration: "8 min",
      level: "Calm",
      youtubeQuery: "how to improve deep sleep quality tips",
    });
  }

  if (data.stress !== null && data.stress >= 7) {
    recs.push({
      id: "stress_high",
      icon: "🌬️",
      title: "Release Your Stress",
      body: "Try the 4-7-8 breath: inhale 4s, hold 7s, exhale 8s — repeat 4 times.",
      category: "stress",
      duration: "3 min",
      level: "Guided",
      youtubeQuery: "4 7 8 breathing technique for stress and anxiety relief",
    });
  } else if (data.stress !== null && data.stress >= 5) {
    recs.push({
      id: "stress_moderate",
      icon: "🌿",
      title: "Keep Stress in Check",
      body: "Take a 5-minute break every 90 minutes. A short walk outside can reset your nervous system.",
      category: "stress",
      duration: "5 min",
      level: "Quick",
      youtubeQuery: "quick stress relief techniques 5 minutes",
    });
  }

  if (data.energy !== null && data.energy <= 3) {
    recs.push({
      id: "energy_very_low",
      icon: "💧",
      title: "Recharge Your Energy",
      body: "Low energy often signals dehydration. Drink water, have a light snack, and take a brisk 10-min walk.",
      category: "energy",
      duration: "10 min",
      level: "Energizing",
      youtubeQuery: "how to boost energy naturally when tired",
    });
  } else if (data.energy !== null && data.energy <= 5 && data.sleep_hours < 7) {
    recs.push({
      id: "energy_sleep",
      icon: "⚡",
      title: "Energy Tied to Sleep",
      body: "Your energy and sleep are both low. A 10–20 min power nap before 3pm can help.",
      category: "energy",
      duration: "6 min",
      level: "Calm",
      youtubeQuery: "power nap benefits how to nap correctly for energy",
    });
  }

  if (hk.steps !== null && hk.steps < 3000) {
    recs.push({
      id: "steps_very_low",
      icon: "🚶",
      title: "Get Moving",
      body: `Only ${Math.round(hk.steps).toLocaleString()} steps today. A brisk 15-min walk lifts mood and energy noticeably.`,
      category: "movement",
      duration: "15 min",
      level: "Beginner",
      youtubeQuery: "15 minute walking workout for beginners at home",
    });
  } else if (hk.steps !== null && hk.steps < 6000 && exerciseMin < 30) {
    recs.push({
      id: "steps_low",
      icon: "🏃",
      title: "Add More Movement",
      body: `At ${Math.round(hk.steps).toLocaleString()} steps you're under halfway to 10k. Try a short walk or stairs.`,
      category: "movement",
      duration: "10 min",
      level: "Beginner",
      youtubeQuery: "how to increase daily steps motivation tips",
    });
  } else if (hk.steps === null && exerciseMin === 0) {
    recs.push({
      id: "exercise_none",
      icon: "💪",
      title: "Time to Move",
      body: "No exercise logged today. Even 15 minutes of brisk walking reduces anxiety and improves focus.",
      category: "movement",
      duration: "15 min",
      level: "Beginner",
      youtubeQuery: "15 minute beginner full body workout no equipment",
    });
  } else if (hk.steps !== null && hk.steps >= 10000) {
    recs.push({
      id: "steps_great",
      icon: "🎉",
      title: "Excellent Activity!",
      body: `${Math.round(hk.steps).toLocaleString()} steps — you've crushed your daily goal!`,
      category: "movement",
      duration: "20+ min",
      level: "Active",
      youtubeQuery: "advanced daily walking challenge fitness motivation",
    });
  }

  if (meditationMin === 0 && data.stress !== null && data.stress >= 5) {
    recs.push({
      id: "meditate",
      icon: "🧘",
      title: "Try Mindfulness Today",
      body: "Even 5–10 minutes of guided meditation can lower cortisol when stress is elevated.",
      category: "mindfulness",
      duration: "10 min",
      level: "Calm",
      youtubeQuery:
        "10 minute guided meditation for stress and anxiety beginners",
    });
  } else if (meditationMin >= 10) {
    recs.push({
      id: "meditate_great",
      icon: "✨",
      title: "Great Mindfulness Practice!",
      body: `${meditationMin} minutes of meditation is excellent. Consistency rewires stress-response pathways.`,
      category: "mindfulness",
      duration: "15 min",
      level: "Advanced",
      youtubeQuery: "advanced mindfulness meditation techniques",
    });
  }

  if (socialCount === 0 && data.feeling !== null && data.feeling <= 6) {
    recs.push({
      id: "social_low",
      icon: "💬",
      title: "Connect with Someone",
      body: "Social connection is a powerful mood booster. Even a quick call makes a real difference today.",
      category: "social",
      duration: "8 min",
      level: "Insightful",
      youtubeQuery: "how to build deeper social connections and friendships",
    });
  }

  if (
    hk.heartRate !== null &&
    hk.heartRate > 90 &&
    data.stress !== null &&
    data.stress >= 6
  ) {
    recs.push({
      id: "hr_elevated",
      icon: "❤️",
      title: "Elevated Heart Rate",
      body: `HR at ${Math.round(hk.heartRate)} bpm with high stress. Try box breathing or a slow walk.`,
      category: "stress",
      duration: "5 min",
      level: "Guided",
      youtubeQuery: "box breathing technique to lower heart rate and stress",
    });
  }

  if (
    data.feeling !== null &&
    data.feeling >= 8 &&
    data.energy !== null &&
    data.energy >= 7 &&
    data.stress !== null &&
    data.stress <= 4
  ) {
    recs.push({
      id: "thriving",
      icon: "🌟",
      title: "You're Thriving Today!",
      body: "High energy, great mood, low stress — a perfect day to tackle something meaningful.",
      category: "energy",
      duration: "10 min",
      level: "Advanced",
      youtubeQuery: "how to maintain peak performance and productivity",
    });
  }

  const positiveIds = ["steps_great", "meditate_great", "thriving"];
  const actionable = recs.filter((r) => !positiveIds.includes(r.id));
  const positive = recs.filter((r) => positiveIds.includes(r.id));
  return [...actionable.slice(0, 4), ...positive.slice(0, 1)];
}

/* ─── Main screen ─── */

export default function DailyCheckinScreen() {
  const router = useRouter();
  const [data, setData] = useState<CheckinData>({
    feeling: 7,
    energy: 6,
    stress: 4,
    sleep_quality: 8,
    sleep_hours: 0,
    productive_hours: 0,
    social: "0",
    exercise: "0",
    meditation: "0",
  });
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [answeredFields, setAnsweredFields] = useState<Set<string>>(new Set());
  const [hkStatus, setHkStatus] = useState<
    "idle" | "loading" | "ready" | "unavailable"
  >("idle");
  const [hkContext, setHkContext] = useState<HKContext>({
    steps: null,
    heartRate: null,
  });
  const [showRecs, setShowRecs] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const hasAutoFilled = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reload saved data every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setIsLoadingData(true);
      (async () => {
        try {
          const raw = await getItem(CHECKIN_STORAGE_KEY);
          if (cancelled) return;
          if (raw) {
            const parsed = JSON.parse(raw);
            const savedDate = new Date(parsed.savedAt);
            const today = new Date();
            const isSameDay =
              savedDate.getFullYear() === today.getFullYear() &&
              savedDate.getMonth() === today.getMonth() &&
              savedDate.getDate() === today.getDate();
            if (isSameDay) {
              setData(parsed.data);
              const restoredSkipped = Array.isArray(parsed.skipped)
                ? new Set<string>(parsed.skipped)
                : new Set<string>();
              if (Array.isArray(parsed.skipped)) setSkipped(restoredSkipped);
              if (Array.isArray(parsed.answeredFields))
                setAnsweredFields(new Set(parsed.answeredFields));
              if (parsed.showRecs === true) {
                setShowRecs(true);
                setRecommendations(
                  generateRecommendations(parsed.data, restoredSkipped, {
                    steps: null,
                    heartRate: null,
                  }),
                );
              }
              hasAutoFilled.current = true;
            }
          }
        } catch {
          // ignore corrupt / missing storage
        } finally {
          if (!cancelled) setIsLoadingData(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const progress = Math.min(answeredFields.size, TOTAL_QUESTIONS);

  const updateField = useCallback(
    <K extends keyof CheckinData>(key: K, value: CheckinData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setAnsweredFields((prev) => new Set(prev).add(key as string));
      setSkipped((prev) => {
        const next = new Set(prev);
        next.delete(key as string);
        return next;
      });
    },
    [],
  );

  const skipField = useCallback((key: string) => {
    setSkipped((prev) => new Set(prev).add(key));
    setAnsweredFields((prev) => new Set(prev).add(key));
  }, []);

  useEffect(() => {
    if (Platform.OS !== "ios" || !ExpoHealthKit) {
      setHkStatus("unavailable");
      return;
    }
    let available = false;
    try {
      available = ExpoHealthKit.isAvailable();
    } catch {
      available = false;
    }
    if (!available) {
      setHkStatus("unavailable");
      return;
    }
    setHkStatus("loading");
    (async () => {
      try {
        await ExpoHealthKit.requestAuthorization(
          ["Steps", "Sleep", "Workout", "HeartRate"],
          [],
        );
        const result = await fetchHealthKitData();
        setHkContext(result.hkContext);
        if (!hasAutoFilled.current) {
          hasAutoFilled.current = true;
          const hkPatch: Partial<CheckinData> = {};
          const hkFilled: string[] = [];
          if (result.sleepHours !== null) {
            hkPatch.sleep_hours = result.sleepHours;
            hkFilled.push("sleep_hours");
          }
          if (result.sleepQuality !== null) {
            hkPatch.sleep_quality = result.sleepQuality;
            hkFilled.push("sleep_quality");
          }
          if (result.exerciseChip !== null) {
            hkPatch.exercise = result.exerciseChip;
            hkFilled.push("exercise");
          }
          if (hkFilled.length > 0) {
            setData((prev) => ({ ...prev, ...hkPatch }));
            setAnsweredFields((prev) => new Set([...prev, ...hkFilled]));
            if (result.sleepQuality !== null) {
              setSkipped((prev) => {
                const next = new Set(prev);
                next.delete("sleep_quality");
                return next;
              });
            }
          }
        }
        setHkStatus("ready");
      } catch {
        setHkStatus("unavailable");
      }
    })();
  }, []);

  // Auto-save on every field change (debounced 800 ms)
  useEffect(() => {
    if (isLoadingData || answeredFields.size === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await setItem(
          CHECKIN_STORAGE_KEY,
          JSON.stringify({
            data,
            skipped: [...skipped],
            answeredFields: [...answeredFields],
            showRecs,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {}
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, skipped, answeredFields, showRecs, recommendations, isLoadingData]);

  const handleSave = useCallback(async () => {
    // console.log("Saving check-in data:", {
    //   data,
    //   skipped,
    //   answeredFields,
    //   showRecs,
    //   recommendations,
    // });
    setSaveStatus("saving");
    try {
      await setItem(
        CHECKIN_STORAGE_KEY,
        JSON.stringify({
          data,
          skipped: [...skipped],
          answeredFields: [...answeredFields],
          showRecs,
          savedAt: new Date().toISOString(),
        }),
      );
      setSaveStatus("saved");
      router.navigate("/");
    } catch (e) {
      console.error("Failed to save check-in:", e);
      setSaveStatus("idle");
    }
  }, [data, skipped, answeredFields, showRecs, router]);

  const handleGetRecommendations = useCallback(async () => {
    const recs = generateRecommendations(data, skipped, hkContext);
    setRecommendations(recs);
    setShowRecs(true);
    try {
      await setItem(
        CHECKIN_STORAGE_KEY,
        JSON.stringify({
          data,
          skipped: [...skipped],
          answeredFields: [...answeredFields],
          showRecs: true,
          recommendations: recs,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // non-critical — user can still use the screen
    }
  }, [data, skipped, answeredFields, hkContext]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="home" size={22} color={TEAL_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-in</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={isLoadingData ? { display: "none" } : undefined}
      >
        <Text style={styles.subtitle}>Get personalized recommendations</Text>

        {/* HealthKit banner */}
        {hkStatus === "loading" && (
          <View style={styles.hkBanner}>
            <ActivityIndicator size="small" color={TEAL} />
            <Text style={styles.hkBannerText}>Syncing Apple Health data…</Text>
          </View>
        )}
        {hkStatus === "ready" && (
          <View style={styles.hkBanner}>
            <Text style={styles.hkBannerIcon}>⌚</Text>
            <View>
              <Text style={styles.hkBannerTitle}>Synced from Apple Health</Text>
              <Text style={styles.hkBannerSub}>
                Sleep, workouts & heart rate auto-filled
              </Text>
            </View>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>
              {progress}/{TOTAL_QUESTIONS}
            </Text>
          </View>
          <View style={styles.progressDots}>
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < progress ? styles.dotFilled : styles.dotEmpty,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Slider Questions */}
        {SLIDER_QUESTIONS.map((q) => (
          <SliderCard
            key={q.key}
            label={q.label}
            icon={q.icon}
            emojis={[...q.emojis]}
            value={data[q.key] as number | null}
            min={q.min}
            max={q.max}
            skippable={"skippable" in q && q.skippable}
            isSkipped={skipped.has(q.key)}
            onSkip={() => skipField(q.key)}
            onChange={(v) => updateField(q.key, v)}
            hkSynced={
              hkStatus === "ready" &&
              q.key === "sleep_quality" &&
              !skipped.has(q.key)
            }
          />
        ))}

        {/* Stepper Questions */}
        {STEPPER_QUESTIONS.map((q) => (
          <StepperCard
            key={q.key}
            label={q.label}
            icon={q.icon}
            value={data[q.key] as number}
            min={q.min}
            max={q.max}
            step={q.step}
            unit={q.unit}
            quickValues={[...q.quickValues]}
            onChange={(v) => updateField(q.key, v)}
            hkSynced={hkStatus === "ready" && q.key === "sleep_hours"}
          />
        ))}

        {/* Chip Questions */}
        {CHIP_QUESTIONS.map((q) => (
          <ChipCard
            key={q.key}
            label={q.label}
            icon={q.icon}
            options={[...q.options]}
            value={data[q.key] as string}
            unitLabel={"unitLabel" in q ? q.unitLabel : undefined}
            onChange={(v) => updateField(q.key, v)}
            hkSynced={hkStatus === "ready" && q.key === "exercise"}
          />
        ))}

        {/* Steps context card */}
        {hkStatus === "ready" && hkContext.steps !== null && (
          <View style={styles.hkContextCard}>
            <Text style={styles.hkContextIcon}>👣</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hkContextLabel}>Today's Steps</Text>
              <View style={styles.hkContextBarTrack}>
                <View
                  style={[
                    styles.hkContextBarFill,
                    {
                      width: `${Math.min(100, (hkContext.steps / 10000) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.hkContextValue}>
              {Math.round(hkContext.steps).toLocaleString()}
              {hkContext.steps >= 10000 ? " 🎉" : " / 10k"}
            </Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saveStatus === "saved" && styles.saveButtonSaved,
          ]}
          onPress={handleSave}
          disabled={saveStatus === "saving"}
        >
          <Text style={styles.saveButtonText}>
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "✓ Saved!"
                : "Save & Continue Later"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recsButton}
          onPress={handleGetRecommendations}
        >
          <Text style={styles.recsButtonText}>
            {showRecs ? "Refresh Recommendations" : "Get My Recommendations"}
          </Text>
          <Text style={styles.recsIcon}>✨</Text>
        </TouchableOpacity>

        {/* Recommendations */}
        {showRecs && (
          <View style={styles.recsSection}>
            <Text style={styles.recsSectionTitle}>Your Recommendations</Text>
            <Text style={styles.recsSectionSub}>
              Personalized for today
              {hkStatus === "ready" ? " · powered by Apple Health" : ""}
            </Text>
            {recommendations.length === 0 ? (
              <View style={styles.recCard}>
                <Text style={styles.recCardIcon}>🌟</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recCardTitle}>
                    Everything looks great!
                  </Text>
                  <Text style={styles.recCardBody}>
                    Your check-in looks well-balanced. Keep up the good habits
                    and stay consistent.
                  </Text>
                </View>
              </View>
            ) : (
              recommendations.map((rec, i) => (
                <RecommendationCard key={rec.id} rec={rec} isFirst={i === 0} />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Slider Card ─── */

function SliderCard({
  label,
  icon,
  emojis,
  value,
  min,
  max,
  skippable,
  isSkipped,
  onSkip,
  onChange,
  hkSynced,
}: {
  label: string;
  icon: string;
  emojis: string[];
  value: number | null;
  min: number;
  max: number;
  skippable?: boolean;
  isSkipped: boolean;
  onSkip: () => void;
  onChange: (v: number) => void;
  hkSynced?: boolean;
}) {
  const current = value ?? Math.round((min + max) / 2);
  const fraction = (current - min) / (max - min);
  const trackWidth = width - 80;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
        {hkSynced && <Text style={styles.hkBadge}>⌚ synced</Text>}
        {skippable && (
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        )}
      </View>
      {!isSkipped && (
        <>
          <View style={styles.emojiRow}>
            <Text style={styles.emoji}>{emojis[0]}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.emoji}>{emojis[2]}</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View
              style={[styles.sliderFill, { width: `${fraction * 100}%` }]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: fraction * (trackWidth - 28) },
              ]}
            >
              <Text style={styles.thumbText}>{current}</Text>
            </View>
          </View>
          <View style={styles.tapZones}>
            {Array.from({ length: max - min + 1 }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={{ flex: 1, height: 30 }}
                onPress={() => onChange(min + i)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

/* ─── Stepper Card ─── */

function StepperCard({
  label,
  icon,
  value,
  min,
  max,
  step,
  unit,
  quickValues,
  onChange,
  hkSynced,
}: {
  label: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  quickValues: number[];
  onChange: (v: number) => void;
  hkSynced?: boolean;
}) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const displayValue =
    value % 1 === 0 ? `${value}${unit}` : `${value.toFixed(1)}${unit}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
        {hkSynced && <Text style={styles.hkBadge}>⌚ synced</Text>}
      </View>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={decrement}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{displayValue}</Text>
        <TouchableOpacity style={styles.stepperBtn} onPress={increment}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickRow}>
        {quickValues.map((qv) => (
          <TouchableOpacity key={qv} onPress={() => onChange(qv)}>
            <Text
              style={[
                styles.quickValue,
                value === qv && styles.quickValueActive,
              ]}
            >
              {qv}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ─── Chip Card ─── */

function ChipCard({
  label,
  icon,
  options,
  value,
  unitLabel,
  onChange,
  hkSynced,
}: {
  label: string;
  icon: string;
  options: string[];
  value: string;
  unitLabel?: string;
  onChange: (v: string) => void;
  hkSynced?: boolean;
}) {
  const displayUnit = unitLabel
    ? `${value === "0" ? "0" : value} ${unitLabel}`
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
        {hkSynced && <Text style={styles.hkBadge}>⌚ synced</Text>}
      </View>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipActive]}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[styles.chipText, value === opt && styles.chipTextActive]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {displayUnit && <Text style={styles.chipUnitLabel}>{displayUnit}</Text>}
    </View>
  );
}

/* ─── Recommendation Card ─── */

const CATEGORY_COLORS: Record<string, string> = {
  sleep: "#8B5CF6",
  movement: "#10B981",
  stress: "#F59E0B",
  mindfulness: "#6366F1",
  energy: "#EF4444",
  social: "#3B82F6",
};

function RecommendationCard({
  rec,
  isFirst,
}: {
  rec: Recommendation;
  isFirst?: boolean;
}) {
  const accent = CATEGORY_COLORS[rec.category] ?? TEAL;
  const openYouTube = () => {
    WebBrowser.openBrowserAsync(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtubeQuery)}`,
    );
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <View style={styles.recCard}>
      {isFirst && (
        <View style={styles.recBadgeRow}>
          <View style={styles.recBadge}>
            <Text style={styles.recBadgeText}>PERFECT FOR YOU</Text>
          </View>
        </View>
      )}

      <View style={styles.recCardInner}>
        {/* Thumbnail */}
        <View style={[styles.recThumb, { backgroundColor: accent + "22" }]}>
          <Text style={styles.recThumbIcon}>{rec.icon}</Text>
          <View style={[styles.recThumbAccent, { backgroundColor: accent }]} />
        </View>

        {/* Info */}
        <View style={styles.recCardInfo}>
          <Text style={styles.recCardTitle} numberOfLines={2}>
            {rec.title}
          </Text>
          <View style={styles.recTagRow}>
            <View style={[styles.recTag, { backgroundColor: accent + "18" }]}>
              <Text style={[styles.recTagText, { color: accent }]}>
                {capitalize(rec.category)}
              </Text>
            </View>
            <View style={styles.recTagGray}>
              <Text style={styles.recTagGrayText}>{rec.level}</Text>
            </View>
            <View style={styles.recTagGray}>
              <Text style={styles.recTagGrayText}>{rec.duration}</Text>
            </View>
          </View>
          <Text style={styles.recCardBody} numberOfLines={2}>
            {rec.body}
          </Text>
        </View>

        {/* Play button */}
        <TouchableOpacity
          style={[styles.ytPlayBtn, { backgroundColor: TEAL }]}
          onPress={openYouTube}
        >
          <Text style={styles.ytPlayIcon}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginBottom: 12,
  },

  // HealthKit banner
  hkBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: TEAL_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  hkBannerIcon: {
    fontSize: 22,
  },
  hkBannerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEAL_DARK,
  },
  hkBannerSub: {
    fontSize: 12,
    color: TEAL_DARK,
    opacity: 0.8,
  },
  hkBannerText: {
    fontSize: 13,
    color: TEAL_DARK,
    fontWeight: "500",
  },

  // Per-card sync badge
  hkBadge: {
    fontSize: 11,
    color: TEAL,
    fontWeight: "600",
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },

  // Steps context card
  hkContextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: GRAY_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  hkContextIcon: {
    fontSize: 22,
  },
  hkContextLabel: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 4,
  },
  hkContextBarTrack: {
    height: 5,
    backgroundColor: TRACK_BG,
    borderRadius: 3,
    width: width - 140,
  },
  hkContextBarFill: {
    height: 5,
    backgroundColor: TEAL,
    borderRadius: 3,
  },
  hkContextValue: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK_TEXT,
  },

  // Progress
  progressSection: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: GRAY_TEXT,
  },
  progressCount: {
    fontSize: 13,
    color: GRAY_TEXT,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  dotFilled: {
    backgroundColor: TEAL,
  },
  dotEmpty: {
    backgroundColor: TRACK_BG,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK_TEXT,
  },

  // Slider
  emojiRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  emoji: {
    fontSize: 22,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: TRACK_BG,
    borderRadius: 3,
    position: "relative",
    marginTop: 8,
  },
  sliderFill: {
    height: 6,
    backgroundColor: TEAL,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  tapZones: {
    flexDirection: "row",
    marginTop: 4,
  },

  // Skip
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 13,
    color: GRAY_TEXT,
    fontWeight: "500",
  },

  // Stepper
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 12,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 22,
    color: DARK_TEXT,
    fontWeight: "500",
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: "600",
    color: DARK_TEXT,
    minWidth: 80,
    textAlign: "center",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  quickValue: {
    fontSize: 13,
    color: GRAY_TEXT,
    fontWeight: "500",
  },
  quickValueActive: {
    color: TEAL,
    fontWeight: "700",
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  chipTextActive: {
    color: "#fff",
  },
  chipUnitLabel: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: "center",
  },

  // Buttons
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  saveButtonSaved: {
    backgroundColor: TEAL_DARK,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  recsButton: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  recsButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEAL_DARK,
  },
  recsIcon: {
    fontSize: 16,
  },

  // Recommendations section
  recsSection: {
    marginTop: 4,
  },
  recsSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 4,
  },
  recsSectionSub: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 16,
  },

  // Recommendation card — screenshot style
  recCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  recBadgeRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  recBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.6,
  },
  recCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  recThumb: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  recThumbIcon: {
    fontSize: 30,
  },
  recThumbAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  recCardInfo: {
    flex: 1,
  },
  recCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 5,
    lineHeight: 19,
  },
  recTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 6,
  },
  recTag: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  recTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  recTagGray: {
    backgroundColor: GRAY_BG,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  recTagGrayText: {
    fontSize: 11,
    fontWeight: "500",
    color: GRAY_TEXT,
  },
  recCardBody: {
    fontSize: 12,
    color: GRAY_TEXT,
    lineHeight: 17,
  },
  recCardIcon: {
    fontSize: 24,
  },

  // YouTube play button
  ytPlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ytPlayIcon: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 2,
  },
  ytButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ytButtonIcon: {
    fontSize: 11,
    color: GRAY_TEXT,
  },
  ytButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const TEAL = '#0D9488';
const TEAL_DARK = '#0F766E';
const TEAL_LIGHT = '#E6FAF5';
const GRAY_BG = '#F3F4F6';
const GRAY_TEXT = '#6B7280';
const DARK_TEXT = '#1F2937';
const TRACK_BG = '#E5E7EB';

const TOTAL_QUESTIONS = 9;

// Slider question config
const SLIDER_QUESTIONS = [
  {
    key: 'feeling',
    label: 'How are you feeling?',
    icon: '📊',
    emojis: ['😞', '😐', '😊'],
    min: 1,
    max: 10,
    defaultVal: 7,
  },
  {
    key: 'energy',
    label: 'How energized?',
    icon: '📊',
    emojis: ['😴', '😐', '⚡'],
    min: 1,
    max: 10,
    defaultVal: 6,
  },
  {
    key: 'stress',
    label: 'How stressed?',
    icon: '📊',
    emojis: ['😌', '😐', '🔥'],
    min: 1,
    max: 10,
    defaultVal: 4,
  },
  {
    key: 'sleep_quality',
    label: 'Sleep quality?',
    icon: '📊',
    emojis: ['😴', '😐', '😊'],
    min: 1,
    max: 10,
    defaultVal: 8,
    skippable: true,
  },
] as const;

// Stepper question config
const STEPPER_QUESTIONS = [
  {
    key: 'sleep_hours',
    label: 'Sleep hours',
    icon: '🛏️',
    min: 0,
    max: 16,
    step: 0.5,
    defaultVal: 7.5,
    unit: 'h',
    quickValues: [0, 6, 7.5, 9, 12],
  },
  {
    key: 'productive_hours',
    label: 'Productive hours',
    icon: '📊',
    min: 0,
    max: 16,
    step: 0.5,
    defaultVal: 6,
    unit: 'h',
    quickValues: [0, 4, 6, 8, 12],
  },
] as const;

// Chip question config
const CHIP_QUESTIONS = [
  {
    key: 'social',
    label: 'Social interactions',
    icon: '💬',
    options: ['0', '1', '2', '3', '5+'],
    defaultVal: '3',
  },
  {
    key: 'exercise',
    label: 'Exercise',
    icon: '🏃',
    options: ['0', '15', '30', '60', '120+'],
    defaultVal: '30',
    unitLabel: 'minutes',
  },
  {
    key: 'meditation',
    label: 'Meditation',
    icon: '🧘',
    options: ['0', '5', '10', '20+'],
    defaultVal: '0',
    unitLabel: 'minutes',
  },
] as const;

type CheckinData = {
  feeling: number;
  energy: number;
  stress: number;
  sleep_quality: number | null;
  sleep_hours: number;
  productive_hours: number;
  social: string;
  exercise: string;
  meditation: string;
};

export default function DailyCheckinScreen() {
  const router = useRouter();
  const [data, setData] = useState<CheckinData>({
    feeling: 7,
    energy: 6,
    stress: 4,
    sleep_quality: 8,
    sleep_hours: 7.5,
    productive_hours: 6,
    social: '3',
    exercise: '30',
    meditation: '0',
  });
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const answeredCount = Object.keys(data).filter(
    (k) => !skipped.has(k)
  ).length;
  const progress = Math.min(answeredCount, TOTAL_QUESTIONS);

  const updateField = useCallback(
    <K extends keyof CheckinData>(key: K, value: CheckinData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setSkipped((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    []
  );

  const skipField = useCallback((key: string) => {
    setSkipped((prev) => new Set(prev).add(key));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="home" size={22} color={TEAL_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-in</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>Get personalized recommendations</Text>

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
            skippable={'skippable' in q && q.skippable}
            isSkipped={skipped.has(q.key)}
            onSkip={() => skipField(q.key)}
            onChange={(v) => updateField(q.key, v)}
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
            unitLabel={'unitLabel' in q ? q.unitLabel : undefined}
            onChange={(v) => updateField(q.key, v)}
          />
        ))}

        {/* Buttons */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save & Continue Later</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.recsButton}>
          <Text style={styles.recsButtonText}>Get My Recommendations</Text>
          <Text style={styles.recsIcon}>✨</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────── Slider Card ───────── */

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
}) {
  const current = value ?? Math.round((min + max) / 2);
  const fraction = (current - min) / (max - min);
  const trackWidth = width - 80; // account for card padding

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
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
          {/* Tap zones for changing value */}
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

/* ───────── Stepper Card ───────── */

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

/* ───────── Chip Card ───────── */

function ChipCard({
  label,
  icon,
  options,
  value,
  unitLabel,
  onChange,
}: {
  label: string;
  icon: string;
  options: string[];
  value: string;
  unitLabel?: string;
  onChange: (v: string) => void;
}) {
  const displayUnit = unitLabel
    ? `${value === '0' ? '0' : value} ${unitLabel}`
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipActive]}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[
                styles.chipText,
                value === opt && styles.chipTextActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {displayUnit && (
        <Text style={styles.chipUnitLabel}>{displayUnit}</Text>
      )}
    </View>
  );
}

/* ───────── Styles ───────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_TEXT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginBottom: 16,
  },

  // Progress
  progressSection: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK_TEXT,
  },

  // Slider
  emojiRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 22,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: TRACK_BG,
    borderRadius: 3,
    position: 'relative',
    marginTop: 8,
  },
  sliderFill: {
    height: 6,
    backgroundColor: TEAL,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tapZones: {
    flexDirection: 'row',
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
    fontWeight: '500',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '600',
    color: DARK_TEXT,
    minWidth: 80,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  quickValue: {
    fontSize: 13,
    color: GRAY_TEXT,
    fontWeight: '500',
  },
  quickValueActive: {
    color: TEAL,
    fontWeight: '700',
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  chipTextActive: {
    color: '#fff',
  },
  chipUnitLabel: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
  },

  // Buttons
  saveButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  recsButton: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  recsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEAL_DARK,
  },
  recsIcon: {
    fontSize: 16,
  },
});

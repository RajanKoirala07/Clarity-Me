import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const TEAL = '#0D9488';
const TEAL_DARK = '#0F766E';
const TEAL_LIGHT = '#CCFBF1';
const GRAY_BG = '#F3F4F6';
const GRAY_TEXT = '#6B7280';
const DARK_TEXT = '#1F2937';

type SoundOption = 'silence' | 'ocean' | 'forest' | 'piano';
type DurationOption = 15 | 25 | 45;
type GoalOption = 'Study' | 'Deep work' | 'Reading' | 'Writing';

const BAR_DATA = [
  { day: 'Mon', value: 0.3 },
  { day: 'Tue', value: 0.5 },
  { day: 'Wed', value: 0.4 },
  { day: 'Thu', value: 0.6 },
  { day: 'Fri', value: 0.45 },
  { day: 'Sat', value: 1.0 },
  { day: 'Sun', value: 0.2 },
];

export default function FocusScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState<DurationOption>(25);
  const [sound, setSound] = useState<SoundOption>('ocean');
  const [goals, setGoals] = useState<GoalOption[]>(['Study']);
  const [muteNotifications, setMuteNotifications] = useState(true);
  const [blockApps, setBlockApps] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync secondsLeft when duration chip changes (only when not running)
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(duration * 60);
    }
  }, [duration, isRunning]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = useCallback(() => {
    if (secondsLeft === 0) {
      // Reset if finished
      setSecondsLeft(duration * 60);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  }, [secondsLeft, duration]);

  const startSession = useCallback(() => {
    setSecondsLeft(duration * 60);
    setIsRunning(true);
  }, [duration]);

  const toggleGoal = (goal: GoalOption) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const formatTime = (totalSeconds: number) => {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Focus Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <Text style={styles.title}>Focus Mode</Text>
        <Text style={styles.subtitle}>
          Stay focused with calming sound and zero distractions.
        </Text>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerRing}>
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.playButton} onPress={toggleTimer}>
            <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#fff" />
          </TouchableOpacity>
          {/* Duration Chips */}
          <View style={styles.durationRow}>
            {([15, 25, 45] as DurationOption[]).map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.durationChip,
                  duration === d && styles.durationChipActive,
                ]}
                disabled={isRunning}
                onPress={() => setDuration(d)}
              >
                <Text
                  style={[
                    styles.durationChipText,
                    duration === d && styles.durationChipTextActive,
                  ]}
                >
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Background Sound */}
        <Text style={styles.sectionTitle}>Background Sound</Text>
        <View style={styles.soundGrid}>
          <SoundTile
            icon={<Ionicons name="volume-mute" size={28} color={sound === 'silence' ? TEAL : GRAY_TEXT} />}
            label="Silence"
            active={sound === 'silence'}
            onPress={() => setSound('silence')}
          />
          <SoundTile
            icon={<MaterialCommunityIcons name="waves" size={28} color={sound === 'ocean' ? TEAL : GRAY_TEXT} />}
            label="Ocean Waves"
            active={sound === 'ocean'}
            onPress={() => setSound('ocean')}
          />
          <SoundTile
            icon={<Ionicons name="rainy" size={28} color={sound === 'forest' ? TEAL : GRAY_TEXT} />}
            label="Forest Rain"
            active={sound === 'forest'}
            onPress={() => setSound('forest')}
          />
          <SoundTile
            icon={<FontAwesome5 name="music" size={24} color={sound === 'piano' ? TEAL : GRAY_TEXT} />}
            label="Soft Piano"
            active={sound === 'piano'}
            onPress={() => setSound('piano')}
          />
        </View>

        {/* Focus Goal */}
        <Text style={styles.sectionTitle}>Focus Goal</Text>
        <View style={styles.goalRow}>
          {(['Study', 'Deep work', 'Reading', 'Writing'] as GoalOption[]).map(
            (goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalChip,
                  goals.includes(goal) && styles.goalChipActive,
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text
                  style={[
                    styles.goalChipText,
                    goals.includes(goal) && styles.goalChipTextActive,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Distraction Control */}
        <Text style={styles.sectionTitle}>Distraction Control</Text>
        <View style={styles.controlCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlLabel}>Mute notifications during session</Text>
              <Text style={styles.controlDesc}>
                All notifications will be silenced until session ends
              </Text>
            </View>
            <Switch
              value={muteNotifications}
              onValueChange={setMuteNotifications}
              trackColor={{ false: '#D1D5DB', true: TEAL }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlLabel}>Block distracting apps</Text>
              <Text style={styles.controlDesc}>
                Restrict access to social media and games
              </Text>
            </View>
            <Switch
              value={blockApps}
              onValueChange={setBlockApps}
              trackColor={{ false: '#D1D5DB', true: TEAL }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.todayHeader}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <Text style={styles.todayTime}>45 min</Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {BAR_DATA.map((bar) => (
              <View key={bar.day} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${bar.value * 100}%`,
                        backgroundColor: bar.day === 'Sat' ? TEAL : TEAL_LIGHT,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{bar.day}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartSubtext}>This week: 3h 25min focused</Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={startSession}>
          <Text style={styles.startButtonText}>
            {isRunning ? 'Restart Focus Session' : 'Start Focus Session'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SoundTile({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.soundTile, active && styles.soundTileActive]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.soundLabel, active && styles.soundLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_TEXT,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginTop: 4,
    marginBottom: 20,
  },

  // Timer
  timerCard: {
    backgroundColor: TEAL_DARK,
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  timerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: TEAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 44,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  durationChipActive: {
    backgroundColor: '#fff',
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  durationChipTextActive: {
    color: TEAL_DARK,
  },

  // Section
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 12,
  },

  // Sound
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  soundTile: {
    width: (width - 52) / 2,
    height: 80,
    borderRadius: 14,
    backgroundColor: GRAY_BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  soundTileActive: {
    backgroundColor: TEAL_LIGHT,
    borderWidth: 2,
    borderColor: TEAL,
  },
  soundLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY_TEXT,
  },
  soundLabelActive: {
    color: TEAL_DARK,
  },

  // Goals
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
  },
  goalChipActive: {
    backgroundColor: TEAL,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY_TEXT,
  },
  goalChipTextActive: {
    color: '#fff',
  },

  // Distraction Control
  controlCard: {
    backgroundColor: '#fff',
    marginBottom: 28,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  controlInfo: {
    flex: 1,
    marginRight: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  controlDesc: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Today's Focus
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  todayTime: {
    fontSize: 15,
    fontWeight: '600',
    color: TEAL,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    height: 100,
    marginBottom: 8,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 28,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
  },
  chartSubtext: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 4,
  },

  // Start Button
  startButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

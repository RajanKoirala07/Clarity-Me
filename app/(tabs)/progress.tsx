import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TEAL = '#3D8B85';
const BG = '#D6EEEC';
const GRAY_TEXT = '#6B7280';
const DARK_TEXT = '#1F2937';

const CHART_WIDTH = Dimensions.get('window').width - 80;
const CHART_HEIGHT = 90;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATA = [30, 60, 45, 70, 50, 80, 65];

function WeeklyChart() {
  const maxVal = Math.max(...DATA);
  const points = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - (v / maxVal) * CHART_HEIGHT,
  }));

  // Build line segments between consecutive points
  const segments = points.slice(0, -1).map((p, i) => {
    const next = points[i + 1];
    const dx = next.x - p.x;
    const dy = next.y - p.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x: p.x, y: p.y, length, angle };
  });

  return (
    <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT + 24 }}>
      {/* Grid line */}
      <View style={[styles.gridLine, { top: CHART_HEIGHT / 2 }]} />

      {/* Line segments */}
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: seg.x,
            top: seg.y,
            width: seg.length,
            height: 2.5,
            backgroundColor: TEAL,
            borderRadius: 2,
            transform: [{ rotate: `${seg.angle}deg` }],
            transformOrigin: '0 50%',
          }}
        />
      ))}

      {/* Dots */}
      {points.map((p, i) => (
        <View
          key={i}
          style={[styles.chartDot, { left: p.x - 4, top: p.y - 4 }]}
        />
      ))}

      {/* Day labels */}
      {points.map((p, i) => (
        <Text
          key={i}
          style={[styles.dayLabel, { left: p.x - 14, top: CHART_HEIGHT + 6 }]}
        >
          {DAYS[i]}
        </Text>
      ))}
    </View>
  );
}

const achievements = [
  { label: 'Micro Master', unlocked: true },
  { label: 'Sensory Explorer', unlocked: false },
  { label: 'Streak 7', unlocked: false },
];

const sessions = [
  { title: 'Morning Movement', when: 'Today • 5 min' },
  { title: 'Breathe & Focus', when: 'Yesterday • 3 min' },
  { title: 'Sensory Grounding', when: '2 days ago • 7 min' },
  { title: 'Quick Reset', when: '3 days ago • 2 min' },
  { title: 'Body Scan', when: '4 days ago • 10 min' },
  { title: 'Body Scan', when: '4 days ago • 10 min' },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Clarity & Me</Text>
          <Text style={styles.tagline}>Occupational Therapy</Text>
        </View>

        <Text style={styles.pageTitle}>Your Progress</Text>

        {/* Streak Banner */}
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>7-day streak</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Total{'\n'}Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>60%</Text>
            <Text style={styles.statLabel}>Movement</Text>
          </View>
        </View>

        {/* Weekly Practice Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Weekly Practice</Text>
          <View style={styles.chartWrapper}>
            <WeeklyChart />
          </View>
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
          {achievements.map((a, i) => (
            <View key={i} style={styles.achievementItem}>
              <View style={[styles.achievementBadge, a.unlocked && styles.achievementBadgeActive]}>
                <Ionicons
                  name={a.unlocked ? 'ribbon' : 'ribbon-outline'}
                  size={28}
                  color={a.unlocked ? '#fff' : '#D1D5DB'}
                />
              </View>
              <Text style={styles.achievementLabel}>{a.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recent Sessions */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Sessions</Text>
        {sessions.map((s, i) => (
          <View key={i} style={styles.sessionCard}>
            <View>
              <Text style={styles.sessionTitle}>{s.title}</Text>
              <Text style={styles.sessionWhen}>{s.when}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={GRAY_TEXT} />
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 6,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E4A4A',
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E4A4A',
    marginTop: 2,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_TEXT,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Streak
  streakBanner: {
    backgroundColor: '#F5C842',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  streakText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E4A4A',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK_TEXT,
  },
  statLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginTop: 2,
  },

  // Chart
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartWrapper: {
    marginTop: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  dayLabel: {
    position: 'absolute',
    width: 28,
    fontSize: 10,
    color: GRAY_TEXT,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 12,
  },

  // Achievements
  achievementsScroll: {
    marginBottom: 4,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  achievementBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  achievementBadgeActive: {
    backgroundColor: TEAL,
  },
  achievementLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
    textAlign: 'center',
  },

  // Sessions
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  sessionWhen: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 2,
  },
});

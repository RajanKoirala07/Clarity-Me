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
import { useAppTheme } from '@/context/ThemeContext';
import type { ThemeColors } from '@/context/ThemeContext';

const CHART_WIDTH = Dimensions.get('window').width - 80;
const CHART_HEIGHT = 90;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATA = [30, 60, 45, 70, 50, 80, 65];

const styles = StyleSheet.create({
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1 },
  chartDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  dayLabel: { position: 'absolute', width: 28, fontSize: 10, textAlign: 'center' },
});

function WeeklyChart({ colors }: { colors: ThemeColors }) {
  const maxVal = Math.max(...DATA);
  const points = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - (v / maxVal) * CHART_HEIGHT,
  }));

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
      <View
        style={[
          styles.gridLine,
          { top: CHART_HEIGHT / 2, backgroundColor: colors.border },
        ]}
      />

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
            backgroundColor: colors.teal,
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
          style={[
            styles.chartDot,
            { left: p.x - 4, top: p.y - 4, backgroundColor: colors.teal },
          ]}
        />
      ))}

      {/* Day labels */}
      {points.map((p, i) => (
        <Text
          key={i}
          style={[
            styles.dayLabel,
            { left: p.x - 14, top: CHART_HEIGHT + 6, color: colors.textMuted },
          ]}
        >
          {DAYS[i]}
        </Text>
      ))}
    </View>
  );
}

const sessions = [
  { title: 'Morning Movement', when: 'Today • 5 min' },
  { title: 'Breathe & Focus', when: 'Yesterday • 3 min' },
  { title: 'Sensory Grounding', when: '2 days ago • 7 min' },
  { title: 'Quick Reset', when: '3 days ago • 2 min' },
  { title: 'Body Scan', when: '4 days ago • 10 min' },
  { title: 'Body Scan', when: '4 days ago • 10 min' },
];

export default function ProgressScreen() {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* Header */}
        <View style={s.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.appName}>Clarity & Me</Text>
          <Text style={s.tagline}>Occupational Therapy</Text>
        </View>

        <Text style={s.pageTitle}>Your Progress</Text>

        {/* Streak Banner */}
        <View style={s.streakBanner}>
          <Text style={s.streakText}>7-day streak</Text>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNumber}>42</Text>
            <Text style={s.statLabel}>Total{'\n'}Sessions</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>156</Text>
            <Text style={s.statLabel}>Minutes</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>60%</Text>
            <Text style={s.statLabel}>Movement</Text>
          </View>
        </View>

        {/* Weekly Practice Chart */}
        <View style={s.chartCard}>
          <Text style={s.sectionTitle}>Weekly Practice</Text>
          <View style={s.chartWrapper}>
            <WeeklyChart colors={colors} />
          </View>
        </View>

        {/* Recent Sessions */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Recent Sessions</Text>
        {sessions.map((session, i) => (
          <View key={i} style={s.sessionCard}>
            <View>
              <Text style={s.sessionTitle}>{session.title}</Text>
              <Text style={s.sessionWhen}>{session.when}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.cardAlt,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },

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
      color: colors.text,
    },
    tagline: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 2,
    },

    pageTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },

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

    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 2,
    },

    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    chartWrapper: {
      marginTop: 8,
      alignItems: 'center',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },

    sessionCard: {
      backgroundColor: colors.surface,
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
      color: colors.text,
    },
    sessionWhen: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
}

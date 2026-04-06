import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TEAL = '#3D8B85';
const TEAL_DARK = '#0F766E';
const TEAL_LIGHT = '#E6FAF5';
const BG = '#D6EEEC';
const GRAY_TEXT = '#6B7280';
const DARK_TEXT = '#1F2937';

const CATEGORIES = ['All', 'Sensory', 'Motor', 'Breathing', 'Mindfulness'];

const SESSIONS = [
  {
    id: '1',
    title: 'Morning Movement',
    description: 'Gentle full-body wake-up routine to start your day.',
    category: 'Motor',
    duration: '5 min',
    difficulty: 'Easy',
    icon: 'sunny-outline' as const,
    color: '#FEF9C3',
    iconColor: '#EAB308',
  },
  {
    id: '2',
    title: 'Deep Breathing',
    description: 'Calm your nervous system with guided breath work.',
    category: 'Breathing',
    duration: '4 min',
    difficulty: 'Easy',
    icon: 'leaf-outline' as const,
    color: TEAL_LIGHT,
    iconColor: TEAL,
  },
  {
    id: '3',
    title: 'Sensory Grounding',
    description: 'Use your senses to anchor yourself to the present.',
    category: 'Sensory',
    duration: '7 min',
    difficulty: 'Medium',
    icon: 'hand-left-outline' as const,
    color: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  {
    id: '4',
    title: 'Body Scan',
    description: 'A slow scan from head to toe to release tension.',
    category: 'Mindfulness',
    duration: '10 min',
    difficulty: 'Medium',
    icon: 'body-outline' as const,
    color: '#FEE2E2',
    iconColor: '#EF4444',
  },
  {
    id: '5',
    title: 'Quick Reset',
    description: 'A 2-minute recharge when you feel overwhelmed.',
    category: 'Breathing',
    duration: '2 min',
    difficulty: 'Easy',
    icon: 'refresh-outline' as const,
    color: '#DBEAFE',
    iconColor: '#3B82F6',
  },
  {
    id: '6',
    title: 'Tactile Awareness',
    description: 'Explore textures to improve sensory processing.',
    category: 'Sensory',
    duration: '6 min',
    difficulty: 'Medium',
    icon: 'finger-print-outline' as const,
    color: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: '7',
    title: 'Coordination Flow',
    description: 'Simple movement sequences to build motor coordination.',
    category: 'Motor',
    duration: '8 min',
    difficulty: 'Hard',
    icon: 'walk-outline' as const,
    color: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    id: '8',
    title: 'Mindful Observation',
    description: 'Slow down and notice the world around you.',
    category: 'Mindfulness',
    duration: '5 min',
    difficulty: 'Easy',
    icon: 'eye-outline' as const,
    color: TEAL_LIGHT,
    iconColor: TEAL_DARK,
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#16A34A',
  Medium: '#D97706',
  Hard: '#EF4444',
};

export default function LibraryScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? SESSIONS
      : SESSIONS.filter((s) => s.category === activeCategory);

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

        <Text style={styles.pageTitle}>Library</Text>
        <Text style={styles.pageSubtitle}>Explore exercises tailored for you</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Count */}
        <Text style={styles.countText}>{filtered.length} sessions</Text>

        {/* Session Cards */}
        {filtered.map((session) => (
          <TouchableOpacity key={session.id} style={styles.card} activeOpacity={0.85}>
            <View style={[styles.cardIcon, { backgroundColor: session.color }]}>
              <Ionicons name={session.icon} size={26} color={session.iconColor} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{session.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{session.category}</Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{session.description}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color={GRAY_TEXT} />
                  <Text style={styles.metaText}>{session.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <View style={[styles.difficultyDot, { backgroundColor: DIFFICULTY_COLOR[session.difficulty] }]} />
                  <Text style={styles.metaText}>{session.difficulty}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={GRAY_TEXT} style={styles.chevron} />
          </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: '800',
    color: DARK_TEXT,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // Filter
  filterScroll: {
    marginBottom: 8,
  },
  filterContent: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_TEXT,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  countText: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 14,
    marginTop: 6,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_TEXT,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAL_DARK,
  },
  cardDesc: {
    fontSize: 12,
    color: GRAY_TEXT,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: GRAY_TEXT,
  },
  difficultyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chevron: {
    marginLeft: 6,
  },
});

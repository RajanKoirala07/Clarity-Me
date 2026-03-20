import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const TEAL = '#3D8B85';
const BG = '#D6EEEC';
const LIGHT_PINK = '#F5D5E8';
const LIGHT_BLUE = '#B8E6F0';
const LIGHT_PURPLE = '#E8D5F2';
const LIGHT_GREEN = '#D5E8D5';
const LIGHT_ORANGE = '#FFF0E0';

interface Recommendation {
  id: string;
  title: string;
  category: string;
  type: string;
  duration: string;
  image: any;
  isPerfect?: boolean;
  description: string;
}

interface GridItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  icon: string;
  color: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: '3min Rhythmic Reset',
    category: 'Movement',
    type: 'Beginner',
    duration: '3+',
    image: require('@/assets/images/icon.png'),
    isPerfect: true,
    description: 'Active session matches your wellness',
  },
  {
    id: '2',
    title: '2min Breath + Sound',
    category: 'Sound',
    type: 'Calm',
    duration: '2-5',
    image: require('@/assets/images/icon.png'),
    description: 'Quick reset for the energy',
  },
];

const GRID_ITEMS: GridItem[] = [
  {
    id: '3',
    title: 'Focus Flow',
    category: 'Focus',
    duration: '4:30',
    icon: '🌅',
    color: LIGHT_ORANGE,
  },
  {
    id: '4',
    title: 'Grounding',
    category: 'Calm',
    duration: '5:15',
    icon: '🌿',
    color: LIGHT_GREEN,
  },
  {
    id: '5',
    title: 'Energy Boost',
    category: 'Energy',
    duration: '2:45',
    icon: '⚡',
    color: LIGHT_PINK,
  },
  {
    id: '6',
    title: 'Mindful Move',
    category: 'Movement',
    duration: '6:20',
    icon: '🧘',
    color: LIGHT_PURPLE,
  },
];

type FilterValue = '1-3min' | '3-5min' | 'high' | 'low';

export default function HomeScreen() {
  const [selectedFilters, setSelectedFilters] = useState<FilterValue[]>([]);

  const toggleFilter = (filter: FilterValue) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Clarity & Me</Text>
          <Text style={styles.subtitle}>Occupational Therapy</Text>
        </View>

        {/* Recommendations Title */}
        <View style={styles.titleSection}>
          <Text style={styles.recommendationsTitle}>Recommendations for You</Text>
        </View>

        {/* Featured Cards */}
        <View style={styles.cardsContainer}>
          {RECOMMENDATIONS.map((rec) => (
            <RecommendationCard key={rec.id} item={rec} />
          ))}
        </View>

        {/* More Options Header */}
        <View style={styles.moreOptionsHeader}>
          <Text style={styles.moreOptionsTitle}>More Options</Text>
          <TouchableOpacity>
            <AntDesign name="right" size={20} color={TEAL} />
          </TouchableOpacity>
        </View>

        {/* Grid Items */}
        <View style={styles.gridContainer}>
          {GRID_ITEMS.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by</Text>

          {/* Duration Filters */}
          <View style={styles.filterRow}>
            <FilterButton
              label="1-3min"
              isSelected={selectedFilters.includes('1-3min')}
              onPress={() => toggleFilter('1-3min')}
            />
            <FilterButton
              label="3-5min"
              isSelected={selectedFilters.includes('3-5min')}
              onPress={() => toggleFilter('3-5min')}
            />
          </View>

          {/* Energy Filters */}
          <View style={styles.filterRow}>
            <FilterButton
              label="High Energy"
              isSelected={selectedFilters.includes('high')}
              onPress={() => toggleFilter('high')}
            />
            <FilterButton
              label="Low Energy"
              isSelected={selectedFilters.includes('low')}
              onPress={() => toggleFilter('low')}
            />
          </View>
        </View>

        {/* Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
    >
      {/* Perfect Badge */}
      {item.isPerfect && (
        <View style={styles.perfectBadge}>
          <Text style={styles.perfectBadgeText}>PERFECT FOR YOU</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          {/* Tags */}
          <View style={styles.tagContainer}>
            <Tag label={item.category} />
            <Tag label={item.type} />
            <Text style={styles.duration}>{item.duration} min</Text>
          </View>

          {/* Description */}
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </View>

      {/* Play Button */}
      <TouchableOpacity style={styles.playButton}>
        <MaterialCommunityIcons name="play" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function GridCard({ item }: { item: GridItem }) {
  return (
    <TouchableOpacity style={[styles.gridCard, { backgroundColor: item.color }]} activeOpacity={0.7}>
      <View style={styles.gridCardContent}>
        <Text style={styles.gridCardIcon}>{item.icon}</Text>
        <Text style={styles.gridCardTitle}>{item.title}</Text>
        <Text style={styles.gridCardCategory}>{item.category}</Text>
        <Text style={styles.gridCardDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.gridPlayButton}>
        <MaterialCommunityIcons name="play" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function FilterButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  perfectBadge: {
    backgroundColor: '#FFB84D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  perfectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  cardLeft: {
    marginRight: 12,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  duration: {
    fontSize: 11,
    color: '#999',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  playButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: TEAL,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  moreOptionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    minHeight: 160,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardContent: {
    flex: 1,
  },
  gridCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  gridCardCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  gridCardDuration: {
    fontSize: 12,
    color: '#999',
  },
  gridPlayButton: {
    backgroundColor: TEAL,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});

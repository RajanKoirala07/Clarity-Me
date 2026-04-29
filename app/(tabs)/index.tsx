import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, SERVER_URL } from "@/services/api";
import { useAppTheme } from "@/context/ThemeContext";
import type { ThemeColors } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = Math.round((SCREEN_WIDTH - 32) * (9 / 16));

interface ApiVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  video_url: string;
  thumbnailUrl?: string;
}

interface GridItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  youtubeQueries: string[];
}

const CATEGORY_STYLE: Record<string, { emoji: string; bgColor: string; type: string }> = {
  sensory:   { emoji: "👁️", bgColor: "#EDE9FE", type: "Sensory" },
  motor:     { emoji: "💪", bgColor: "#DCFCE7", type: "Motor" },
  breathing: { emoji: "🌸", bgColor: "#E6FAF5", type: "Breathing" },
};
const FALLBACK_STYLE = { emoji: "🎯", bgColor: "#FFF0E0", type: "Exercise" };

const GRID_ITEMS: GridItem[] = [
  {
    id: "g1", title: "Focus Flow", category: "Focus", icon: "🌅", color: "#FFF0E0",
    youtubeQueries: [
      "focus flow music for studying concentration",
      "deep focus music brain waves study",
      "focus flow meditation music 30 minutes",
      "concentration boost focus music therapy",
    ],
  },
  {
    id: "g2", title: "Grounding", category: "Calm", icon: "🌿", color: "#D5E8D5",
    youtubeQueries: [
      "grounding techniques anxiety relief meditation",
      "5 senses grounding mindfulness exercise",
      "earth grounding meditation calm",
      "grounding exercises for stress relief",
    ],
  },
  {
    id: "g3", title: "Energy Boost", category: "Energy", icon: "⚡", color: "#F5D5E8",
    youtubeQueries: [
      "morning energy boost workout 10 minutes",
      "quick energy boost yoga flow",
      "energizing stretches office desk workout",
      "energy boost exercise no equipment",
    ],
  },
  {
    id: "g4", title: "Mindful Move", category: "Movement", icon: "🧘", color: "#E8D5F2",
    youtubeQueries: [
      "mindful movement yoga therapy",
      "slow mindful yoga flow meditation",
      "mindful movement for mental health",
      "gentle mindful movement exercise",
    ],
  },
];

function parseVideoList(data: unknown): ApiVideo[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["data", "videos", "result", "items"]) {
      if (Array.isArray(d[key])) return d[key] as ApiVideo[];
    }
  }
  return [];
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);

  const [recommendations, setRecommendations] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ApiVideo | null>(null);

  // Pick one random query per grid item on each mount
  const [gridQueries] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      GRID_ITEMS.map((item) => [
        item.id,
        item.youtubeQueries[Math.floor(Math.random() * item.youtubeQueries.length)],
      ])
    )
  );

  // Single player instance lives at the screen level
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  const fetchVideos = () => {
    setLoading(true);
    setError(null);
    api
      .get<unknown>("/storage/videos", true)
      .then((data) => setRecommendations(parseVideoList(data).slice(0, 2)))
      .catch(() => setError("Could not load recommendations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSelect = (video: ApiVideo) => {
    if (selectedVideo?.id === video.id) {
      player.pause();
      setSelectedVideo(null);
      return;
    }
    setSelectedVideo(video);
    player.replace({ uri: `${SERVER_URL}${video.video_url}` });
    player.play();
  };

  const handleClosePlayer = () => {
    player.pause();
    setSelectedVideo(null);
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.appName}>Clarity & Me</Text>
          <Text style={s.subtitle}>Occupational Therapy</Text>
        </View>

        {/* Section title */}
        <View style={s.titleSection}>
          <Text style={s.recommendationsTitle}>Your Recommendations</Text>
          <Text style={s.recommendationsSubtitle}>Personalized for today</Text>
        </View>

        {/* Recommendation cards */}
        <View style={s.cardsContainer}>
          {loading ? (
            <View style={s.stateBox}>
              <ActivityIndicator size="small" color={colors.teal} />
              <Text style={s.stateText}>Loading recommendations…</Text>
            </View>
          ) : error ? (
            <View style={s.stateBox}>
              <Text style={s.stateText}>{error}</Text>
              <TouchableOpacity
                style={[s.retryBtn, { backgroundColor: colors.teal }]}
                onPress={fetchVideos}
              >
                <Text style={s.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : recommendations.length === 0 ? (
            <View style={s.stateBox}>
              <Text style={s.stateText}>No recommendations available yet.</Text>
            </View>
          ) : (
            recommendations.map((video, index) => (
              <RecommendationCard
                key={video.id}
                video={video}
                isPerfect={index === 0}
                isSelected={selectedVideo?.id === video.id}
                onPlay={() => handleSelect(video)}
              />
            ))
          )}
        </View>

        {/* ── Inline video player ── */}
        {selectedVideo && (
          <View style={s.inlinePlayer}>
            {/* Player header */}
            <View style={s.inlineHeader}>
              <View style={s.nowPlayingRow}>
                <View style={s.liveIndicator} />
                <Text style={s.nowPlayingLabel}>Now Playing</Text>
              </View>
              <TouchableOpacity onPress={handleClosePlayer} style={s.closeBtn}>
                <AntDesign name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.inlineTitle} numberOfLines={2}>
              {selectedVideo.title}
            </Text>

            {/* Video */}
            <View style={s.videoWrapper}>
              <VideoView
                player={player}
                style={s.video}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="contain"
              />
            </View>

            {/* Description */}
            {!!selectedVideo.description && (
              <Text style={s.inlineDesc}>{selectedVideo.description}</Text>
            )}

            {/* Category tags */}
            {(() => {
              const style =
                CATEGORY_STYLE[selectedVideo.category.toLowerCase()] ??
                FALLBACK_STYLE;
              return (
                <View style={s.inlineTags}>
                  <View style={s.inlineTag}>
                    <Text style={s.inlineTagText}>{style.type}</Text>
                  </View>
                  <View style={s.inlineTag}>
                    <Text style={s.inlineTagText}>
                      {selectedVideo.category.charAt(0).toUpperCase() +
                        selectedVideo.category.slice(1)}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* More Options */}
        <View style={s.moreOptionsHeader}>
          <Text style={s.moreOptionsTitle}>More Options</Text>
          <TouchableOpacity>
            <AntDesign name="right" size={20} color={colors.teal} />
          </TouchableOpacity>
        </View>

        <View style={s.gridContainer}>
          {GRID_ITEMS.map((item) => (
            <GridCard key={item.id} item={item} query={gridQueries[item.id]} />
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RecommendationCard({
  video,
  isPerfect,
  isSelected,
  onPlay,
}: {
  video: ApiVideo;
  isPerfect: boolean;
  isSelected: boolean;
  onPlay: () => void;
}) {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);
  const style = CATEGORY_STYLE[video.category.toLowerCase()] ?? FALLBACK_STYLE;

  return (
    <TouchableOpacity
      style={[s.card, isSelected && s.cardSelected]}
      activeOpacity={0.85}
      onPress={onPlay}
    >
      {isPerfect && (
        <View style={s.perfectBadge}>
          <Text style={s.perfectBadgeText}>PERFECT FOR YOU</Text>
        </View>
      )}

      <View style={s.cardContent}>
        <View style={[s.emojiContainer, { backgroundColor: style.bgColor }]}>
          <Text style={s.emojiText}>{style.emoji}</Text>
        </View>

        <View style={s.cardRight}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {video.title}
          </Text>

          <View style={s.tagContainer}>
            <Tag label={style.type} />
            <Tag
              label={
                video.category.charAt(0).toUpperCase() +
                video.category.slice(1)
              }
            />
          </View>

          {!!video.description && (
            <Text style={s.cardDescription} numberOfLines={2}>
              {video.description}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[s.playButton, isSelected && s.playButtonActive]}
        onPress={onPlay}
      >
        <MaterialCommunityIcons
          name={isSelected ? "pause" : "play"}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function GridCard({ item, query }: { item: GridItem; query: string }) {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);

  const openYouTube = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={[s.gridCard, { backgroundColor: item.color }]}
      activeOpacity={0.7}
      onPress={openYouTube}
    >
      <View style={s.gridCardContent}>
        <Text style={s.gridCardIcon}>{item.icon}</Text>
        <Text style={s.gridCardTitle}>{item.title}</Text>
        <Text style={s.gridCardCategory}>{item.category}</Text>
        <View style={s.ytBadge}>
          <MaterialCommunityIcons name="youtube" size={11} color="#FF0000" />
          <Text style={s.ytBadgeText}>YouTube</Text>
        </View>
      </View>
      <TouchableOpacity style={s.gridPlayButton} onPress={openYouTube}>
        <MaterialCommunityIcons name="play" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function Tag({ label }: { label: string }) {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);
  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.cardAlt },

    header: { alignItems: "center", paddingVertical: 20 },
    logo: { width: 60, height: 60, marginBottom: 8 },
    appName: { fontSize: 18, fontWeight: "700", color: colors.text },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

    titleSection: { paddingHorizontal: 16, marginBottom: 16 },
    recommendationsTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    recommendationsSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

    cardsContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 16 },

    stateBox: { alignItems: "center", paddingVertical: 32, gap: 10 },
    stateText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
    retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    retryText: { fontSize: 13, fontWeight: "600", color: "#fff" },

    // Recommendation card
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardSelected: {
      borderColor: colors.teal,
    },
    perfectBadge: {
      backgroundColor: "#FFB84D",
      paddingHorizontal: 12,
      paddingVertical: 4,
      margin: 12,
      marginBottom: 0,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    perfectBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
    cardContent: { flexDirection: "row", padding: 12, paddingRight: 60 },
    emojiContainer: {
      width: 76,
      height: 76,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    emojiText: { fontSize: 36 },
    cardRight: { flex: 1, justifyContent: "center", gap: 6 },
    cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
    tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    tag: {
      backgroundColor: colors.borderLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    tagText: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
    cardDescription: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
    playButton: {
      position: "absolute",
      bottom: 12,
      right: 12,
      backgroundColor: colors.teal,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    playButtonActive: {
      backgroundColor: colors.tealDark,
    },

    // ── Inline player ──
    inlinePlayer: {
      marginHorizontal: 16,
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    inlineHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 4,
    },
    nowPlayingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    liveIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.teal,
    },
    nowPlayingLabel: { fontSize: 12, fontWeight: "600", color: colors.teal },
    closeBtn: { padding: 4 },
    inlineTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    videoWrapper: {
      backgroundColor: "#000",
      width: "100%",
    },
    video: {
      width: SCREEN_WIDTH - 32,
      height: VIDEO_HEIGHT,
    },
    inlineDesc: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    inlineTags: {
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 14,
    },
    inlineTag: {
      backgroundColor: colors.tealLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    inlineTagText: { fontSize: 11, fontWeight: "600", color: colors.tealDark },

    // More options
    moreOptionsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    moreOptionsTitle: { fontSize: 18, fontWeight: "700", color: colors.text },

    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 24,
    },
    gridCard: {
      width: "48%",
      borderRadius: 12,
      padding: 12,
      minHeight: 160,
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    gridCardContent: { flex: 1 },
    gridCardIcon: { fontSize: 32, marginBottom: 8 },
    gridCardTitle: { fontSize: 14, fontWeight: "600", color: "#1a1a1a", marginBottom: 4 },
    gridCardCategory: { fontSize: 12, color: "#555", marginBottom: 6 },
    ytBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
    ytBadgeText: { fontSize: 10, color: "#FF0000", fontWeight: "600" },
    gridPlayButton: {
      backgroundColor: colors.teal,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}

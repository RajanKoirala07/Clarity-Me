import { api, SERVER_URL } from "@/services/api";
import { useAppTheme } from "@/context/ThemeContext";
import type { ThemeColors } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_CATEGORIES = ["All", "Sensory", "Motor", "Breathing"] as const;

const CATEGORY_ICON: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  sensory: { icon: "eye-outline", color: "#7C3AED", bg: "#EDE9FE" },
  motor: { icon: "body-outline", color: "#16A34A", bg: "#DCFCE7" },
  breathing: { icon: "flower-outline", color: "#3D8B85", bg: "#E6FAF5" },
};

type VideoCategory = "sensory" | "motor" | "breathing";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  video_url: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

export default function LibraryScreen() {
  const { colors } = useAppTheme();
  const s = makeStyles(colors);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (playingVideo) {
      const uri = `${SERVER_URL}${playingVideo.video_url}`;
      player.replace({ uri });
      player.play();
    } else {
      player.pause();
    }
  }, [playingVideo]);

  const fetchVideos = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const query =
        category === "All" ? "" : `?category=${category.toLowerCase()}`;
      const data = await api.get<any>(`/storage/videos${query}`, true);
      const list: VideoItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.videos)
            ? data.videos
            : Array.isArray(data?.result)
              ? data.result
              : [];
      setVideos(list);
    } catch {
      setError("Failed to load videos. Pull to refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(activeCategory);
  }, [fetchVideos, activeCategory]);

  const filtered = videos;

  const closePlayer = () => {
    player.pause();
    setPlayingVideo(null);
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.appName}>Clarity & Me</Text>
          <Text style={s.tagline}>Occupational Therapy</Text>
        </View>

        <Text style={s.pageTitle}>Library</Text>
        <Text style={s.pageSubtitle}>Explore exercises tailored for you</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={s.filterContent}
        >
          {FILTER_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                s.filterChip,
                activeCategory === cat && s.filterChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  s.filterChipText,
                  activeCategory === cat && s.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Body */}
        {loading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={s.loadingText}>Loading videos…</Text>
          </View>
        ) : error ? (
          <View style={s.centerBox}>
            <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => fetchVideos(activeCategory)}
            >
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={s.countText}>
              {filtered.length} video{filtered.length !== 1 ? "s" : ""}
            </Text>

            {filtered.length === 0 ? (
              <View style={s.centerBox}>
                <Ionicons name="videocam-off-outline" size={44} color={colors.textMuted} />
                <Text style={s.emptyText}>No videos in this category yet.</Text>
              </View>
            ) : (
              filtered.map((video) => {
                const meta =
                  CATEGORY_ICON[video.category] ?? CATEGORY_ICON.breathing;
                return (
                  <TouchableOpacity
                    key={video.id}
                    style={s.card}
                    activeOpacity={0.85}
                    onPress={() => setPlayingVideo(video)}
                  >
                    <View style={[s.cardIcon, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={26} color={meta.color} />
                    </View>
                    <View style={s.cardBody}>
                      <View style={s.cardTopRow}>
                        <Text style={s.cardTitle} numberOfLines={1}>
                          {video.title}
                        </Text>
                        <View style={s.categoryBadge}>
                          <Text style={s.categoryBadgeText}>
                            {video.category.charAt(0).toUpperCase() +
                              video.category.slice(1)}
                          </Text>
                        </View>
                      </View>
                      {!!video.description && (
                        <Text style={s.cardDesc} numberOfLines={2}>
                          {video.description}
                        </Text>
                      )}
                      <View style={s.cardMeta}>
                        <Ionicons name="play-circle-outline" size={14} color={colors.teal} />
                        <Text style={[s.metaText, { color: colors.teal }]}>
                          Tap to play
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                      style={s.chevron}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={!!playingVideo}
        animationType="slide"
        onRequestClose={closePlayer}
        statusBarTranslucent
      >
        <View style={s.playerModal}>
          <TouchableOpacity style={s.playerClose} onPress={closePlayer}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={s.playerTitle} numberOfLines={2}>
            {playingVideo?.title}
          </Text>

          {playingVideo && (
            <VideoView
              player={player}
              style={s.video}
              allowsFullscreen
              allowsPictureInPicture
            />
          )}

          {!!playingVideo?.description && (
            <View style={s.playerDescBox}>
              <Text style={s.playerDesc}>{playingVideo.description}</Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.cardAlt },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    header: { alignItems: "center", marginTop: 8, marginBottom: 16 },
    logo: { width: 64, height: 64, marginBottom: 6 },
    appName: { fontSize: 18, fontWeight: "800", color: colors.text },
    tagline: { fontSize: 12, fontWeight: "600", color: colors.textMuted, marginTop: 2 },

    pageTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 20,
    },

    filterScroll: { marginBottom: 8 },
    filterContent: { gap: 8, paddingRight: 8 },
    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
    filterChipText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
    filterChipTextActive: { color: "#fff" },

    countText: { fontSize: 12, color: colors.textMuted, marginBottom: 14, marginTop: 6 },

    centerBox: { alignItems: "center", paddingVertical: 48, gap: 12 },
    loadingText: { fontSize: 14, color: colors.textMuted },
    errorText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
    emptyText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
    retryBtn: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.teal,
    },
    retryText: { fontSize: 14, fontWeight: "600", color: "#fff" },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    cardBody: { flex: 1 },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    categoryBadge: {
      backgroundColor: colors.tealLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryBadgeText: { fontSize: 11, fontWeight: "600", color: colors.tealDark },
    cardDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 6 },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 12 },
    chevron: { marginLeft: 6 },

    playerModal: { flex: 1, backgroundColor: "#0A0A0A", paddingTop: 56 },
    playerClose: {
      position: "absolute",
      top: 48,
      right: 20,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    playerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: "#fff",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    video: { width: "100%", height: 240 },
    playerDescBox: {
      marginHorizontal: 20,
      marginTop: 20,
      padding: 16,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 14,
    },
    playerDesc: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 21 },
  });
}

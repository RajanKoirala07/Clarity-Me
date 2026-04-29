import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Logo */}
        <View style={s.logoSection}>
          <View style={s.logoIcon}>
            <Ionicons name="leaf" size={40} color={colors.tealDark} />
          </View>
          <Text style={s.appName}>Clarity & Me</Text>
          <Text style={s.appTagline}>Occupational Therapy</Text>
        </View>

        {/* Avatar + Greeting */}
        <View style={s.avatarSection}>
          <View style={s.avatarRing}>
            <View style={s.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.teal} />
            </View>
          </View>
          <Text style={s.userName}>Angela Costi</Text>
          <Text style={s.greeting}>Hi Angela! 👋</Text>
        </View>

        {/* Progress Card */}
        <View style={s.progressCard}>
          <Text style={s.progressTitle}>Your Progress</Text>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNumber}>7</Text>
              <Text style={s.statLabel}>Day Streak</Text>
            </View>
            <View style={s.statItem}>
              <Text style={s.statNumber}>42</Text>
              <Text style={s.statLabel}>Total Sessions</Text>
            </View>
          </View>
          <View style={s.miniChart}>
            {[0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 1.0].map((v, i) => (
              <View key={i} style={s.miniBarCol}>
                <View style={s.miniBarTrack}>
                  <View
                    style={[s.miniBarFill, { height: `${v * 100}%` as any }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <Text style={s.sectionTitle}>Settings</Text>

        {/* Dark Mode */}
        <View style={s.settingRow}>
          <View style={s.settingInfo}>
            <Text style={s.settingLabel}>Dark Mode</Text>
            <Text style={s.settingDesc}>{isDark ? "Dark theme active" : "Light theme active"}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#D1D5DB", true: colors.teal }}
            thumbColor="#fff"
          />
        </View>

        {/* Daily Check-ins */}
        <TouchableOpacity
          style={s.settingRow}
          onPress={() => router.push("/daily-checkin")}
        >
          <View style={s.settingInfo}>
            <Text style={s.settingLabel}>Daily check ins</Text>
            <Text style={s.settingDesc}>Get Personalized suggestions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Safety */}
        <TouchableOpacity
          style={s.safetyButton}
          onPress={() => router.push("/disclaimer")}
        >
          <Text style={s.safetyButtonText}>Safety & Disclaimer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.logoutButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },

    logoSection: {
      alignItems: "center",
      marginTop: 12,
      marginBottom: 24,
    },
    logoIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.tealLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    appName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    appTagline: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 2,
    },

    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: colors.tealLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    avatarPlaceholder: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.tealLight,
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    greeting: {
      fontSize: 15,
      color: colors.teal,
      fontWeight: "500",
      marginTop: 2,
    },

    progressCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      marginBottom: 28,
    },
    progressTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 16,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.tealDark,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    miniChart: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      height: 50,
      alignItems: "flex-end",
    },
    miniBarCol: {
      alignItems: "center",
    },
    miniBarTrack: {
      width: 20,
      height: 50,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 4,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    miniBarFill: {
      width: "100%",
      backgroundColor: colors.teal,
      borderRadius: 4,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    settingInfo: {
      flex: 1,
      marginRight: 12,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    settingDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },

    safetyButton: {
      backgroundColor: colors.tealLight,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 28,
      marginBottom: 16,
    },
    safetyButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.tealDark,
    },
    logoutButton: {
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 10,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.danger,
    },
  });
}

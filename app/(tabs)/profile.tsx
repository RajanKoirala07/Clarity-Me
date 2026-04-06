import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0D9488";
const TEAL_DARK = "#0F766E";
const TEAL_LIGHT = "#E6FAF5";
const GRAY_TEXT = "#6B7280";
const DARK_TEXT = "#1F2937";

export default function ProfileScreen() {
  const router = useRouter();
  const [sensoryPrefs, setSensoryPrefs] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={40} color={TEAL_DARK} />
          </View>
          <Text style={styles.appName}>Clarity & Me</Text>
          <Text style={styles.appTagline}>Occupational Therapy</Text>
        </View>

        {/* Avatar + Greeting */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={TEAL} />
            </View>
          </View>
          <Text style={styles.userName}>Angela Costi</Text>
          <Text style={styles.greeting}>Hi Angela! 👋</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
          </View>
          {/* Mini bar chart */}
          <View style={styles.miniChart}>
            {[0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 1.0].map((v, i) => (
              <View key={i} style={styles.miniBarCol}>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[styles.miniBarFill, { height: `${v * 100}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>

        {/* Sensory Preferences */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sensory Preferences</Text>
            <Text style={styles.settingDesc}>Customize your experience</Text>
          </View>
          <Switch
            value={sensoryPrefs}
            onValueChange={setSensoryPrefs}
            trackColor={{ false: "#D1D5DB", true: TEAL }}
            thumbColor="#fff"
          />
        </View>

        {/* Theme */}
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingDesc}>Dark / Light / Color-safe</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={GRAY_TEXT} />
        </TouchableOpacity>

        {/* Daily Check-ins */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => router.push("/daily-checkin")}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily check ins</Text>
            <Text style={styles.settingDesc}>Get Personalized suggestions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={GRAY_TEXT} />
        </TouchableOpacity>

        {/* Action Buttons */}
        {/* <TouchableOpacity style={styles.unlockButton}>
          <Text style={styles.unlockButtonText}>Unlock Full Clarity</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.safetyButton}
          onPress={() => router.push("/disclaimer")}
        >
          <Text style={styles.safetyButtonText}>Safety & Disclaimer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Logo
  logoSection: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  appTagline: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginTop: 2,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: TEAL_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  greeting: {
    fontSize: 15,
    color: TEAL,
    fontWeight: "500",
    marginTop: 2,
  },

  // Progress Card
  progressCard: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
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
    color: TEAL_DARK,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY_TEXT,
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
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  miniBarFill: {
    width: "100%",
    backgroundColor: TEAL,
    borderRadius: 4,
  },

  // Settings
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  settingDesc: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 2,
  },

  // Buttons
  unlockButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 12,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  safetyButton: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  safetyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEAL_DARK,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});

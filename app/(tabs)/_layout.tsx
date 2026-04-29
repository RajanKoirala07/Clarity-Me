import { Tabs } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import FloatingUploadButton from "@/components/FloatingUploadButton";
import { useAppTheme } from "@/context/ThemeContext";

const TEAL = "#3D8B85";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const [uploadVisible, setUploadVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopWidth: 1,
            borderTopColor: colors.tabBorder,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Library",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="books.vertical.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: "",
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.centerBtn}
                onPress={() => setUploadVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="chart.bar.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>

      <FloatingUploadButton
        visible={uploadVisible}
        onRequestClose={() => setUploadVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

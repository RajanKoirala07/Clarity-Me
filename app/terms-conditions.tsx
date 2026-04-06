import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const TEAL = "#3D8B85";
const BG = "#D6EEEC";
const DARK_TEXT = "#1a1a1a";

export default function TermsConditionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: isDark ? "#fff" : DARK_TEXT }]}>
            Full Terms & Conditions
          </Text>

          {/* Sections */}
          <Section
            title="1. Purpose and Nature of Services"
            isDark={isDark}
            content={`This application (Clarity & Me) provides mindfulness exercises and occupational therapy guidance. These services are educational in nature and are NOT intended to replace professional medical or mental health treatment. Users must understand that participation is voluntary and self-directed.`}
          />

          <Section
            title="2. Medical Disclaimer"
            isDark={isDark}
            content={`Before using this application, especially if you have existing medical conditions, mental health concerns, or recent trauma, please consult with a qualified healthcare provider. We do not diagnose, treat, cure, or prevent any disease or condition. If you experience severe symptoms or distress, seek immediate professional help.`}
          />

          <Section
            title="3. User Responsibilities"
            isDark={isDark}
            content={`By accessing and using this application, you agree that:
• You are of legal age and capable of entering into this agreement
• You will use the app only for its intended purpose
• You assume full responsibility for your participation
• You will stop any exercise if it causes pain or significant discomfort
• You acknowledge these practices may not work for everyone`}
          />

          <Section
            title="4. Limitation of Liability"
            isDark={isDark}
            content={`The creators and distributors of Clarity & Me are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of this application, including but not limited to: physical injury, emotional distress, loss of income, or any adverse health outcomes.`}
          />

          <Section
            title="5. No Guarantees"
            isDark={isDark}
            content={`We make no warranties or guarantees about the results or effectiveness of these practices. Results vary by individual and depend on consistent practice and personal circumstances.`}
          />

          <Section
            title="6. Privacy and Data"
            isDark={isDark}
            content={`Your privacy is important to us. Any personal information collected is handled according to our privacy policy. We do not sell or share user data with third parties without explicit consent.`}
          />

          <Section
            title="7. Intellectual Property"
            isDark={isDark}
            content={`All content, exercises, and materials in this application are protected by copyright. You may not reproduce, distribute, or modify this content without permission.`}
          />

          <Section
            title="8. Modifications to Terms"
            isDark={isDark}
            content={`We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of updated terms.`}
          />

          <Section
            title="9. Contact Information"
            isDark={isDark}
            content={`For questions about these terms or the application, please contact us through the app or visit our website.`}
          />

          {/* Footer */}
          <Text style={[styles.footer, { color: isDark ? "#999" : "#666" }]}>
            Last updated: March 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  content,
  isDark,
}: {
  title: string;
  content: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text
        style={[styles.sectionTitle, { color: isDark ? "#fff" : DARK_TEXT }]}
      >
        {title}
      </Text>
      <Text
        style={[styles.sectionContent, { color: isDark ? "#ddd" : DARK_TEXT }]}
      >
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});

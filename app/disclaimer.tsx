import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const TEAL = '#3D8B85';
const BG = '#D6EEEC';
const DARK_TEXT = '#1a1a1a';

export default function DisclaimerScreen() {
  const [agreed, setAgreed] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAgree = () => {
    if (agreed) {
      // Save agreement to storage and navigate
      router.replace('/(tabs)');
    }
  };

  const handleViewTerms = () => {
    // Navigate to full terms page - can be a modal or web page
    router.push('/terms-conditions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : DARK_TEXT }]}>
            Clarity & Disclaimer
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? '#ccc' : '#555' },
            ]}
          >
            Please read the important information before using our mindfulness practices.
          </Text>
        </View>

        {/* Content Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <View style={styles.collapsibleContainer}>
            {/* Purpose Section */}
            <Collapsible title="Purpose">
              <Text
                style={[
                  styles.collapsibleContent,
                  { color: isDark ? '#ddd' : DARK_TEXT },
                ]}
              >
                These mindfulness and occupational therapy practices are designed to support your
                general well-being. They are not a substitute for professional medical or mental
                health treatment.
              </Text>
            </Collapsible>

            {/* Medical Clearance Section */}
            <View style={styles.divider} />
            <Collapsible title="When to seek medical clearance">
              <Text
                style={[
                  styles.collapsibleContent,
                  { color: isDark ? '#ddd' : DARK_TEXT },
                ]}
              >
                Consult with a healthcare provider before using these practices if you have:
              </Text>
              <View style={styles.bulletList}>
                {[
                  'Severe mental health conditions',
                  'Recent trauma or PTSD',
                  'Medical conditions affecting balance or movement',
                  'Any concerns about your health',
                ].map((item, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={[styles.bullet, { color: TEAL }]}>• </Text>
                    <Text
                      style={[
                        styles.bulletText,
                        { color: isDark ? '#ddd' : DARK_TEXT },
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </Collapsible>

            {/* Self-Responsibility Section */}
            <View style={styles.divider} />
            <Collapsible title="Self-responsibility & Participation">
              <Text
                style={[
                  styles.collapsibleContent,
                  { color: isDark ? '#ddd' : DARK_TEXT },
                ]}
              >
                By using this app, you acknowledge that:
              </Text>
              <View style={styles.bulletList}>
                {[
                  'You are participating of your own free will',
                  'You take responsibility for your own health and safety',
                  'You will discontinue any practice that causes discomfort',
                  'You understand these practices are self-directed',
                ].map((item, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={[styles.bullet, { color: TEAL }]}>• </Text>
                    <Text
                      style={[
                        styles.bulletText,
                        { color: isDark ? '#ddd' : DARK_TEXT },
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </Collapsible>

            {/* Liability Section */}
            <View style={styles.divider} />
            <Collapsible title="No Liability / No Guarantees">
              <Text
                style={[
                  styles.collapsibleContent,
                  { color: isDark ? '#ddd' : DARK_TEXT },
                ]}
              >
                Clarity & Me and its creators assume no liability for any outcomes resulting from
                the use of these practices. We make no guarantees about results and cannot be held
                responsible for any adverse effects.
              </Text>
            </Collapsible>
          </View>

          {/* Agreement & Buttons */}
          <View style={styles.agreementSection}>
            {/* Checkbox & Text */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreed ? TEAL : 'transparent',
                    borderColor: isDark ? '#555' : '#ccc',
                  },
                ]}
              >
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.agreeText,
                  { color: isDark ? '#ddd' : DARK_TEXT },
                ]}
              >
                I understand and agree
              </Text>
            </TouchableOpacity>

            {/* Agree Button */}
            <TouchableOpacity
              style={[
                styles.agreeButton,
                { backgroundColor: agreed ? TEAL : '#ccc' },
              ]}
              onPress={handleAgree}
              disabled={!agreed}
            >
              <Text style={styles.agreeButtonText}>I understand and agree</Text>
            </TouchableOpacity>

            {/* View Full Terms Link */}
            <TouchableOpacity
              style={styles.termsLink}
              onPress={handleViewTerms}
            >
              <Text style={[styles.termsLinkText, { color: TEAL }]}>
                View Full Terms & Conditions
              </Text>
            </TouchableOpacity>

            {/* Footer Warning */}
            <Text
              style={[
                styles.footerWarning,
                { color: isDark ? '#999' : '#999' },
              ]}
            >
              If unsure, consult your healthcare provider before using.
            </Text>
          </View>
        </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  collapsibleContainer: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  collapsibleContent: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  agreementSection: {
    marginTop: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  agreeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  agreeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  termsLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerWarning: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

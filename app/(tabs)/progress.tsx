import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const BG = '#D6EEEC';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Your Progress</ThemedText>
        </ThemedView>
        <ThemedView style={styles.contentContainer}>
          <ThemedText type="subtitle">Track your wellness journey</ThemedText>
          <ThemedText>Your progress and statistics will appear here.</ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

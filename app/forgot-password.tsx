import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword } from '@/services/auth';
import { ApiError } from '@/services/api';

const TEAL = '#3D8B85';
const BG = '#D6EEEC';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError('No account found with that email.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Branding */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Clarity & Me</Text>
          <Text style={styles.tagline}>Occupational Therapy</Text>
        </View>

        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subText}>
            Enter the email associated with your account and we'll send a reset link.
          </Text>

          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={20} color={TEAL} />
              <Text style={styles.successText}>
                Reset link sent! Check your inbox.
              </Text>
            </View>
          ) : (
            <>
              {/* Email */}
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#B0C8C8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                />
                <Ionicons name="mail-outline" size={20} color="#8AAFAF" style={styles.inputIcon} />
              </View>

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleSend}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Send reset link</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* Back to login */}
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={TEAL} />
            <Text style={styles.backText}>Back to login</Text>
          </TouchableOpacity>
        </View>

        {/* Info note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={TEAL} />
          <Text style={styles.infoText}>
            Didn't get the email? Check your spam folder or try again.
          </Text>
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
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E4A4A',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E4A4A',
    marginTop: 2,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E4A4A',
    marginBottom: 10,
  },
  subText: {
    fontSize: 13,
    color: '#7A9E9E',
    marginBottom: 24,
    lineHeight: 19,
  },

  // Input
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E4A4A',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4E8E8',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E4A4A',
  },
  inputIcon: {
    paddingHorizontal: 14,
  },

  // Button
  primaryButton: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 13,
    color: '#D9534F',
    marginBottom: 12,
    textAlign: 'center',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F4',
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#1E4A4A',
    fontWeight: '500',
  },

  // Back link
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '600',
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    width: '100%',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#5A8A8A',
    lineHeight: 19,
  },
});

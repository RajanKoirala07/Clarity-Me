import { ApiError } from "@/services/api";
import { register } from "@/services/auth";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TEAL = "#3D8B85";
const BG = "#D6EEEC";

type PasswordStrength = "Weak" | "Fair" | "Strong";

function getPasswordStrength(password: string): {
  label: PasswordStrength;
  color: string;
} {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const passed = checks.filter(Boolean).length;
  if (passed <= 2) return { label: "Weak", color: "#E74C3C" };
  if (passed <= 4) return { label: "Fair", color: "#F39C12" };
  return { label: "Strong", color: "#27AE60" };
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const requirements = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One lowercase letter", met: /[a-z]/.test(password) },
      { label: "One number", met: /[0-9]/.test(password) },
      { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  const canSubmit =
    requirements.every((r) => r.met) &&
    agreedToTerms &&
    fullName.trim() &&
    email.trim();

  const handleCreateAccount = async () => {
    if (!canSubmit) return;
    try {
      setError("");
      setLoading(true);
      console.log("Creating user with:", {
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone_number: phoneNumber.trim(),
      });
      await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        ...(phoneNumber.trim() ? { phone_number: phoneNumber.trim() } : {}),
      });
      router.replace("/login");
    } catch (e) {
      console.log(e);
      if (e instanceof ApiError && e.status === 401) {
        setError("You must be logged in as an admin to create users.");
      } else if (e instanceof ApiError && e.status === 400) {
        setError(e.message || "Invalid input. Please check all fields.");
      } else {
        setError("Something went wrong. Please try again.");
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
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Clarity & Me</Text>
          <Text style={styles.tagline}>Occupational Therapy</Text>
        </View>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <AntDesign
            name="google"
            size={20}
            color="#DB4437"
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
          <AntDesign
            name="apple"
            size={20}
            color="#FFFFFF"
            style={styles.socialIcon}
          />
          <Text style={styles.appleButtonText}>
            Continue with Apple Sign In
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Angela Cosli"
          placeholderTextColor="#B0C8C8"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="AngelaC234@gmail.com"
          placeholderTextColor="#B0C8C8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError("");
          }}
        />

        {/* Phone Number (optional) */}
        <Text style={styles.label}>
          Phone Number <Text style={styles.optionalTag}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="9800000000"
          placeholderTextColor="#B0C8C8"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Evolve@456"
            placeholderTextColor="#B0C8C8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#8AAFAF"
            />
          </TouchableOpacity>
        </View>

        {/* Password Strength */}
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            <Text style={styles.strengthLabel}>Password Strength:</Text>
            <Text style={[styles.strengthValue, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        {/* Requirements Checklist */}
        {password.length > 0 && (
          <View style={styles.requirementsList}>
            {requirements.map((req) => (
              <View key={req.label} style={styles.requirementRow}>
                <Ionicons
                  name={req.met ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={req.met ? "#27AE60" : "#E74C3C"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    { color: req.met ? "#27AE60" : "#E74C3C" },
                  ]}
                >
                  {req.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.checkbox}
          >
            {agreedToTerms && (
              <Ionicons name="checkmark" size={14} color={TEAL} />
            )}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Create Account */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!canSubmit || loading) && styles.primaryButtonDisabled,
          ]}
          onPress={handleCreateAccount}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.loginRow}>
            <Text style={styles.haveAccountText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E4A4A",
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E4A4A",
    marginTop: 2,
  },

  // Social buttons
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D4E8E8",
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  appleButton: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E4A4A",
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#C8DEDE",
  },
  dividerText: {
    fontSize: 13,
    color: "#8AAFAF",
    marginHorizontal: 12,
  },

  // Inputs
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E4A4A",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4E8E8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E4A4A",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4E8E8",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E4A4A",
  },
  eyeButton: {
    paddingHorizontal: 14,
  },

  // Password strength
  strengthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: "#5A8A8A",
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Requirements
  requirementsList: {
    marginBottom: 16,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 6,
  },

  // Terms
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#D4E8E8",
    borderRadius: 4,
    marginRight: 10,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: "#5A8A8A",
    lineHeight: 18,
  },
  termsLink: {
    color: TEAL,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Primary button
  primaryButton: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 13,
    color: "#D9534F",
    marginBottom: 12,
    textAlign: "center",
  },
  optionalTag: {
    fontSize: 12,
    color: "#8AAFAF",
    fontWeight: "400",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    alignItems: "center",
    gap: 10,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  haveAccountText: {
    fontSize: 14,
    color: "#5A8A8A",
  },
  loginText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "700",
  },
  skipText: {
    fontSize: 14,
    color: "#1E4A4A",
    textDecorationLine: "underline",
  },
});

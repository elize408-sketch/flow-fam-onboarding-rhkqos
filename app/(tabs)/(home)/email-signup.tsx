
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailSignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email) {
      newErrors.email = "E-mail is verplicht";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Voer een geldig e-mailadres in";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Wachtwoord is verplicht";
    } else if (password.length < 8) {
      newErrors.password = "Wachtwoord moet minimaal 8 tekens bevatten";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Bevestig je wachtwoord";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Wachtwoorden komen niet overeen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email, password);
      setSuccessMessage("Account succesvol aangemaakt! Je wordt doorgestuurd...");
      
      // After signup, the AuthContext will fetch the user profile
      // Since new users have familySetupComplete = false by default,
      // the central routing in app/index.tsx will redirect to family setup
      
      // Navigate to family setup after successful signup
      setTimeout(() => {
        router.replace("/(onboarding)/family-setup");
      }, 1000);
    } catch (error: any) {
      console.error("Sign up error:", error);
      setErrors({ general: error.message || "Er is een fout opgetreden" });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && confirmPassword && password.length >= 8 && password === confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={commonStyles.title}>Account aanmaken</Text>
            <Text style={styles.subtitle}>
              Vul je gegevens in om een account aan te maken
            </Text>
          </View>

          {successMessage ? (
            <View style={styles.successCard}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={48}
                color={colors.accent}
              />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errors.general ? (
            <View style={styles.errorCard}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={24}
                color="#EF4444"
              />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mailadres</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="jouw@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {errors.email ? (
                <Text style={styles.errorMessage}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wachtwoord</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Minimaal 8 tekens"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!loading}
              />
              {errors.password ? (
                <Text style={styles.errorMessage}>{errors.password}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bevestig wachtwoord</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Herhaal je wachtwoord"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!loading}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Account aanmaken</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/(tabs)/(home)/login")}
              disabled={loading}
            >
              <Text style={styles.loginLinkText}>
                Heb je al een account? <Text style={styles.loginLinkBold}>Inloggen</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === "android" ? 80 : 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 8,
  },
  successCard: {
    backgroundColor: colors.accent + "15",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
    marginLeft: 12,
    flex: 1,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 12,
    flex: 1,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: "500",
    color: "#EF4444",
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.3)",
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  loginLinkBold: {
    fontWeight: "700",
    color: colors.primary,
  },
});

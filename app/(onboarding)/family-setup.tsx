
import { IconSymbol } from "@/components/IconSymbol";
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
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { authenticatedPost } from "@/utils/api";
import { authClient } from "@/lib/auth";
import { colors, commonStyles } from "@/styles/commonStyles";

interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "partner" | "child";
}

export default function FamilySetupScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔒 Authentication Guard
  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("[Family Setup] Checking authentication...");
      
      // Check Better Auth session
      const session = await authClient.getSession();
      const cookies = authClient.getCookie();
      
      console.log("[Family Setup] Session exists:", !!session?.data?.user);
      console.log("[Family Setup] Cookies exist:", !!cookies);
      console.log("[Family Setup] User from context:", !!user);
      console.log("[Family Setup] User ID:", user?.id || session?.data?.user?.id);

      if (!session?.data?.user || !cookies) {
        console.warn("[Family Setup] No authentication found, redirecting to login");
        Alert.alert(
          "Inloggen vereist",
          "Je moet ingelogd zijn om je gezin in te stellen.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/(home)/auth"),
            },
          ]
        );
        return;
      }

      setCheckingAuth(false);
    };

    if (!authLoading) {
      checkAuthentication();
    }
  }, [user, authLoading]);

  const validateForm = () => {
    if (!familyName.trim()) {
      Alert.alert("Fout", "Vul een gezinsnaam in");
      return false;
    }
    if (!parentName.trim()) {
      Alert.alert("Fout", "Vul je naam in");
      return false;
    }
    return true;
  };

  const handleAddChild = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChildren([
      ...children,
      { id: Date.now().toString(), name: "", role: "child" },
    ]);
  };

  const handleRemoveChild = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChildren(children.filter((child) => child.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // 🔒 Double-check authentication before submit
    const session = await authClient.getSession();
    const cookies = authClient.getCookie();
    
    console.log("[Family Setup] Submit - Session exists:", !!session?.data?.user);
    console.log("[Family Setup] Submit - Cookies exist:", !!cookies);
    console.log("[Family Setup] Submit - User ID:", session?.data?.user?.id);

    if (!session?.data?.user || !cookies) {
      Alert.alert(
        "Sessie verlopen",
        "Je sessie is verlopen. Log opnieuw in.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/(home)/auth") }]
      );
      return;
    }

    const userId = session.data.user.id;
    console.log("[Family Setup] Submitting with user ID:", userId);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setLoading(true);

    try {
      // Prepare family members
      const familyMembers = [
        { name: parentName, role: "parent" },
        ...(partnerName.trim() ? [{ name: partnerName, role: "partner" }] : []),
        ...children
          .filter((child) => child.name.trim())
          .map((child) => ({ name: child.name, role: "child" })),
      ];

      console.log("[Family Setup] Creating family:", {
        familyName,
        membersCount: familyMembers.length,
        userId,
      });

      // 🔐 Use authenticated API call with Better Auth cookies
      const response = await authenticatedPost("/api/family/create", {
        familyName,
        members: familyMembers,
        userId,
      });

      console.log("[Family Setup] Family created successfully:", response);

      Alert.alert("Gelukt!", "Je gezin is aangemaakt", [
        {
          text: "Doorgaan",
          onPress: () => router.replace("/(onboarding)/family-style"),
        },
      ]);
    } catch (error: any) {
      console.error("[Family Setup] Error creating family:", error);
      console.error("[Family Setup] Error details:", {
        message: error.message,
        stack: error.stack,
      });

      // More detailed error message
      let errorMessage = "Er ging iets mis bij het aanmaken van je gezin.";
      
      if (error.message.includes("Authentication token not found")) {
        errorMessage = "Je sessie is verlopen. Log opnieuw in.";
        setTimeout(() => {
          router.replace("/(tabs)/(home)/auth");
        }, 2000);
      } else if (error.message.includes("API error")) {
        errorMessage = `Fout bij het aanmaken: ${error.message}`;
      }

      Alert.alert("Fout", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading || checkingAuth) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Authenticatie controleren...</Text>
      </View>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stel je gezin in</Text>
          <Text style={styles.subtitle}>
            Voeg je gezinsleden toe om te beginnen
          </Text>
        </View>

        <View style={styles.form}>
          {/* Family Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gezinsnaam *</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. Familie Jansen"
              value={familyName}
              onChangeText={setFamilyName}
              autoCapitalize="words"
            />
          </View>

          {/* Parent Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jouw naam *</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. Jan"
              value={parentName}
              onChangeText={setParentName}
              autoCapitalize="words"
            />
          </View>

          {/* Partner Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Partner (optioneel)</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. Maria"
              value={partnerName}
              onChangeText={setPartnerName}
              autoCapitalize="words"
            />
          </View>

          {/* Children */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kinderen (optioneel)</Text>
            {children.map((child, index) => (
              <View key={child.id} style={styles.childRow}>
                <TextInput
                  style={[styles.input, styles.childInput]}
                  placeholder={`Kind ${index + 1}`}
                  value={child.name}
                  onChangeText={(text) => {
                    const updated = [...children];
                    updated[index].name = text;
                    setChildren(updated);
                  }}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveChild(child.id)}
                  style={styles.removeButton}
                >
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={24} 
                    color={colors.error} 
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddChild}
              style={styles.addButton}
            >
              <IconSymbol 
                ios_icon_name="plus.circle.fill" 
                android_material_icon_name="add-circle" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.addButtonText}>Kind toevoegen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            commonStyles.primaryButton,
            loading && commonStyles.primaryButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Doorgaan</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  childInput: {
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

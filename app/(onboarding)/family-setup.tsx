
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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "partner" | "child";
}

export default function FamilySetupScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState(user?.name || "");
  const [partnerName, setPartnerName] = useState("");
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    familyName?: string;
    parentName?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!familyName.trim()) {
      newErrors.familyName = "Familienaam is verplicht";
    }

    if (!parentName.trim()) {
      newErrors.parentName = "Naam ouder is verplicht";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddChild = () => {
    if (!newChildName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newChild = {
      id: Date.now().toString(),
      name: newChildName.trim(),
    };

    setChildren([...children, newChild]);
    setNewChildName("");
  };

  const handleRemoveChild = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChildren(children.filter((child) => child.id !== id));
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);

    try {
      console.log("[FamilySetup] Creating family...");
      
      // Import API utilities
      const { authenticatedPost } = await import("@/utils/api");
      
      // Build members array according to API schema
      const members: Array<{
        name: string;
        role: "parent" | "partner" | "child";
      }> = [
        {
          name: parentName.trim(),
          role: "parent" as const,
        },
      ];
      
      // Add partner if provided
      if (partnerName.trim()) {
        members.push({
          name: partnerName.trim(),
          role: "partner" as const,
        });
      }
      
      // Add children
      children.forEach((child) => {
        members.push({
          name: child.name.trim(),
          role: "child" as const,
        });
      });
      
      console.log("[FamilySetup] Submitting family data:", {
        familyName: familyName.trim(),
        members,
      });
      
      // Create family with members in a single API call
      const response = await authenticatedPost<{
        familyId: string;
        success: boolean;
        message: string;
      }>("/api/families", {
        familyName: familyName.trim(),
        members,
      });
      
      console.log("[FamilySetup] Family created successfully:", response);

      // Mark family setup as complete in AsyncStorage for offline support
      await AsyncStorage.setItem("familySetupComplete", "true");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to home
      router.replace("/(tabs)/(home)");
    } catch (error: any) {
      console.error("[FamilySetup] Family setup error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Parse error message from API response
      let errorMessage = "Er is een fout opgetreden";
      if (error.message) {
        // Extract meaningful error from API error message
        if (error.message.includes("400")) {
          errorMessage = "Ongeldige gegevens. Controleer je invoer.";
        } else if (error.message.includes("401")) {
          errorMessage = "Je bent niet ingelogd. Log opnieuw in.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server fout. Probeer het later opnieuw.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = familyName.trim() && parentName.trim();

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
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={commonStyles.title}>Stel je gezin in</Text>
            <Text style={styles.subtitle}>
              Maak je gezinsprofiel aan om te beginnen
            </Text>
          </View>

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
            {/* Family Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Familienaam *</Text>
              <TextInput
                style={[styles.input, errors.familyName && styles.inputError]}
                placeholder="Bijv. Familie Jansen"
                placeholderTextColor={colors.textSecondary}
                value={familyName}
                onChangeText={(text) => {
                  setFamilyName(text);
                  if (errors.familyName) {
                    setErrors({ ...errors, familyName: undefined });
                  }
                }}
                editable={!loading}
              />
              {errors.familyName ? (
                <Text style={styles.errorMessage}>{errors.familyName}</Text>
              ) : null}
            </View>

            {/* Parent Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Naam ouder *</Text>
              <TextInput
                style={[styles.input, errors.parentName && styles.inputError]}
                placeholder="Je naam"
                placeholderTextColor={colors.textSecondary}
                value={parentName}
                onChangeText={(text) => {
                  setParentName(text);
                  if (errors.parentName) {
                    setErrors({ ...errors, parentName: undefined });
                  }
                }}
                editable={!loading}
              />
              {errors.parentName ? (
                <Text style={styles.errorMessage}>{errors.parentName}</Text>
              ) : null}
            </View>

            {/* Partner Name (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Naam partner (optioneel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Naam van je partner"
                placeholderTextColor={colors.textSecondary}
                value={partnerName}
                onChangeText={setPartnerName}
                editable={!loading}
              />
            </View>

            {/* Children Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Kinderen (optioneel)</Text>
              
              {/* Children List */}
              {children.map((child) => (
                <View key={child.id} style={styles.childItem}>
                  <View style={styles.childInfo}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={styles.childName}>{child.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveChild(child.id)}
                    disabled={loading}
                    style={styles.removeButton}
                  >
                    <IconSymbol
                      ios_icon_name="trash.fill"
                      android_material_icon_name="delete"
                      size={20}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Child Input */}
              <View style={styles.addChildContainer}>
                <TextInput
                  style={styles.childInput}
                  placeholder="Naam kind"
                  placeholderTextColor={colors.textSecondary}
                  value={newChildName}
                  onChangeText={setNewChildName}
                  editable={!loading}
                  onSubmitEditing={handleAddChild}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newChildName.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={handleAddChild}
                  disabled={!newChildName.trim() || loading}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Doorgaan</Text>
              )}
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  removeButton: {
    padding: 8,
  },
  addChildContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  childInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
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
});

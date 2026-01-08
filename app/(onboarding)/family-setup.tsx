
import { IconSymbol } from "@/components/IconSymbol";
import { authenticatedPost } from "@/utils/api";
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
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter, usePathname } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import React, { useState, useEffect } from "react";

interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "partner" | "child";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: Platform.OS === "ios" ? 60 : 40,
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    marginBottom: 16,
  },
  childrenContainer: {
    marginTop: 8,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  childInput: {
    ...commonStyles.input,
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  continueButton: {
    ...commonStyles.button,
    marginTop: 32,
    marginBottom: Platform.OS === "ios" ? 40 : 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...commonStyles.buttonText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function FamilySetupScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('[FamilySetup] Screen loaded');
    console.log('[FamilySetup] Auth loading:', authLoading);
    console.log('[FamilySetup] User:', user?.id);
    console.log('[FamilySetup] Pathname:', pathname);

    // Redirect to auth if not authenticated
    if (!authLoading && !user) {
      console.log('[FamilySetup] No user, redirecting to auth');
      router.replace('/(tabs)/(home)/auth');
    }
  }, [user, authLoading, pathname]);

  const validateForm = () => {
    return familyName.trim().length > 0 && parentName.trim().length > 0;
  };

  const handleAddChild = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newChild: FamilyMember = {
      id: Date.now().toString(),
      name: "",
      role: "child",
    };
    setChildren([...children, newChild]);
  };

  const handleRemoveChild = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChildren(children.filter((child) => child.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    console.log('[FamilySetup] Submitting family data...');
    setIsSubmitting(true);

    try {
      const members = [
        { name: parentName.trim(), role: "parent" },
        ...(partnerName.trim() ? [{ name: partnerName.trim(), role: "partner" }] : []),
        ...children
          .filter((child) => child.name.trim().length > 0)
          .map((child) => ({ name: child.name.trim(), role: "child" })),
      ];

      console.log('[FamilySetup] Creating family:', { familyName, members });

      const response = await authenticatedPost("/api/families", {
        family_name: familyName.trim(),
        members,
      });

      console.log('[FamilySetup] Family created successfully:', response);

      // Navigate directly to family-style (no Alert)
      console.log('[FamilySetup] Navigating to family-style');
      router.replace("/(onboarding)/family-style");

    } catch (error: any) {
      console.error("[FamilySetup] Error creating family:", error);
      // Show error but don't block navigation
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect handled in useEffect
  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stel je gezin in</Text>
          <Text style={styles.subtitle}>
            Voeg je gezinsleden toe om te beginnen
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gezinsnaam *</Text>
          <TextInput
            style={styles.input}
            placeholder="bijv. Familie Jansen"
            value={familyName}
            onChangeText={setFamilyName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ouder naam *</Text>
          <TextInput
            style={styles.input}
            placeholder="bijv. Jan"
            value={parentName}
            onChangeText={setParentName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Partner naam (optioneel)</Text>
          <TextInput
            style={styles.input}
            placeholder="bijv. Maria"
            value={partnerName}
            onChangeText={setPartnerName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Kinderen (optioneel)</Text>
          <View style={styles.childrenContainer}>
            {children.map((child, index) => (
              <View key={child.id} style={styles.childItem}>
                <TextInput
                  style={styles.childInput}
                  placeholder={`Kind ${index + 1}`}
                  value={child.name}
                  onChangeText={(text) => {
                    const updated = [...children];
                    updated[index].name = text;
                    setChildren(updated);
                  }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveChild(child.id)}
                >
                  <IconSymbol name="xmark" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
            <IconSymbol name="plus" size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Kind toevoegen</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!validateForm() || isSubmitting) && styles.continueButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!validateForm() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Doorgaan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

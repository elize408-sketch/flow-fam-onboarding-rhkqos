
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function AuthOptionsScreen() {
  const router = useRouter();

  const handleOption = async (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mark onboarding as complete
    await AsyncStorage.setItem("onboardingComplete", "true");
    
    // Navigate to the selected auth screen
    router.push(route as any);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Aan de slag</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleOption("/(tabs)/(home)/email-signup")}
          >
            <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
            <Text style={styles.authButtonText}>Aanmelden met e-mail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleOption("/(tabs)/(home)/google-auth")}
          >
            <IconSymbol name="globe" size={24} color={colors.primary} />
            <Text style={styles.authButtonText}>Doorgaan met Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleOption("/(tabs)/(home)/apple-auth")}
          >
            <IconSymbol name="apple.logo" size={24} color={colors.primary} />
            <Text style={styles.authButtonText}>Doorgaan met Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleOption("/(tabs)/(home)/login")}
          >
            <IconSymbol name="person.fill" size={24} color={colors.primary} />
            <Text style={styles.authButtonText}>Inloggen met bestaand account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authButton}
            onPress={() => handleOption("/(tabs)/(home)/invite-code")}
          >
            <IconSymbol name="ticket.fill" size={24} color={colors.primary} />
            <Text style={styles.authButtonText}>Inloggen met uitnodigingscode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 120 : 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 40,
    textAlign: "center",
  },
  buttonsContainer: {
    gap: 16,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
});

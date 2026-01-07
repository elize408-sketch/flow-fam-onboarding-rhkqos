
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useRouter } from "expo-router";

const LANGUAGES = [
  { code: "en", name: "Engels" },
  { code: "es", name: "Spaans" },
  { code: "fr", name: "Frans" },
  { code: "de", name: "Duits" },
  { code: "nl", name: "Nederlands" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(code);
  };

  const handleNext = () => {
    if (!selectedLanguage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth-options");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Image 
          source={require("@/assets/images/128477ea-8dd8-4186-9fc2-469b21f2f598.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Welkom bij Flow Fam</Text>
        <Text style={styles.subtitle}>Kies je taal</Text>

        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                selectedLanguage === lang.code && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLanguage === lang.code && styles.languageTextSelected,
                ]}
              >
                {lang.name}
              </Text>
              {selectedLanguage === lang.code && (
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !selectedLanguage && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedLanguage}
      >
        <Text style={styles.nextButtonText}>Volgende</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  languageList: {
    gap: 12,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  languageText: {
    fontSize: 17,
    color: colors.text,
    fontWeight: "500",
  },
  languageTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  nextButton: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    ...commonStyles.shadow,
  },
  nextButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const LANGUAGES = [
  { label: "Engels", value: "en" },
  { label: "Spaans", value: "es" },
  { label: "Frans", value: "fr" },
  { label: "Duits", value: "de" },
  { label: "Nederlands", value: "nl" },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { session, loading } = useSupabaseAuth();

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Als ingelogd: meteen door naar home
  useEffect(() => {
    if (!loading && session) {
      router.replace("/(tabs)/(home)/home");
    }
  }, [loading, session, router]);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("@flow_fam_language");
      if (saved) setSelectedLanguage(saved);
    } catch (error) {
      console.log("Error loading language:", error);
    }
  };

  const handleLanguageSelect = async (languageValue: string) => {
    try {
      await AsyncStorage.setItem("@flow_fam_language", languageValue);
      setSelectedLanguage(languageValue);
      setDropdownOpen(false);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  const handleNext = () => {
    if (selectedLanguage) router.push("/(tabs)/(home)/auth-options");
  };

  const selectedLanguageLabel =
    LANGUAGES.find((lang) => lang.value === selectedLanguage)?.label || "Selecteer een taal";

  // Loading state: altijd iets renderen
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Bezig met laden…</Text>
      </View>
    );
  }

  // Als session bestaat, doen we redirect (boven) en tonen we tijdelijk ook iets
  if (session) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Je wordt ingelogd…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={commonStyles.title}>Welkom bij Flow Fam</Text>
            <Text style={commonStyles.subtitle}>Kies je taal</Text>
          </View>

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>{selectedLanguageLabel}</Text>
              <IconSymbol
                ios_icon_name={dropdownOpen ? "chevron.up" : "chevron.down"}
                android_material_icon_name={dropdownOpen ? "arrow-upward" : "arrow-downward"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.value}
                    style={[
                      styles.dropdownItem,
                      selectedLanguage === language.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleLanguageSelect(language.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedLanguage === language.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {language.label}
                    </Text>

                    {selectedLanguage === language.value && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedLanguage && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Volgende</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === "android" ? 80 : 60,
    paddingBottom: 120,
  },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { marginBottom: 48 },
  dropdownContainer: { width: "100%", zIndex: 1000 },
  dropdownButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.highlight,
    elevation: 2,
  },
  dropdownButtonText: { fontSize: 16, fontWeight: "600", color: colors.text },
  dropdownList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.highlight,
    elevation: 4,
    maxHeight: 280,
  },
  dropdownItem: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  dropdownItemSelected: { backgroundColor: colors.highlight },
  dropdownItemText: { fontSize: 16, fontWeight: "500", color: colors.text },
  dropdownItemTextSelected: { color: colors.primary, fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    elevation: 4,
  },
  nextButtonDisabled: { backgroundColor: colors.textSecondary, opacity: 0.5 },
  nextButtonText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
});

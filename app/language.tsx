
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/IconSymbol";

const LANGUAGE_STORAGE_KEY = 'app_language';

const translations = {
  en: { welcome: "Welcome to Flow Fam", choose: "Choose your language", next: "Next" },
  nl: { welcome: "Welkom bij Flow Fam", choose: "Kies je taal", next: "Volgende" },
  es: { welcome: "Bienvenido a Flow Fam", choose: "Elige tu idioma", next: "Siguiente" },
  fr: { welcome: "Bienvenue chez Flow Fam", choose: "Choisissez votre langue", next: "Suivant" },
  de: { welcome: "Willkommen bei Flow Fam", choose: "Wähle deine Sprache", next: "Weiter" },
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && translations[stored as keyof typeof translations]) {
        setSelectedLanguage(stored);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = async (code: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLanguage(code);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(tabs)/(home)/auth-options');
  };

  const t = translations[selectedLanguage as keyof typeof translations];

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/128477ea-8dd8-4186-9fc2-469b21f2f598.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{t.welcome}</Text>
        <Text style={styles.subtitle}>{t.choose}</Text>

        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                selectedLanguage === lang.code && styles.languageButtonSelected,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  selectedLanguage === lang.code && styles.languageNameSelected,
                ]}
              >
                {lang.name}
              </Text>
              {selectedLanguage === lang.code && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[commonStyles.primaryButton, styles.nextButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={commonStyles.primaryButtonText}>{t.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  languageList: {
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  languageNameSelected: {
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    width: '100%',
  },
});

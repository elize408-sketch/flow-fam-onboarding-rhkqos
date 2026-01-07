
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';

const LANGUAGE_STORAGE_KEY = 'user_language';

const translations = {
  en: { welcome: 'Welcome to Flow Fam', choose: 'Choose your language', next: 'Next' },
  nl: { welcome: 'Welkom bij Flow Fam', choose: 'Kies je taal', next: 'Volgende' },
  es: { welcome: 'Bienvenido a Flow Fam', choose: 'Elige tu idioma', next: 'Siguiente' },
  fr: { welcome: 'Bienvenue chez Flow Fam', choose: 'Choisissez votre langue', next: 'Suivant' },
  de: { welcome: 'Willkommen bei Flow Fam', choose: 'Wähle deine Sprache', next: 'Weiter' },
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'nl', label: 'Nederlands' },
];

export default function LanguageScreen() {
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const handleLanguageSelect = async (lang: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const handleNext = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(onboarding)/auth-options');
  };

  const { welcome, choose, next } = translations[language as keyof typeof translations];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo - Full opacity, properly sized and centered */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/128477ea-8dd8-4186-9fc2-469b21f2f598.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{welcome}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{choose}</Text>

        {/* Language Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={language}
            onValueChange={(value) => handleLanguageSelect(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item key={lang.code} label={lang.label} value={lang.code} />
            ))}
          </Picker>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button - Fully visible with proper safe area spacing */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{next}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    opacity: 1.0, // Full opacity - logo is now clearly visible
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 56,
    color: colors.text,
  },
  pickerItem: {
    fontSize: 18,
    color: colors.text,
    height: 180,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

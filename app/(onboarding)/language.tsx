
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Picker } from '@react-native-picker/picker';

const LANGUAGE_STORAGE_KEY = 'app_language';

const LANGUAGES = [
  { label: 'Engels', value: 'en' },
  { label: 'Spaans', value: 'es' },
  { label: 'Frans', value: 'fr' },
  { label: 'Duits', value: 'de' },
  { label: 'Nederlands', value: 'nl' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('nl');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        setSelectedLanguage(stored);
      }
    } catch (error) {
      console.error('[Language] Error loading stored language:', error);
    }
  };

  const handleLanguageSelect = (lang: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLanguage(lang);
  };

  const handleNext = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
      console.log('[Language] Language saved:', selectedLanguage);
      
      router.replace('/(onboarding)/auth');
    } catch (error) {
      console.error('[Language] Error saving language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welkom bij Flow Fam</Text>
          <Text style={styles.subtitle}>Kies je taal</Text>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={handleLanguageSelect}
            style={styles.picker}
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.value}
                label={lang.label}
                value={lang.value}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Volgende</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  picker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

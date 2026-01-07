
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";

const LANGUAGES = [
  { code: "en", label: "Engels" },
  { code: "es", label: "Spaans" },
  { code: "fr", label: "Frans" },
  { code: "de", label: "Duits" },
  { code: "nl", label: "Nederlands" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: "center",
  },
  pickerContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  buttonContainer: {
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  button: {
    ...commonStyles.button,
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: "#FFFFFF",
  },
});

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default to English

  useEffect(() => {
    // Load saved language preference
    AsyncStorage.getItem("app_language").then((saved) => {
      if (saved) {
        setSelectedLanguage(saved);
      }
    });
  }, []);

  const handleNext = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Save language selection
    await AsyncStorage.setItem("app_language", selectedLanguage);
    
    router.push("/(tabs)/(home)/auth-options");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/final_quest_240x240.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welkom bij Flow Fam</Text>
        <Text style={styles.subtitle}>Kies je taal</Text>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value)}
            style={styles.picker}
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.label}
                value={lang.code}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Volgende</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

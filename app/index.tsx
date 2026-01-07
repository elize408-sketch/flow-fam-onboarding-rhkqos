
import { Redirect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [languageComplete, setLanguageComplete] = useState<boolean | null>(null);
  const [familySetupComplete, setFamilySetupComplete] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const language = await AsyncStorage.getItem("onboardingComplete");
      setLanguageComplete(language === "true");

      // If user is authenticated, check family setup status from backend
      if (user) {
        console.log("[Index] User authenticated, checking family setup status from backend...");
        const { checkFamilySetupStatus } = await import("@/contexts/AuthContext");
        // Note: We can't call checkFamilySetupStatus directly here as it's part of the context
        // Instead, we'll rely on the AuthContext to handle this
        // For now, check AsyncStorage as fallback
        const familySetup = await AsyncStorage.getItem("familySetupComplete");
        setFamilySetupComplete(familySetup === "true");
      } else {
        setFamilySetupComplete(false);
      }
    } catch (e) {
      console.error("[Index] Error checking onboarding status:", e);
      setLanguageComplete(false);
      setFamilySetupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth and onboarding status
  if (isLoading || authLoading || languageComplete === null || familySetupComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Flow:
  // 1. If language not selected -> language onboarding
  // 2. If not authenticated -> auth options
  // 3. If authenticated but family setup not complete -> family setup
  // 4. If everything complete -> home

  // Step 1: Language onboarding
  if (!languageComplete) {
    return <Redirect href="/(onboarding)/language" />;
  }

  // Step 2: Authentication
  if (!user) {
    return <Redirect href="/(onboarding)/auth-options" />;
  }

  // Step 3: Family setup (only if authenticated)
  if (!familySetupComplete) {
    return <Redirect href="/(onboarding)/family-setup" />;
  }

  // Step 4: All complete - go to home
  return <Redirect href="/(tabs)/(home)" />;
}

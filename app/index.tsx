
import { Redirect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/utils/api";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [languageComplete, setLanguageComplete] = useState<boolean | null>(null);
  const [familySetupComplete, setFamilySetupComplete] = useState<boolean | null>(null);
  const [familyStyleComplete, setFamilyStyleComplete] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, authLoading]);

  const checkOnboardingStatus = async () => {
    try {
      const language = await AsyncStorage.getItem("onboardingComplete");
      setLanguageComplete(language === "true");

      // If user is authenticated, check family setup and style status from backend
      if (user && !authLoading) {
        console.log("[Index] User authenticated, checking onboarding status from backend...");
        
        try {
          const profile = await getUserProfile();
          console.log("[Index] Profile data:", profile);
          
          // Check family setup status
          const setupComplete = profile.familySetupComplete || false;
          setFamilySetupComplete(setupComplete);
          
          // Check family style status (from backend or AsyncStorage)
          // The backend should have a familyStyleComplete field
          const styleComplete = (profile as any).familyStyleComplete || false;
          setFamilyStyleComplete(styleComplete);
          
          // Cache locally
          if (setupComplete) {
            await AsyncStorage.setItem("familySetupComplete", "true");
          }
          if (styleComplete) {
            await AsyncStorage.setItem("familyStyleComplete", "true");
          }
          
          console.log("[Index] Onboarding status:", {
            languageComplete,
            familySetupComplete: setupComplete,
            familyStyleComplete: styleComplete,
          });
        } catch (error) {
          console.error("[Index] Error fetching profile, using AsyncStorage fallback:", error);
          
          // Fallback to AsyncStorage if backend call fails
          const familySetup = await AsyncStorage.getItem("familySetupComplete");
          const familyStyle = await AsyncStorage.getItem("familyStyleComplete");
          setFamilySetupComplete(familySetup === "true");
          setFamilyStyleComplete(familyStyle === "true");
        }
      } else {
        setFamilySetupComplete(false);
        setFamilyStyleComplete(false);
      }
    } catch (e) {
      console.error("[Index] Error checking onboarding status:", e);
      setLanguageComplete(false);
      setFamilySetupComplete(false);
      setFamilyStyleComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth and onboarding status
  if (
    isLoading || 
    authLoading || 
    languageComplete === null || 
    familySetupComplete === null ||
    familyStyleComplete === null
  ) {
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
  // 4. If authenticated and family setup complete but style not complete -> family style
  // 5. If everything complete -> home

  // Step 1: Language onboarding
  if (!languageComplete) {
    console.log("[Index] Redirecting to language onboarding");
    return <Redirect href="/(onboarding)/language" />;
  }

  // Step 2: Authentication
  if (!user) {
    console.log("[Index] Redirecting to auth options");
    return <Redirect href="/(onboarding)/auth-options" />;
  }

  // Step 3: Family setup (only if authenticated)
  if (!familySetupComplete) {
    console.log("[Index] Redirecting to family setup");
    return <Redirect href="/(onboarding)/family-setup" />;
  }

  // Step 4: Family style (only if family setup is complete)
  if (!familyStyleComplete) {
    console.log("[Index] Redirecting to family style");
    return <Redirect href="/(onboarding)/family-style" />;
  }

  // Step 5: All complete - go to home
  console.log("[Index] All onboarding complete, redirecting to home");
  return <Redirect href="/(tabs)/(home)" />;
}

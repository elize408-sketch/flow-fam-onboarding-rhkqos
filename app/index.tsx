import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const completed = await AsyncStorage.getItem("onboardingComplete");
        setHasCompletedOnboarding(completed === "true");
      } catch (e) {
        console.error("Error checking onboarding status:", e);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return hasCompletedOnboarding
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(onboarding)/language" />;
}


import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text } from "react-native";
import ErrorBoundary from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "debug",
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Always render something, even while loading
  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 20 }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="debug" />
          {/* Temporarily disabled - will re-enable one by one */}
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="modal" options={{ presentation: "modal", title: "Standard Modal" }} /> */}
          {/* <Stack.Screen name="formsheet" options={{ presentation: "formSheet", title: "Form Sheet Modal" }} /> */}
          {/* <Stack.Screen name="transparent-modal" options={{ presentation: "transparentModal", headerShown: false }} /> */}
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

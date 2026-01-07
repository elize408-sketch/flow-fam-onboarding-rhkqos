import "react-native-reanimated";
import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main app */}
        <Stack.Screen name="(tabs)" />

        {/* Modals (alleen laten staan als deze routes écht bestaan) */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="formsheet" options={{ presentation: "formSheet" }} />
        <Stack.Screen
          name="transparent-modal"
          options={{ presentation: "transparentModal" }}
        />

        {/* OAuth screens (alleen laten staan als deze routes écht bestaan) */}
        <Stack.Screen name="auth-popup" />
        <Stack.Screen name="auth-callback" />
      </Stack>
    </GestureHandlerRootView>
  );
}

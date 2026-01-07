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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Optional modals (als je ze gebruikt) */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="formsheet" options={{ presentation: "formSheet" }} />
        <Stack.Screen
          name="transparent-modal"
          options={{ presentation: "transparentModal", headerShown: false }}
        />

        {/* OAuth screens (als ze bestaan) */}
        <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

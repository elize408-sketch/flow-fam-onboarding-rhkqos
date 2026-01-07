import "react-native-reanimated";
import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="debug" options={{ headerShown: false }} />
          <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
          <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="transparent-modal" 
            options={{ 
              presentation: 'transparentModal',
              headerShown: false,
              animation: 'fade'
            }} 
          />
          <Stack.Screen 
            name="formsheet" 
            options={{ 
              presentation: 'formSheet',
              headerShown: false 
            }} 
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

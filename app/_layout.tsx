
import React from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

function LoadingScreen({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 12, opacity: 0.7 }}>{label}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

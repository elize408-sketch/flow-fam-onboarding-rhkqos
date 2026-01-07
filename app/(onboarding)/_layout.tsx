
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language" />
      <Stack.Screen name="auth-options" />
      <Stack.Screen name="family-setup" />
    </Stack>
  );
}

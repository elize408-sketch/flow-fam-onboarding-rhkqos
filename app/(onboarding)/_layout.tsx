
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="email-signup" />
      <Stack.Screen name="family-setup" />
      <Stack.Screen name="family-style" />
    </Stack>
  );
}

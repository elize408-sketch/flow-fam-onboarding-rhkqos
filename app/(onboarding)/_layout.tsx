
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="language" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="auth-options" />
      <Stack.Screen name="email-signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="google-auth" />
      <Stack.Screen name="apple-auth" />
      <Stack.Screen name="invite-code" />
      <Stack.Screen name="family-setup" />
      <Stack.Screen name="family-style" />
    </Stack>
  );
}

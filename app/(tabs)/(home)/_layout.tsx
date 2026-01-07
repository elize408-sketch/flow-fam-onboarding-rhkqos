import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Taal'
        }}
      />
      <Stack.Screen
        name="auth-options"
        options={{
          headerShown: false,
          title: 'Aan de slag'
        }}
      />
      <Stack.Screen
        name="email-signup"
        options={{
          headerShown: false,
          title: 'Account aanmaken'
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: 'Inloggen'
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
          title: 'Home'
        }}
      />
      <Stack.Screen
        name="google-auth"
        options={{
          headerShown: false,
          title: 'Google'
        }}
      />
      <Stack.Screen
        name="apple-auth"
        options={{
          headerShown: false,
          title: 'Apple'
        }}
      />
      <Stack.Screen
        name="invite-code"
        options={{
          headerShown: false,
          title: 'Uitnodigingscode'
        }}
      />
    </Stack>
  );
}

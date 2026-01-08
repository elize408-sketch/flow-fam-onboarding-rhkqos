
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function AuthScreen() {
  const router = useRouter();

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Aan de slag</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => handlePress('/(onboarding)/email-signup')}
          >
            <IconSymbol name="envelope.fill" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Aanmelden met e-mail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/google-auth')}
          >
            <IconSymbol name="globe" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Doorgaan met Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/apple-auth')}
          >
            <IconSymbol name="apple.logo" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Doorgaan met Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/login')}
          >
            <IconSymbol name="person.fill" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Inloggen met bestaand account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/invite-code')}
          >
            <IconSymbol name="ticket.fill" size={20} color="#000" />
            <Text style={styles.secondaryButtonText}>Inloggen met uitnodigingscode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#000',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

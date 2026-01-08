
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
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

export default function AuthScreen() {
  const router = useRouter();

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Aan de slag</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => handlePress('/(onboarding)/email-signup')}
            activeOpacity={0.8}
          >
            <IconSymbol ios_icon_name="envelope.fill" android_material_icon_name="email" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Aanmelden met e-mail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={() => handlePress('/(onboarding)/google-auth')}
            activeOpacity={0.8}
          >
            <IconSymbol ios_icon_name="globe" android_material_icon_name="language" size={20} color="#1F2937" />
            <Text style={styles.socialButtonText}>Doorgaan met Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.socialButton]}
            onPress={() => handlePress('/(onboarding)/apple-auth')}
            activeOpacity={0.8}
          >
            <IconSymbol ios_icon_name="apple.logo" android_material_icon_name="phone-iphone" size={20} color="#1F2937" />
            <Text style={styles.socialButtonText}>Doorgaan met Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/login')}
            activeOpacity={0.8}
          >
            <IconSymbol ios_icon_name="person.fill" android_material_icon_name="person" size={20} color="#4F46E5" />
            <Text style={styles.secondaryButtonText}>Inloggen met bestaand account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handlePress('/(onboarding)/invite-code')}
            activeOpacity={0.8}
          >
            <IconSymbol ios_icon_name="ticket.fill" android_material_icon_name="confirmation-number" size={20} color="#4F46E5" />
            <Text style={styles.secondaryButtonText}>Inloggen met uitnodigingscode</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Terug</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
});


import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('[Index] Checking onboarding status...', { user: !!user, authLoading });

        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }

        // Check language selection
        const languageSelected = await AsyncStorage.getItem('languageSelected');
        console.log('[Index] Language selected:', languageSelected);

        if (!languageSelected) {
          console.log('[Index] → Redirecting to language selection');
          router.replace('/(onboarding)/language');
          return;
        }

        // Check authentication
        if (!user) {
          console.log('[Index] → No user, redirecting to auth');
          router.replace('/(onboarding)/auth');
          return;
        }

        // Check family setup status
        const familySetupComplete = await AsyncStorage.getItem(`familySetupComplete_${user.id}`);
        console.log('[Index] Family setup complete:', familySetupComplete, 'for user:', user.id);

        if (!familySetupComplete || familySetupComplete === 'false') {
          console.log('[Index] → Redirecting to family-setup');
          router.replace('/(onboarding)/family-setup');
          return;
        }

        // Check family style status
        const familyStyleComplete = await AsyncStorage.getItem(`familyStyleComplete_${user.id}`);
        console.log('[Index] Family style complete:', familyStyleComplete);

        if (!familyStyleComplete || familyStyleComplete === 'false') {
          console.log('[Index] → Redirecting to family-style');
          router.replace('/(onboarding)/family-style');
          return;
        }

        // All onboarding complete
        console.log('[Index] → Onboarding complete, redirecting to home');
        router.replace('/(tabs)/(home)');
      } catch (error) {
        console.error('[Index] Error checking onboarding status:', error);
        // Fallback to auth on error
        router.replace('/(onboarding)/auth');
      } finally {
        setIsChecking(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('[Index] Timeout reached, forcing navigation');
      if (isChecking) {
        setIsChecking(false);
        router.replace('/(onboarding)/auth');
      }
    }, 3000);

    checkOnboardingStatus();

    return () => clearTimeout(timeout);
  }, [user, authLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Authenticatie controleren...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

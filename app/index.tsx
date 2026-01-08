
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const LANGUAGE_STORAGE_KEY = 'app_language';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only run check if we're on the index route
    if (pathname !== '/') return;

    const checkOnboardingStatus = async () => {
      try {
        console.log('[Index] Checking onboarding status...');
        console.log('[Index] Auth loading:', authLoading);
        console.log('[Index] User:', user);

        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }

        // Check language selection
        const languageSelected = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        console.log('[Index] Language selected:', languageSelected);

        if (!languageSelected) {
          console.log('[Index] → Redirecting to language selection');
          router.replace('/(onboarding)/language');
          return;
        }

        // Check authentication
        if (!user) {
          console.log('[Index] → Redirecting to auth');
          router.replace('/(onboarding)/auth');
          return;
        }

        // Check family setup status
        const familySetupComplete = await AsyncStorage.getItem('familySetupComplete');
        console.log('[Index] Family setup complete:', familySetupComplete);

        if (!familySetupComplete) {
          console.log('[Index] → Redirecting to family setup');
          router.replace('/(onboarding)/family-setup');
          return;
        }

        // Check family style status
        const familyStyleComplete = await AsyncStorage.getItem('familyStyleComplete');
        console.log('[Index] Family style complete:', familyStyleComplete);

        if (!familyStyleComplete) {
          console.log('[Index] → Redirecting to family style');
          router.replace('/(onboarding)/family-style');
          return;
        }

        // All onboarding complete - go to home
        console.log('[Index] → Onboarding complete, redirecting to home');
        router.replace('/(tabs)/(home)');
      } catch (error) {
        console.error('[Index] Error checking onboarding status:', error);
        // Fallback to language selection on error
        router.replace('/(onboarding)/language');
      } finally {
        setChecking(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (checking) {
        console.warn('[Index] Timeout reached, forcing navigation');
        setChecking(false);
        router.replace('/(onboarding)/language');
      }
    }, 3000);

    checkOnboardingStatus();

    return () => clearTimeout(timeout);
  }, [authLoading, user, pathname]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

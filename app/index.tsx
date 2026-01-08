
import { Redirect, useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedGet } from '@/utils/api';
import { colors } from '@/styles/commonStyles';

const LANGUAGE_STORAGE_KEY = 'app_language';
const TIMEOUT_MS = 2000;

interface OnboardingStatus {
  languageSelected: boolean;
  hasFamily: boolean;
  familyStyleComplete: boolean;
}

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    // Prevent redirect loops - only run on index route
    if (pathname !== '/') {
      console.log('[Index] Not on index route, skipping:', pathname);
      return;
    }

    checkOnboardingStatus();
  }, [user, authLoading, pathname]);

  const checkOnboardingStatus = async () => {
    console.log('[Index] Starting onboarding check...');
    console.log('[Index] Auth loading:', authLoading);
    console.log('[Index] User:', user?.id);

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[Index] Waiting for auth...');
      return;
    }

    // Set timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('[Index] Timeout reached! Forcing fallback route.');
      setIsChecking(false);
      if (!user) {
        router.replace('/(tabs)/(home)/auth');
      } else {
        router.replace('/(onboarding)/family-setup');
      }
    }, TIMEOUT_MS);

    try {
      // No user = go to auth
      if (!user) {
        console.log('[Index] No user, redirecting to auth');
        clearTimeout(timeoutId);
        setIsChecking(false);
        router.replace('/(tabs)/(home)/auth');
        return;
      }

      // Check language selection
      const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const languageSelected = !!language;
      console.log('[Index] Language selected:', languageSelected);

      if (!languageSelected) {
        console.log('[Index] No language, redirecting to language selection');
        clearTimeout(timeoutId);
        setIsChecking(false);
        router.replace('/(onboarding)/language');
        return;
      }

      // Check family setup status
      console.log('[Index] Checking family status...');
      let hasFamily = false;
      let familyStyleComplete = false;

      try {
        const familyMembers = await authenticatedGet('/api/families/members');
        hasFamily = Array.isArray(familyMembers) && familyMembers.length > 0;
        console.log('[Index] Has family:', hasFamily, 'Members:', familyMembers?.length);

        // Check if all members have colors (family style complete)
        if (hasFamily) {
          familyStyleComplete = familyMembers.every((member: any) => !!member.color);
          console.log('[Index] Family style complete:', familyStyleComplete);
        }
      } catch (error: any) {
        console.log('[Index] Family check error (expected if no family):', error.message);
        hasFamily = false;
        familyStyleComplete = false;
      }

      clearTimeout(timeoutId);
      setOnboardingStatus({ languageSelected, hasFamily, familyStyleComplete });

      // Route based on status
      if (!hasFamily) {
        console.log('[Index] No family, redirecting to family-setup');
        setIsChecking(false);
        router.replace('/(onboarding)/family-setup');
        return;
      }

      if (!familyStyleComplete) {
        console.log('[Index] Family style incomplete, redirecting to family-style');
        setIsChecking(false);
        router.replace('/(onboarding)/family-style');
        return;
      }

      // All onboarding complete
      console.log('[Index] Onboarding complete, redirecting to home');
      setIsChecking(false);
      router.replace('/(tabs)/(home)');

    } catch (error) {
      console.error('[Index] Error checking onboarding status:', error);
      clearTimeout(timeoutId);
      setIsChecking(false);
      // Fallback to auth on error
      router.replace('/(tabs)/(home)/auth');
    }
  };

  // Show loading screen while checking
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Authenticatie controleren…</Text>
      </View>
    );
  }

  // Fallback redirect (should not reach here)
  return <Redirect href="/(tabs)/(home)/auth" />;
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
    color: colors.text,
  },
});

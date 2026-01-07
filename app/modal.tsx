/**
 * Example Modal Screen - API Integration Demo
 * 
 * This screen demonstrates how to use all the backend API endpoints.
 * It serves as a reference for developers implementing new features.
 */

import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import {
  getFamilyMembers,
  updateFamilyMemberStyle,
  completeFamilyStyleSetup,
  uploadAvatar,
  getUserProfile,
  createFamily,
  verifySession,
} from '@/utils/api';

export default function Modal() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const testGetFamilyMembers = async () => {
    setLoading(true);
    try {
      const result = await getFamilyMembers();
      Alert.alert('Success', `Found ${result.members.length} family members`);
      console.log('Family members:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateMemberStyle = async () => {
    setLoading(true);
    try {
      // First get members to get a valid ID
      const { members } = await getFamilyMembers();
      if (members.length === 0) {
        Alert.alert('Error', 'No family members found. Create a family first.');
        return;
      }

      // Update the first member's color
      const result = await updateFamilyMemberStyle(members[0].id, {
        color: '#FF6B6B',
      });
      Alert.alert('Success', `Updated ${result.name}'s color to ${result.color}`);
      console.log('Updated member:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCompleteStyleSetup = async () => {
    setLoading(true);
    try {
      const result = await completeFamilyStyleSetup();
      Alert.alert('Success', result.message);
      console.log('Style setup complete:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGetProfile = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      Alert.alert('Profile', `Email: ${result.email}\nFamily Setup: ${result.familySetupComplete ? 'Complete' : 'Incomplete'}`);
      console.log('User profile:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVerifySession = async () => {
    setLoading(true);
    try {
      const result = await verifySession();
      Alert.alert('Session', `Authenticated: ${result.authenticated}\nUser: ${result.user?.email || 'N/A'}`);
      console.log('Session verification:', result);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>API Integration Demo</Text>
        <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          Test all backend API endpoints
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Family Management</Text>
          
          <Pressable onPress={testGetFamilyMembers} disabled={loading}>
            <GlassView style={styles.button} glassEffectStyle="clear">
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Get Family Members
              </Text>
            </GlassView>
          </Pressable>

          <Pressable onPress={testUpdateMemberStyle} disabled={loading}>
            <GlassView style={styles.button} glassEffectStyle="clear">
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Update Member Style
              </Text>
            </GlassView>
          </Pressable>

          <Pressable onPress={testCompleteStyleSetup} disabled={loading}>
            <GlassView style={styles.button} glassEffectStyle="clear">
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Complete Style Setup
              </Text>
            </GlassView>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>User Profile</Text>
          
          <Pressable onPress={testGetProfile} disabled={loading}>
            <GlassView style={styles.button} glassEffectStyle="clear">
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Get User Profile
              </Text>
            </GlassView>
          </Pressable>

          <Pressable onPress={testVerifySession} disabled={loading}>
            <GlassView style={styles.button} glassEffectStyle="clear">
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Verify Session
              </Text>
            </GlassView>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            💡 All API calls are logged to the console. Check the logs for detailed responses.
          </Text>
        </View>

        <Pressable onPress={() => router.back()}>
          <GlassView style={[styles.button, styles.closeButton]} glassEffectStyle="clear">
            <Text style={[styles.buttonText, { color: '#EF4444' }]}>Close</Text>
          </GlassView>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

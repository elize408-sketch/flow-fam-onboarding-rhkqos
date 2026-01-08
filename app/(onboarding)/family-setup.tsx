
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'partner' | 'child';
}

export default function FamilySetupScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      console.log('[FamilySetup] No user, redirecting to auth');
      router.replace('/(onboarding)/auth');
    }
  }, [user, authLoading]);

  const handleAddChild = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newChild: FamilyMember = {
      id: Date.now().toString(),
      name: '',
      role: 'child',
    };
    setChildren([...children, newChild]);
  };

  const handleRemoveChild = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChildren(children.filter((child) => child.id !== id));
  };

  const updateChildName = (id: string, name: string) => {
    setChildren(
      children.map((child) =>
        child.id === id ? { ...child, name } : child
      )
    );
  };

  const validateForm = () => {
    if (!familyName.trim()) {
      Alert.alert('Fout', 'Vul een familienaam in');
      return false;
    }
    if (!parentName.trim()) {
      Alert.alert('Fout', 'Vul de naam van de ouder in');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // TODO: Backend Integration - Save family data to backend API
      // For now, just save locally
      await AsyncStorage.setItem('familySetupComplete', 'true');
      await AsyncStorage.setItem('familyName', familyName);
      
      console.log('[FamilySetup] Family setup complete');
      router.replace('/(onboarding)/family-style');
    } catch (error: any) {
      console.error('[FamilySetup] Error:', error);
      Alert.alert('Fout', error.message || 'Gezin aanmaken mislukt');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Stel je gezin in</Text>
            <Text style={styles.subtitle}>Voeg gezinsleden toe</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Familienaam *</Text>
              <TextInput
                style={styles.input}
                placeholder="Bijv. Familie Jansen"
                value={familyName}
                onChangeText={setFamilyName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Naam ouder *</Text>
              <TextInput
                style={styles.input}
                placeholder="Je naam"
                value={parentName}
                onChangeText={setParentName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Naam partner (optioneel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Naam van je partner"
                value={partnerName}
                onChangeText={setPartnerName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.childrenSection}>
              <View style={styles.childrenHeader}>
                <Text style={styles.label}>Kinderen (optioneel)</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddChild}
                  activeOpacity={0.8}
                >
                  <IconSymbol ios_icon_name="plus.circle.fill" android_material_icon_name="add-circle" size={24} color="#4F46E5" />
                </TouchableOpacity>
              </View>

              {children.map((child, index) => (
                <View key={child.id} style={styles.childRow}>
                  <TextInput
                    style={[styles.input, styles.childInput]}
                    placeholder={`Kind ${index + 1}`}
                    value={child.name}
                    onChangeText={(name) => updateChildName(child.id, name)}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveChild(child.id)}
                    activeOpacity={0.8}
                  >
                    <IconSymbol ios_icon_name="trash.fill" android_material_icon_name="delete" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Doorgaan</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  childrenSection: {
    gap: 12,
  },
  childrenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    padding: 4,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childInput: {
    flex: 1,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

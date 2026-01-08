
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { LoadingButton } from '@/components/LoadingButton';
import React, { useState, useEffect } from 'react';
import { authenticatedGet, authenticatedPatch, authenticatedPost, BACKEND_URL } from '@/utils/api';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'partner' | 'child';
  color?: string;
  avatar_url?: string;
}

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B88B', '#A8E6CF'
];

export default function FamilyStyleScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [avatarImages, setAvatarImages] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      console.log('[FamilyStyle] Loading family members...');
      const response = await authenticatedGet<{ members: FamilyMember[] }>('/api/families/members');
      const members = response.members || [];
      console.log('[FamilyStyle] Loaded members:', members.length);
      setFamilyMembers(members);

      // Initialize colors and avatars
      const colors: Record<string, string> = {};
      const avatars: Record<string, string> = {};
      
      members.forEach((member, index) => {
        colors[member.id] = member.color || COLOR_PALETTE[index % COLOR_PALETTE.length];
        if (member.avatar_url) {
          avatars[member.id] = member.avatar_url;
        }
      });

      setSelectedColors(colors);
      setAvatarImages(avatars);
      console.log('[FamilyStyle] Initialized colors:', colors);
    } catch (error) {
      console.error('[FamilyStyle] Error loading family members:', error);
      Alert.alert('Fout', 'Kon gezinsleden niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (memberId: string, color: string) => {
    console.log('[FamilyStyle] Color selected for member:', memberId, color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColors(prev => ({ ...prev, [memberId]: color }));
  };

  const handlePickImage = async (memberId: string) => {
    console.log('[FamilyStyle] Pick image for member:', memberId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuleren', 'Maak foto', 'Kies uit galerij'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await takePhoto(memberId);
          } else if (buttonIndex === 2) {
            await pickFromGallery(memberId);
          }
        }
      );
    } else {
      Alert.alert(
        'Foto kiezen',
        'Kies een optie',
        [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Maak foto', onPress: () => takePhoto(memberId) },
          { text: 'Kies uit galerij', onPress: () => pickFromGallery(memberId) },
        ]
      );
    }
  };

  const takePhoto = async (memberId: string) => {
    console.log('[FamilyStyle] Taking photo for member:', memberId);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming vereist', 'We hebben toegang tot je camera nodig');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(memberId, result.assets[0].uri);
    }
  };

  const pickFromGallery = async (memberId: string) => {
    console.log('[FamilyStyle] Picking from gallery for member:', memberId);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming vereist', 'We hebben toegang tot je fotobibliotheek nodig');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(memberId, result.assets[0].uri);
    }
  };

  const uploadImage = async (memberId: string, uri: string) => {
    try {
      console.log('[FamilyStyle] Uploading image for member:', memberId);
      // TODO: Backend Integration - Upload avatar image to backend storage
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: `avatar-${memberId}.jpg`,
      } as any);

      const response = await fetch(`${BACKEND_URL}/api/upload/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        console.error('[FamilyStyle] Upload failed:', response.status);
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('[FamilyStyle] Upload successful:', data);
      setAvatarImages(prev => ({ ...prev, [memberId]: data.url }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[FamilyStyle] Error uploading image:', error);
      Alert.alert('Fout', 'Kon foto niet uploaden');
    }
  };

  const isColorUsed = (color: string, currentMemberId: string): boolean => {
    // A color is only disabled if it's used by ANOTHER member (not the current one)
    return Object.entries(selectedColors).some(
      ([id, selectedColor]) => id !== currentMemberId && selectedColor === color
    );
  };

  const allMembersHaveColors = (): boolean => {
    return familyMembers.every(member => selectedColors[member.id]);
  };

  const handleContinue = async () => {
    if (!allMembersHaveColors()) {
      Alert.alert('Kies kleuren', 'Kies een kleur voor elk gezinslid');
      return;
    }

    try {
      setSaving(true);
      console.log('[FamilyStyle] Saving family style...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // TODO: Backend Integration - Save each member's color and avatar to backend
      await Promise.all(
        familyMembers.map(member => {
          console.log('[FamilyStyle] Saving style for member:', member.id, {
            color: selectedColors[member.id],
            avatar_url: avatarImages[member.id] || null,
          });
          return authenticatedPatch(`/api/families/members/${member.id}/style`, {
            color: selectedColors[member.id],
            avatar_url: avatarImages[member.id] || null,
          });
        })
      );

      // TODO: Backend Integration - Mark family style setup as complete
      await authenticatedPost('/api/families/complete-style', {});

      // Save completion status locally
      await AsyncStorage.setItem('familyStyleComplete', 'true');
      console.log('[FamilyStyle] Family style saved successfully');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Always navigate to home after successful save
      console.log('[FamilyStyle] Navigating to home...');
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('[FamilyStyle] Error saving family style:', error);
      Alert.alert('Fout', 'Kon stijl niet opslaan. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Gezinsleden laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Kies kleur & foto</Text>
          <Text style={styles.subtitle}>
            Personaliseer elk gezinslid met een kleur en foto
          </Text>
        </View>

        {familyMembers.map((member, index) => (
          <View key={member.id} style={styles.memberCard}>
            <Text style={styles.memberName}>{member.name}</Text>
            
            <TouchableOpacity
              style={[
                styles.avatarCircle,
                selectedColors[member.id] && { borderColor: selectedColors[member.id] }
              ]}
              onPress={() => handlePickImage(member.id)}
              activeOpacity={0.7}
            >
              {avatarImages[member.id] ? (
                <Image
                  source={{ uri: avatarImages[member.id] }}
                  style={styles.avatarImage}
                />
              ) : (
                <IconSymbol 
                  ios_icon_name="camera.fill" 
                  android_material_icon_name="camera" 
                  size={40} 
                  color="#999" 
                />
              )}
            </TouchableOpacity>

            <View style={styles.colorGrid}>
              {COLOR_PALETTE.map((color, colorIndex) => {
                const isSelected = selectedColors[member.id] === color;
                const isDisabled = isColorUsed(color, member.id);

                return (
                  <TouchableOpacity
                    key={`${member.id}-${color}-${colorIndex}`}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      isSelected && styles.colorSwatchSelected,
                      isDisabled && styles.colorSwatchDisabled,
                    ]}
                    onPress={() => !isDisabled && handleColorSelect(member.id, color)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <IconSymbol 
                        ios_icon_name="checkmark" 
                        android_material_icon_name="check" 
                        size={20} 
                        color="#fff" 
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <LoadingButton
          title="Doorgaan"
          onPress={handleContinue}
          loading={saving}
          disabled={!allMembersHaveColors()}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#E0E0E0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  colorSwatchDisabled: {
    opacity: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    width: '100%',
  },
});

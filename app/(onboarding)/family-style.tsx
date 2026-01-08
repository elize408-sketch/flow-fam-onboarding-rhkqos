
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/IconSymbol';

const COLOR_PALETTE = [
  '#4F46E5', // indigo
  '#22C55E', // green
  '#F97316', // orange
  '#EF4444', // red
  '#06B6D4', // cyan
  '#A855F7', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#84CC16', // lime
  '#64748B', // slate
];

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'partner' | 'child';
  color?: string;
  avatar_url?: string;
}

export default function FamilyStyleScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      // TODO: Backend Integration - Load family members from backend API
      // For now, create mock data
      const mockMembers: FamilyMember[] = [
        { id: '1', name: 'Ouder', role: 'parent' },
        { id: '2', name: 'Partner', role: 'partner' },
        { id: '3', name: 'Kind 1', role: 'child' },
      ];
      
      // Auto-assign first available color to each member
      const membersWithColors = mockMembers.map((member, index) => ({
        ...member,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      }));
      
      setMembers(membersWithColors);
    } catch (error) {
      console.error('[FamilyStyle] Error loading members:', error);
    }
  };

  const handleColorSelect = (memberId: string, color: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, color } : member
      )
    );
  };

  const handlePickImage = async (memberId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Foto kiezen',
      'Kies een optie',
      [
        {
          text: 'Maak foto',
          onPress: () => takePhoto(memberId),
        },
        {
          text: 'Kies uit galerij',
          onPress: () => pickFromGallery(memberId),
        },
        {
          text: 'Annuleren',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async (memberId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fout', 'Camera toegang is vereist');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(memberId, result.assets[0].uri);
    }
  };

  const pickFromGallery = async (memberId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fout', 'Galerij toegang is vereist');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(memberId, result.assets[0].uri);
    }
  };

  const uploadImage = async (memberId: string, uri: string) => {
    try {
      // TODO: Backend Integration - Upload image to backend storage
      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, avatar_url: uri } : member
        )
      );
    } catch (error) {
      console.error('[FamilyStyle] Error uploading image:', error);
      Alert.alert('Fout', 'Foto uploaden mislukt');
    }
  };

  const isColorUsed = (color: string, currentMemberId: string) => {
    return members.some(
      (member) => member.id !== currentMemberId && member.color === color
    );
  };

  const allMembersHaveColors = () => {
    return members.every((member) => member.color);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleContinue = async () => {
    if (!allMembersHaveColors()) {
      Alert.alert('Fout', 'Kies een kleur voor elk gezinslid');
      return;
    }

    try {
      setLoading(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // TODO: Backend Integration - Save family member styles to backend API
      await AsyncStorage.setItem('familyStyleComplete', 'true');
      
      console.log('[FamilyStyle] Family style complete');
      router.replace('/(tabs)/(home)');
    } catch (error: any) {
      console.error('[FamilyStyle] Error:', error);
      Alert.alert('Fout', error.message || 'Opslaan mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Kies kleur & foto</Text>
          <Text style={styles.subtitle}>
            Maak je gezinsleden herkenbaar in de app
          </Text>
        </View>

        <View style={styles.membersContainer}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <TouchableOpacity
                style={[
                  styles.avatar,
                  { backgroundColor: member.color || '#E5E7EB' },
                ]}
                onPress={() => handlePickImage(member.id)}
                activeOpacity={0.8}
              >
                {member.avatar_url ? (
                  <Image
                    source={{ uri: member.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.initials}>{getInitials(member.name)}</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.memberName}>{member.name}</Text>

              <View style={styles.colorPicker}>
                {COLOR_PALETTE.map((color) => {
                  const used = isColorUsed(color, member.id);
                  const selected = member.color === color;

                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selected && styles.colorSwatchSelected,
                        used && styles.colorSwatchDisabled,
                      ]}
                      onPress={() => !used && handleColorSelect(member.id, color)}
                      disabled={used}
                      activeOpacity={0.8}
                    >
                      {selected && (
                        <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!allMembersHaveColors() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allMembersHaveColors() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Doorgaan</Text>
          )}
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
  membersContainer: {
    gap: 32,
  },
  memberCard: {
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  colorSwatchDisabled: {
    opacity: 0.3,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
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

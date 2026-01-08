
import { IconSymbol } from "@/components/IconSymbol";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  getFamilyMembers,
  updateFamilyMemberStyle,
  completeFamilyStyleSetup,
  uploadAvatar,
} from "@/utils/api";
import { colors, commonStyles } from "@/styles/commonStyles";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fixed color palette (max 10 colors)
const COLOR_PALETTE = [
  { id: "indigo", hex: "#4F46E5", name: "Indigo" },
  { id: "green", hex: "#22C55E", name: "Groen" },
  { id: "orange", hex: "#F97316", name: "Oranje" },
  { id: "red", hex: "#EF4444", name: "Rood" },
  { id: "cyan", hex: "#06B6D4", name: "Cyaan" },
  { id: "purple", hex: "#A855F7", name: "Paars" },
  { id: "amber", hex: "#F59E0B", name: "Amber" },
  { id: "pink", hex: "#EC4899", name: "Roze" },
  { id: "lime", hex: "#84CC16", name: "Limoen" },
  { id: "slate", hex: "#64748B", name: "Grijs" },
];

interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "partner" | "child";
  color?: string;
  avatar_url?: string;
}

interface MemberStyle {
  color: string;
  avatar_url?: string;
}

export default function FamilyStyleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [memberStyles, setMemberStyles] = useState<Record<string, MemberStyle>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      console.log("[Family Style] Loading family members...");
      const response = await getFamilyMembers();
      console.log("[Family Style] Members loaded:", response.members);
      
      setMembers(response.members);

      // Initialize styles with existing colors or auto-assign first available color
      const styles: Record<string, MemberStyle> = {};
      const usedColors = new Set<string>();

      response.members.forEach((member, index) => {
        if (member.color) {
          styles[member.id] = {
            color: member.color,
            avatar_url: member.avatar_url,
          };
          usedColors.add(member.color);
        } else {
          // Auto-assign first available color
          const availableColor = COLOR_PALETTE.find(
            (c) => !usedColors.has(c.hex)
          );
          if (availableColor) {
            styles[member.id] = {
              color: availableColor.hex,
              avatar_url: member.avatar_url,
            };
            usedColors.add(availableColor.hex);
          }
        }
      });

      setMemberStyles(styles);
    } catch (error) {
      console.error("[Family Style] Error loading members:", error);
      Alert.alert("Fout", "Kon gezinsleden niet laden");
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (memberId: string, color: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setMemberStyles((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        color,
      },
    }));
  };

  const handlePickImage = async (memberId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Toestemming vereist",
        "We hebben toegang tot je foto's nodig om een profielfoto te kiezen."
      );
      return;
    }

    // Show action sheet
    Alert.alert(
      "Profielfoto kiezen",
      "Kies een optie",
      [
        {
          text: "Maak foto",
          onPress: () => takePhoto(memberId),
        },
        {
          text: "Kies uit galerij",
          onPress: () => pickFromGallery(memberId),
        },
        {
          text: "Annuleren",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const takePhoto = async (memberId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Toestemming vereist",
        "We hebben toegang tot je camera nodig om een foto te maken."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(memberId, result.assets[0].uri);
    }
  };

  const pickFromGallery = async (memberId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(memberId, result.assets[0].uri);
    }
  };

  const uploadImage = async (memberId: string, uri: string) => {
    setUploadingFor(memberId);

    try {
      console.log("[Family Style] Uploading image for member:", memberId);

      // Create FormData
      const formData = new FormData();
      
      // Get file extension
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      // Append file to FormData
      formData.append("avatar", {
        uri,
        name: `avatar-${memberId}.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // Upload to backend
      const response = await uploadAvatar(formData);
      console.log("[Family Style] Upload successful:", response);

      // Update local state
      setMemberStyles((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          avatar_url: response.avatar_url,
        },
      }));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("[Family Style] Upload error:", error);
      Alert.alert("Fout", "Kon foto niet uploaden");
    } finally {
      setUploadingFor(null);
    }
  };

  const isColorUsed = (color: string, currentMemberId: string): boolean => {
    return Object.entries(memberStyles).some(
      ([memberId, style]) =>
        memberId !== currentMemberId && style.color === color
    );
  };

  const allMembersHaveColors = (): boolean => {
    return members.every((member) => memberStyles[member.id]?.color);
  };

  const handleContinue = async () => {
    if (!allMembersHaveColors()) {
      Alert.alert("Let op", "Alle gezinsleden moeten een kleur hebben");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSaving(true);

    try {
      console.log("[Family Style] Saving member styles...");

      // Update each member's style
      for (const member of members) {
        const style = memberStyles[member.id];
        if (style) {
          console.log(`[Family Style] Updating member ${member.id}:`, style);
          await updateFamilyMemberStyle(member.id, {
            color: style.color,
            avatar_url: style.avatar_url,
          });
        }
      }

      // Mark family style setup as complete
      console.log("[Family Style] Marking setup as complete...");
      await completeFamilyStyleSetup();

      // Save completion status to AsyncStorage
      await AsyncStorage.setItem("familyStyleComplete", "true");

      console.log("[Family Style] Setup complete, redirecting to home...");
      
      // Redirect to home
      router.replace("/(tabs)/(home)");
    } catch (error) {
      console.error("[Family Style] Error saving styles:", error);
      Alert.alert("Fout", "Kon instellingen niet opslaan");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Gezinsleden laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Kies kleur & foto</Text>
          <Text style={styles.subtitle}>
            Maak je gezinsleden herkenbaar in de app
          </Text>
        </View>

        <View style={styles.membersContainer}>
          {members.map((member) => {
            const style = memberStyles[member.id];
            const isUploading = uploadingFor === member.id;

            return (
              <View key={member.id} style={styles.memberCard}>
                {/* Avatar */}
                <TouchableOpacity
                  style={[
                    styles.avatar,
                    { backgroundColor: style?.color || colors.primary },
                  ]}
                  onPress={() => handlePickImage(member.id)}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : style?.avatar_url ? (
                    <Image
                      source={{ uri: style.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarInitials}>
                      {getInitials(member.name)}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Member Info */}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>
                    {member.role === "parent"
                      ? "Ouder"
                      : member.role === "partner"
                      ? "Partner"
                      : "Kind"}
                  </Text>
                </View>

                {/* Color Picker */}
                <View style={styles.colorPicker}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.colorPickerContent}
                  >
                    {COLOR_PALETTE.map((color) => {
                      const isSelected = style?.color === color.hex;
                      const isUsed = isColorUsed(color.hex, member.id);

                      return (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: color.hex },
                            isSelected && styles.colorSwatchSelected,
                            isUsed && styles.colorSwatchDisabled,
                          ]}
                          onPress={() =>
                            !isUsed && handleColorSelect(member.id, color.hex)
                          }
                          disabled={isUsed}
                        >
                          {isSelected && (
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={20}
                              color="#fff"
                            />
                          )}
                          {isUsed && !isSelected && (
                            <View style={styles.colorSwatchDisabledOverlay} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            commonStyles.primaryButton,
            (!allMembersHaveColors() || saving) &&
              commonStyles.primaryButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!allMembersHaveColors() || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Doorgaan</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  membersContainer: {
    gap: 24,
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  memberInfo: {
    alignItems: "center",
  },
  memberName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  colorPicker: {
    marginTop: 8,
  },
  colorPickerContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#000",
  },
  colorSwatchDisabled: {
    opacity: 0.3,
  },
  colorSwatchDisabledOverlay: {
    position: "absolute",
    width: 2,
    height: 60,
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

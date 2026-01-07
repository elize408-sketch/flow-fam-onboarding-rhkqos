
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedGet } from "@/utils/api";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("[Profile] Fetching user profile from /api/users/me");
      // TODO: Backend Integration - Call the user profile API endpoint here
      const data = await authenticatedGet<UserProfile>("/api/users/me");
      console.log("[Profile] Profile data received:", data);
      setProfile(data);
    } catch (err: any) {
      console.error("[Profile] Error fetching profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    Alert.alert(
      "Uitloggen",
      "Weet je zeker dat je wilt uitloggen?",
      [
        {
          text: "Annuleren",
          style: "cancel",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        {
          text: "Uitloggen",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await signOut();
              router.replace("/(tabs)/(home)/");
            } catch (err: any) {
              console.error("[Profile] Sign out error:", err);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Profiel bewerken",
      "Deze functie komt binnenkort beschikbaar.",
      [{ text: "OK" }]
    );
  };

  const handleEmailPress = () => {
    if (profile?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${profile.email}`);
    }
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <IconSymbol ios_icon_name="person.circle" android_material_icon_name="person" size={80} color={theme.colors.primary} />
          <Text style={[styles.notAuthText, { color: theme.colors.text }]}>Please sign in to view your profile</Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/(home)/auth-options");
            }}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <IconSymbol ios_icon_name="exclamationmark.triangle" android_material_icon_name="warning" size={60} color="#EF4444" />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              fetchProfile();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          {profile?.image ? (
            <View style={styles.avatarContainer}>
              {/* TODO: Add image component when needed */}
              <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="person" size={80} color={theme.colors.primary} />
            </View>
          ) : (
            <IconSymbol ios_icon_name="person.circle.fill" android_material_icon_name="person" size={80} color={theme.colors.primary} />
          )}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {profile?.name || "User"}
          </Text>
          <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
            <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>
              {profile?.email}
            </Text>
          </TouchableOpacity>
          {profile?.emailVerified && (
            <View style={styles.verifiedBadge}>
              <IconSymbol ios_icon_name="checkmark.seal.fill" android_material_icon_name="verified" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <IconSymbol ios_icon_name="pencil" android_material_icon_name="edit" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </GlassView>

        <GlassView style={[
          styles.section,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <View style={styles.infoRow}>
            <IconSymbol ios_icon_name="calendar" android_material_icon_name="calendar-today" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Member since {new Date(profile?.createdAt || "").toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol ios_icon_name="clock" android_material_icon_name="schedule" size={20} color={theme.dark ? '#98989D' : '#666'} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              Last updated {new Date(profile?.updatedAt || "").toLocaleDateString()}
            </Text>
          </View>
        </GlassView>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("Settings", "Settings screen coming soon!", [{ text: "OK" }]);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.settingsButtonContent}>
            <IconSymbol ios_icon_name="gear" android_material_icon_name="settings" size={20} color={theme.colors.text} />
            <Text style={[styles.settingsButtonText, { color: theme.colors.text }]}>Settings</Text>
          </View>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="arrow-forward" size={20} color={theme.dark ? '#98989D' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#EF4444' }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  notAuthText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

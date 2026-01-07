import React, { useEffect, useState, useCallback } from "react";
import { Stack, useRouter } from "expo-router";
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useTheme } from "@react-navigation/native";
import { modalDemos } from "@/components/homeData";
import { DemoCard } from "@/components/DemoCard";
import { HeaderRightButton, HeaderLeftButton } from "@/components/HeaderButtons";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedGet } from "@/utils/api";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";

interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "partner" | "child";
  color?: string;
  avatar_url?: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchFamilyMembers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      console.log("[Home] Fetching family members from /api/families/members");
      const data = await authenticatedGet<{ members: FamilyMember[] }>("/api/families/members");
      console.log("[Home] Family members received:", data);
      setMembers(data.members || []);
    } catch (err: any) {
      console.error("[Home] Error fetching family members:", err);
      setError(err.message || "Failed to load family members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const handleMemberPress = (member: FamilyMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For now, show member details in an alert
    // In a full implementation, you would navigate to a member styling screen
    Alert.alert(
      member.name,
      `Role: ${member.role}\nColor: ${member.color || "Not set"}\nAvatar: ${member.avatar_url ? "Set" : "Not set"}`,
      [{ text: "OK" }]
    );
  };

  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={[styles.memberCard, { borderColor: item.color || theme.colors.border }]}
      onPress={() => handleMemberPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.memberAvatar, { backgroundColor: item.color || theme.colors.primary }]}>
        {item.avatar_url ? (
          <Text style={styles.memberAvatarText}>👤</Text>
        ) : (
          <IconSymbol
            ios_icon_name="person.fill"
            android_material_icon_name="person"
            size={32}
            color="#FFFFFF"
          />
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.memberRole, { color: theme.dark ? '#98989D' : '#666' }]}>
          {item.role === "parent" ? "Parent" : item.role === "partner" ? "Partner" : "Child"}
        </Text>
      </View>
      <IconSymbol
        ios_icon_name="chevron.right"
        android_material_icon_name="arrow-forward"
        size={20}
        color={theme.dark ? '#98989D' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Flow Fam",
          headerRight: () => <HeaderRightButton />,
          headerLeft: () => <HeaderLeftButton />,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading family...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={60}
              color="#EF4444"
            />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLoading(true);
                fetchFamilyMembers();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : members.length > 0 ? (
          <FlatList
            data={members}
            renderItem={renderFamilyMember}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Your Family</Text>
                <Text style={[styles.headerSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  {members.length} {members.length === 1 ? "member" : "members"}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Tap a member to customize their profile
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.centerContainer}>
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="group"
              size={80}
              color={theme.colors.primary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Family Members</Text>
            <Text style={[styles.emptySubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Set up your family to get started
            </Text>
            <TouchableOpacity
              style={[styles.setupButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(onboarding)/family-setup");
              }}
            >
              <Text style={styles.setupButtonText}>Set Up Family</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  setupButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatarText: {
    fontSize: 32,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

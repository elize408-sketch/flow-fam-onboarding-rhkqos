
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(tabs)/(home)/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={commonStyles.title}>Welkom bij Flow Fam</Text>
            <Text style={styles.subtitle}>
              Je bent succesvol ingelogd!
            </Text>
          </View>

          <View style={styles.userCard}>
            <View style={styles.userIconContainer}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account-circle"
                size={48}
                color={colors.primary}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userLabel}>Ingelogd als:</Text>
              <Text style={styles.userEmail}>{user?.email || "Onbekend"}</Text>
              <Text style={styles.userId}>ID: {user?.id?.substring(0, 8)}...</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={32}
              color={colors.secondary}
            />
            <Text style={styles.infoText}>
              Dit is een placeholder home scherm. Hier komt later de hoofdfunctionaliteit van de app.
            </Text>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Wat werkt nu:</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.accent}
                />
                <Text style={styles.featureText}>Email + wachtwoord registratie</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.accent}
                />
                <Text style={styles.featureText}>Inloggen met bestaand account</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.accent}
                />
                <Text style={styles.featureText}>Sessie persistentie</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.accent}
                />
                <Text style={styles.featureText}>Automatische routing</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="arrow.right.square.fill"
              android_material_icon_name="logout"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.logoutButtonText}>Uitloggen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === "android" ? 80 : 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 16,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.highlight,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
    elevation: 2,
  },
  userIconContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.secondary + "15",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: 16,
    flex: 1,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 12px rgba(239, 68, 68, 0.3)",
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
});

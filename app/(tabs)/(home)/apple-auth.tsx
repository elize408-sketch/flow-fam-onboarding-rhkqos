
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";

export default function AppleAuthScreen() {
  const router = useRouter();
  const { signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Show coming soon alert
    Alert.alert(
      "Binnenkort beschikbaar",
      "Apple authenticatie wordt binnenkort toegevoegd. Gebruik voorlopig email + wachtwoord om in te loggen.",
      [
        {
          text: "OK",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      ]
    );

    // Uncomment when backend is ready:
    // setLoading(true);
    // setError("");
    // try {
    //   // TODO: Backend Integration - Call Apple OAuth endpoint
    //   await signInWithApple();
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //   router.replace("/(tabs)/(home)/home");
    // } catch (err: any) {
    //   console.error("Apple sign in error:", err);
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //   setError(err.message || "Er is een fout opgetreden bij het inloggen met Apple");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            activeOpacity={0.7}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: '#00000015' }]}>
              <IconSymbol
                ios_icon_name="apple.logo"
                android_material_icon_name="phone"
                size={40}
                color="#000000"
              />
            </View>
            <Text style={commonStyles.title}>Doorgaan met Apple</Text>
            <Text style={styles.subtitle}>
              Klik op de knop hieronder om in te loggen met je Apple ID
            </Text>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={24}
                color="#EF4444"
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.appleButton, loading && styles.appleButtonDisabled]}
            onPress={handleAppleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="apple.logo"
                  android_material_icon_name="phone"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.appleButtonText}>Inloggen met Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.infoText}>
              Deze functie wordt binnenkort toegevoegd. Gebruik voorlopig email + wachtwoord.
            </Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 80 : 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 12,
    flex: 1,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  appleButtonDisabled: {
    opacity: 0.5,
  },
  appleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

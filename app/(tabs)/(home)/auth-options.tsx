
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function AuthOptionsScreen() {
  const router = useRouter();

  const authOptions = [
    {
      title: "Aanmelden met e-mail",
      icon: "email",
      iosIcon: "envelope.fill",
      route: "/(tabs)/(home)/email-signup",
      color: colors.primary,
    },
    {
      title: "Doorgaan met Google",
      icon: "account-circle",
      iosIcon: "person.circle.fill",
      route: "/(tabs)/(home)/google-auth",
      color: "#EA4335",
    },
    {
      title: "Doorgaan met Apple",
      icon: "phone",
      iosIcon: "apple.logo",
      route: "/(tabs)/(home)/apple-auth",
      color: "#000000",
    },
    {
      title: "Inloggen met bestaand account",
      icon: "person",
      iosIcon: "person.fill",
      route: "/(tabs)/(home)/login",
      color: colors.accent,
    },
    {
      title: "Inloggen met uitnodigingscode",
      icon: "mail",
      iosIcon: "ticket.fill",
      route: "/(tabs)/(home)/invite-code",
      color: colors.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Aan de slag</Text>
            <Text style={styles.subtitle}>Kies hoe je wilt beginnen</Text>
          </View>

          <View style={styles.optionsContainer}>
            {authOptions.map((option, index) => (
              <React.Fragment key={option.route}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => router.push(option.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                    <IconSymbol
                      ios_icon_name={option.iosIcon}
                      android_material_icon_name={option.icon}
                      size={24}
                      color={option.color}
                    />
                  </View>
                  <Text style={styles.optionText}>{option.title}</Text>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </React.Fragment>
            ))}
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
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
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
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.highlight,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

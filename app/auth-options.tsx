
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { useRouter } from "expo-router";
import React from "react";

export default function AuthOptionsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Aan de slag</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/(home)/email-signup")}>
            <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
            <Text style={styles.buttonText}>Aanmelden met e-mail</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/(home)/google-auth")}>
            <IconSymbol name="globe" size={24} color="#EA4335" />
            <Text style={styles.buttonText}>Doorgaan met Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/(home)/apple-auth")}>
            <IconSymbol name="apple.logo" size={24} color="#000000" />
            <Text style={styles.buttonText}>Doorgaan met Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/(home)/login")}>
            <IconSymbol name="person.fill" size={24} color={colors.primary} />
            <Text style={styles.buttonText}>Inloggen met bestaand account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <IconSymbol name="ticket.fill" size={24} color={colors.primary} />
            <Text style={styles.buttonText}>Inloggen met uitnodigingscode</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={20} color={colors.primary} />
        <Text style={styles.backButtonText}>Terug</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: 12,
    ...commonStyles.shadow,
  },
  buttonText: {
    fontSize: 17,
    color: colors.text,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 20,
    padding: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: "600",
  },
});

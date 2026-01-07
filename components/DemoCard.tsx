
import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { ModalDemo } from "./homeData";
import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";

interface DemoCardProps {
  item: ModalDemo;
}

export function DemoCard({ item }: DemoCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(item.route as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed
      ]}
    >
      <GlassView
        style={[
          styles.demoCard,
          { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <View style={[styles.demoIcon, { backgroundColor: item.color }]}>
          <IconSymbol ios_icon_name="square.grid.3x3" android_material_icon_name="apps" color={theme.dark ? '#111111' : '#FFFFFF'} size={24} />
        </View>
        <View style={styles.demoContent}>
          <Text style={[styles.demoTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.demoDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
            {item.description}
          </Text>
        </View>
        <View
          style={[
            styles.tryButton,
            { backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }
          ]}
        >
          <Text style={[styles.tryButtonText, { color: theme.colors.primary }]}>
            Try It
          </Text>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  demoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  tryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

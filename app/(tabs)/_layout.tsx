import React from "react";
import { Stack, usePathname } from "expo-router";
import FloatingTabBar, { TabBarItem } from "@/components/FloatingTabBar";

export default function TabLayout() {
  const pathname = usePathname() ?? "";

  const tabs: TabBarItem[] = [
    {
      name: "(home)",
      route: "/(tabs)/(home)", // ✅ FIX: geen /home
      icon: "home",
      label: "Home",
    },
    {
      name: "profile",
      route: "/(tabs)/profile",
      icon: "person",
      label: "Profile",
    },
  ];

  const isOnboardingOrAuth =
    pathname === "/(tabs)/(home)" ||
    pathname.startsWith("/(tabs)/(home)/auth") ||
    pathname.startsWith("/(tabs)/(home)/email") ||
    pathname.startsWith("/(tabs)/(home)/login") ||
    pathname.startsWith("/(tabs)/(home)/invite");

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>

      {!isOnboardingOrAuth && <FloatingTabBar tabs={tabs} />}
    </>
  );
}

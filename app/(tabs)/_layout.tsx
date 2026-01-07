import React from "react";
import { Stack, usePathname } from "expo-router";
import FloatingTabBar, { TabBarItem } from "@/components/FloatingTabBar";

export default function TabLayout() {
  const pathname = usePathname();

  // Tab routes (die echt tabs zijn)
  const tabs: TabBarItem[] = [
    { name: "(home)", route: "/(tabs)/(home)/home", icon: "home", label: "Home" },
    { name: "profile", route: "/(tabs)/profile", icon: "person", label: "Profile" },
  ];

  // Toon tabbar NIET op onboarding/auth screens
  const hideTabBar =
    pathname === "/(tabs)/(home)" ||
    pathname === "/(tabs)/(home)/" ||
    pathname.includes("/(tabs)/(home)/auth-options") ||
    pathname.includes("/(tabs)/(home)/email-signup") ||
    pathname.includes("/(tabs)/(home)/login") ||
    pathname.includes("/(tabs)/(home)/invite-code");

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>

      {!hideTabBar && <FloatingTabBar tabs={tabs} />}
    </>
  );
}

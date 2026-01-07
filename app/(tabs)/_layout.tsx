import React from "react";
import { Stack, usePathname } from "expo-router";
import FloatingTabBar, { TabBarItem } from "@/components/FloatingTabBar";

export default function TabLayout() {
  const pathnameRaw = usePathname();
  const pathname = typeof pathnameRaw === "string" ? pathnameRaw : "";

  const tabs: TabBarItem[] = [
    { name: "(home)", route: "/(tabs)/(home)/home", icon: "home", label: "Home" },
    { name: "profile", route: "/(tabs)/profile", icon: "person", label: "Profile" },
  ];

  const isOnboardingOrAuth =
    pathname === "/(tabs)/(home)" ||
    pathname === "/(tabs)/(home)/" ||
    pathname.startsWith("/(tabs)/(home)/auth-options") ||
    pathname.startsWith("/(tabs)/(home)/email-signup") ||
    pathname.startsWith("/(tabs)/(home)/login") ||
    pathname.startsWith("/(tabs)/(home)/invite-code");

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>

      {!isOnboardingOrAuth && <FloatingTabBar tabs={tabs} />}
    </>
  );
}

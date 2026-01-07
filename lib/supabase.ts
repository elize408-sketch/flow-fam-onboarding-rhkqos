// lib/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Supabase storage adapter (SecureStore) — voldoet aan interface die Supabase verwacht.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn("[Supabase] SecureStore getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn("[Supabase] SecureStore setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn("[Supabase] SecureStore removeItem error:", e);
    }
  },
};

/**
 * Haal config op uit:
 * 1) env: EXPO_PUBLIC_...
 * 2) app.json -> expo.extra
 *
 * (Let op: EAS build / prod gebruikt vaak env; lokaal kan app.json extra handig zijn)
 */
type ExpoExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra: ExpoExtra =
  (Constants.expoConfig?.extra as ExpoExtra | undefined) ??
  // oudere manifests (soms web)
  ((Constants as any).manifest?.extra as ExpoExtra | undefined) ??
  {};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey;

// Veilige debug (geen key loggen)
console.log("[Supabase] URL configured:", Boolean(supabaseUrl));
console.log("[Supabase] Anon key configured:", Boolean(supabaseAnonKey));

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Supabase] Missing config. Set EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY or expo.extra.supabaseUrl & expo.extra.supabaseAnonKey in app.json."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Mobile: SecureStore, Web: default (localStorage)
    storage: Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Web OAuth callback gebruikt URL; native niet
    detectSessionInUrl: Platform.OS === "web",
  },
  // Optioneel: als je realtime gebruikt later
  // realtime: { params: { eventsPerSecond: 5 } },
});

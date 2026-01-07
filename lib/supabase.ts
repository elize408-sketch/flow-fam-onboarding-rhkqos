import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ---- SecureStore adapter (Supabase verwacht deze interface) ----
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ---- Config ophalen uit app.json (extra) + fallback naar env ----
const extra =
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
  (Constants.manifest?.extra as Record<string, unknown> | undefined) ??
  {};

const supabaseUrl =
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
  (extra.supabaseUrl as string | undefined);

const supabaseAnonKey =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (extra.supabaseAnonKey as string | undefined);

// ---- Debug logs (veilig: key niet loggen) ----
console.log("[Supabase] URL configured:", !!supabaseUrl);
console.log("[Supabase] Anon key configured:", !!supabaseAnonKey);

if (!supabaseUrl) {
  throw new Error(
    "supabaseUrl is required. Zet 'extra.supabaseUrl' in app.json of EXPO_PUBLIC_SUPABASE_URL."
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    "supabaseAnonKey is required. Zet 'extra.supabaseAnonKey' in app.json of EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// ---- Client ----
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

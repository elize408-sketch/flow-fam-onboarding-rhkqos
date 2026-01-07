
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { authClient, storeWebBearerToken } from "@/lib/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  familySetupComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  checkFamilySetupStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function openOAuthPopup(provider: string): Promise<string> {
  // Only run on web platform
  if (Platform.OS !== "web") {
    return Promise.reject(new Error("OAuth popup is only available on web"));
  }

  return new Promise((resolve, reject) => {
    // Type guard to ensure we're on web
    if (typeof window === "undefined") {
      reject(new Error("Window object not available"));
      return;
    }

    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Failed to open popup. Please allow popups."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        reject(new Error(event.data.error || "OAuth failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const checkFamilySetupStatus = async (): Promise<boolean> => {
    try {
      // Check AsyncStorage first for offline support
      const localStatus = await AsyncStorage.getItem("familySetupComplete");
      if (localStatus === "true") {
        return true;
      }

      // Fetch family setup status from backend
      console.log("[Auth] Checking family setup status from backend...");
      const { authenticatedGet } = await import("@/utils/api");
      
      const profileData = await authenticatedGet<{
        id: string;
        email: string;
        name?: string;
        image?: string;
        emailVerified: boolean;
        familySetupComplete: boolean;
        createdAt: string;
        updatedAt: string;
      }>("/api/profile");
      
      console.log("[Auth] Profile data received:", profileData);
      
      // Cache the status locally
      if (profileData.familySetupComplete) {
        await AsyncStorage.setItem("familySetupComplete", "true");
      }
      
      return profileData.familySetupComplete || false;
    } catch (error) {
      console.error("[Auth] Failed to check family setup status:", error);
      // Return false on error to be safe
      return false;
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log("[Auth] Fetching user session...");
      const session = await authClient.getSession();
      console.log("[Auth] Session fetched:", session);
      
      if (session?.data?.user) {
        const userData = session.data.user as User;
        
        // Fetch complete profile with family setup status from backend
        try {
          console.log("[Auth] Fetching profile data from backend...");
          const { authenticatedGet } = await import("@/utils/api");
          
          const profileData = await authenticatedGet<{
            id: string;
            email: string;
            name?: string;
            image?: string;
            emailVerified: boolean;
            familySetupComplete: boolean;
            createdAt: string;
            updatedAt: string;
          }>("/api/profile");
          
          console.log("[Auth] Profile data received:", profileData);
          
          // Cache family setup status locally
          if (profileData.familySetupComplete) {
            await AsyncStorage.setItem("familySetupComplete", "true");
          } else {
            await AsyncStorage.removeItem("familySetupComplete");
          }
          
          setUser({
            ...userData,
            familySetupComplete: profileData.familySetupComplete,
          });
          console.log("[Auth] User set with profile data:", {
            ...userData,
            familySetupComplete: profileData.familySetupComplete,
          });
        } catch (profileError) {
          console.error("[Auth] Failed to fetch profile, using session data only:", profileError);
          
          // Fallback to checking AsyncStorage if backend call fails
          const localStatus = await AsyncStorage.getItem("familySetupComplete");
          setUser({
            ...userData,
            familySetupComplete: localStatus === "true",
          });
        }
      } else {
        setUser(null);
        console.log("[Auth] No user session found");
      }
    } catch (error) {
      console.error("[Auth] Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("[Auth] Auth loading complete");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      await authClient.signIn.email({ email, password });
      await fetchUser();
    } catch (error) {
      console.error("Email sign in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log("Signing up with email:", email);
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      await fetchUser();
    } catch (error) {
      console.error("Email sign up failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Signing in with Google...");
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("google");
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/(onboarding)/family-setup",
        });
        await fetchUser();
      }
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log("Signing in with Apple...");
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("apple");
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "apple",
          callbackURL: "/(onboarding)/family-setup",
        });
        await fetchUser();
      }
    } catch (error) {
      console.error("Apple sign in failed:", error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    try {
      console.log("Signing in with GitHub...");
      if (Platform.OS === "web") {
        const token = await openOAuthPopup("github");
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        await authClient.signIn.social({
          provider: "github",
          callbackURL: "/(onboarding)/family-setup",
        });
        await fetchUser();
      }
    } catch (error) {
      console.error("GitHub sign in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await authClient.signOut();
      
      // Clear family setup status on sign out
      await AsyncStorage.removeItem("familySetupComplete");
      
      setUser(null);
      console.log("User signed out");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  // Show a loading fallback while auth is initializing
  if (loading) {
    console.log("Auth provider is loading...");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
        checkFamilySetupStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

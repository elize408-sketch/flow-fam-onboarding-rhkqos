
import { authClient, storeWebBearerToken } from "@/lib/auth";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
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

function openOAuthPopup(provider: string) {
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  return window.open(
    "",
    `${provider}_oauth`,
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    fetchUser();
  }, []);

  const fetchUser = async () => {
    console.log('[AuthContext] Fetching user...');
    try {
      const session = await authClient.getSession();
      console.log('[AuthContext] Session:', !!session.data);

      if (session.data) {
        const userData: User = {
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name,
          image: session.data.user.image,
        };
        console.log('[AuthContext] User loaded:', userData.id);
        setUser(userData);
      } else {
        console.log('[AuthContext] No session found');
        setUser(null);
      }
    } catch (error) {
      console.error("[AuthContext] Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('[AuthContext] Loading complete');
    }
  };

  const checkFamilySetupStatus = async (): Promise<boolean> => {
    // This is now handled in app/index.tsx
    return false;
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('[AuthContext] Signing in with email...');
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('[AuthContext] Sign in successful');
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('[AuthContext] Signing up with email...');
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('[AuthContext] Sign up successful');
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('[AuthContext] Signing in with Google...');
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        const popup = openOAuthPopup("google");
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: window.location.origin + "/auth/callback",
        });
        if (popup && result.data?.url) {
          popup.location.href = result.data.url;
        }
      } else {
        await authClient.signIn.social({ provider: "google" });
      }
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Google sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    console.log('[AuthContext] Signing in with Apple...');
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        const popup = openOAuthPopup("apple");
        const result = await authClient.signIn.social({
          provider: "apple",
          callbackURL: window.location.origin + "/auth/callback",
        });
        if (popup && result.data?.url) {
          popup.location.href = result.data.url;
        }
      } else {
        await authClient.signIn.social({ provider: "apple" });
      }
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] Apple sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    console.log('[AuthContext] Signing in with GitHub...');
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        const popup = openOAuthPopup("github");
        const result = await authClient.signIn.social({
          provider: "github",
          callbackURL: window.location.origin + "/auth/callback",
        });
        if (popup && result.data?.url) {
          popup.location.href = result.data.url;
        }
      } else {
        await authClient.signIn.social({ provider: "github" });
      }
      await fetchUser();
    } catch (error) {
      console.error("[AuthContext] GitHub sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] Signing out...');
    setLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;

  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;

  // Handig voor debug/force refresh
  refreshSession: () => Promise<void>;
};

const SupabaseAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  return ctx;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mountedRef = useRef(true);

  const applySession = (next: Session | null) => {
    setSession(next);
    setUser(next?.user ?? null);
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.log("Supabase getSession error:", error.message);

      if (!mountedRef.current) return;
      applySession(data.session ?? null);
    } catch (e) {
      console.log("Supabase getSession exception:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // 1) Initial session load
    refreshSession();

    // 2) Auth state listener
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mountedRef.current) return;

      // Update state on any auth change
      applySession(nextSession);
      setLoading(false);

      // No routing here on purpose (prevents blank screen issues)
      console.log("Auth event:", _event, nextSession ? "session exists" : "no session");
    });

    return () => {
      mountedRef.current = false;
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ?? null };
    } catch (e) {
      return { error: e as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ?? null };
    } catch (e) {
      return { error: e as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ?? null };
    } catch (e) {
      return { error: e as AuthError };
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      signUp,
      signIn,
      signOut,
      refreshSession,
    }),
    [session, user, loading]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

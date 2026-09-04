import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const REFRESH_BUFFER_SECONDS = 60;

function sessionNeedsRefresh(session) {
  if (!session?.expires_at) {
    return false;
  }

  return session.expires_at <= Math.floor(Date.now() / 1000) + REFRESH_BUFFER_SECONDS;
}

function isSessionAuthError(error) {
  if (!error) {
    return false;
  }

  const message = String(error.message || "").toLowerCase();

  return (
    message.includes("jwt expired") ||
    message.includes("invalid jwt") ||
    message.includes("token has expired") ||
    message.includes("refresh token") ||
    error.status === 401
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const mountedRef = useRef(true);
  const hadSessionRef = useRef(false);
  const manualSignOutRef = useRef(false);
  const refreshInFlightRef = useRef(null);

  const clearAuthState = useCallback((expired = false) => {
    if (!mountedRef.current) {
      return;
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    setSessionExpired(expired);
    setLoading(false);
  }, []);

  const expireSession = useCallback(() => {
    clearAuthState(true);
    hadSessionRef.current = false;

    // Clear stale browser auth state without relying on an already-expired JWT.
    void supabase.auth.signOut({ scope: "local" });
  }, [clearAuthState]);

  const loadProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        if (isSessionAuthError(error)) {
          expireSession();
          return null;
        }

        console.error("Unable to load user profile:", error);
        setProfile(null);
        return null;
      }

      if (mountedRef.current) {
        setProfile(data);
      }

      return data;
    },
    [expireSession]
  );

  const applySession = useCallback(
    async (nextSession, { loadUserProfile = true } = {}) => {
      if (!mountedRef.current) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      hadSessionRef.current = Boolean(nextSession);

      if (nextSession) {
        setSessionExpired(false);
      }

      if (loadUserProfile && nextSession?.user?.id) {
        await loadProfile(nextSession.user.id);
      } else if (!nextSession) {
        setProfile(null);
      }

      if (mountedRef.current) {
        setLoading(false);
      }
    },
    [loadProfile]
  );

  const ensureValidSession = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const checkSession = async () => {
      const {
        data: { session: storedSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        expireSession();
        return null;
      }

      if (!storedSession) {
        clearAuthState(false);
        return null;
      }

      let validSession = storedSession;

      if (sessionNeedsRefresh(storedSession)) {
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          expireSession();
          return null;
        }

        validSession = refreshedSession;
      }

      await applySession(validSession);
      return validSession;
    };

    refreshInFlightRef.current = checkSession().finally(() => {
      refreshInFlightRef.current = null;
    });

    return refreshInFlightRef.current;
  }, [applySession, clearAuthState, expireSession]);

  useEffect(() => {
    mountedRef.current = true;

    void ensureValidSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mountedRef.current) {
        return;
      }

      if (event === "SIGNED_OUT") {
        const expired = hadSessionRef.current && !manualSignOutRef.current;
        manualSignOutRef.current = false;
        clearAuthState(expired);
        hadSessionRef.current = false;
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      hadSessionRef.current = Boolean(nextSession);

      if (nextSession) {
        setSessionExpired(false);
      }

      if (nextSession?.user?.id) {
        // Avoid awaiting additional Supabase calls inside the auth callback.
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    const revalidateOnResume = () => {
      if (document.visibilityState === "visible" && hadSessionRef.current) {
        void ensureValidSession();
      }
    };

    const revalidateOnFocus = () => {
      if (hadSessionRef.current) {
        void ensureValidSession();
      }
    };

    document.addEventListener("visibilitychange", revalidateOnResume);
    window.addEventListener("focus", revalidateOnFocus);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible" && hadSessionRef.current) {
        void ensureValidSession();
      }
    }, 60_000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", revalidateOnResume);
      window.removeEventListener("focus", revalidateOnFocus);
      window.clearInterval(intervalId);
    };
  }, [clearAuthState, ensureValidSession, loadProfile]);

  async function signIn(email, password) {
    manualSignOutRef.current = false;
    setSessionExpired(false);

    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async function signOut() {
    manualSignOutRef.current = true;
    setSessionExpired(false);
    return supabase.auth.signOut();
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      sessionExpired,
      signIn,
      signOut,
      ensureValidSession,
      refreshProfile: () => loadProfile(user?.id),
    }),
    [
      session,
      user,
      profile,
      loading,
      sessionExpired,
      ensureValidSession,
      loadProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}

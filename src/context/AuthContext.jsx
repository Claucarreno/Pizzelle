import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const healthResponse = await fetch("/api/health", { credentials: "same-origin" });
      const health = await healthResponse.json().catch(() => ({}));
      setConfigured(health.configured === true);
      if (health.configured !== true) { setUser(null); setProfile(null); return; }

      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (response.status === 401) { setUser(null); setProfile(null); return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo cargar la cuenta.");
      setUser(data.user || null);
      setProfile(data.profile || null);
    } catch {
      setConfigured(false); setUser(null); setProfile(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshUser(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); }
    finally { setUser(null); setProfile(null); }
  }, []);

  return <AuthContext.Provider value={{ user, profile, configured, loading, refreshUser, signOut }}>{children}</AuthContext.Provider>;
}

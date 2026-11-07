import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const loadProfile = async (user) => {
      if (!user) { if (alive) setProfile(null); return; }
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
      if (alive) setProfile({ id: user.id, email: user.email, fullName: data?.full_name || user.user_metadata?.full_name || "", role: data?.role || "customer" });
    };
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await loadProfile(data.session?.user);
      if (alive) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(true);
      Promise.resolve().then(() => loadProfile(nextSession?.user)).finally(() => { if (alive) setLoading(false); });
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = {
    session, user: session?.user ?? null, profile, loading,
    configured: isSupabaseConfigured,
    signOut: async () => supabase?.auth.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const UserContext = createContext(null);

// Holds the auth user + their `profiles` row, kept in sync via
// onAuthStateChange. middleware.js already guards routes server-side;
// this context is for client components that need to *display* user data
// (avatar, name, etc.) without re-fetching everywhere.
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async (authUser) => {
      if (!authUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, about, avatar_url, is_online, last_seen"
        )
        .eq("id", authUser.id)
        .maybeSingle();
      setProfile(data ?? null);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadProfile(user).finally(() => setLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};

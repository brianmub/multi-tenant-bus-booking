import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state changes
  useEffect(() => {
    // 1. Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profiles matching auth ID
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it from auth metadata
        if (error.code === "PGRST116") {
          const { data: currentUser } = await supabase.auth.getUser();
          const email = currentUser?.user?.email;
          const name = currentUser?.user?.user_metadata?.name || email?.split("@")[0] || "User";
          
          const newProfile = {
            id: userId,
            name,
            email,
            preferred_currency: "USD",
            saved_passengers: [],
          };
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile);
            
          if (!insertError) {
            setProfile(newProfile);
          }
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw error;

    // Immediately insert profile record
    if (data?.user) {
      const newProfile = {
        id: data.user.id,
        name,
        email,
        preferred_currency: "USD",
        saved_passengers: [],
      };
      await supabase.from("profiles").insert(newProfile);
      setProfile(newProfile);
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

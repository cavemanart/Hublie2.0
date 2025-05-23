import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  const upsertProfile = async (user) => {
    const updates = {
      id: user.id,
      email: user.email,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) console.error('Error upserting profile:', error);
  };

  const refreshUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('RefreshUser - Session:', session);

    if (error) {
      console.error('Error refreshing session:', error);
      return;
    }

    if (session?.user) {
      await upsertProfile(session.user);
      const profile = await fetchProfile(session.user.id);
      console.log('Fetched profile:', profile);

      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: profile?.display_name || session.user.email,
        avatarUrl: profile?.avatar_url || '',
        role: profile?.role || 'Roommate',
        households: Array.isArray(profile?.households_ids) ? profile.households_ids : [],
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  };

  const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase Login Error:', error);
      throw error;
    }

    await refreshUser(); // Ensure session and user state are loaded immediately
    return true;
  };

  const registerUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Supabase Signup Error:', error);
      throw error;
    }

    return true;
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    refreshUser(); // Check session on load

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      refreshUser(); // Always refresh user when auth state changes
    });

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

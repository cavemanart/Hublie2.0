import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upsert or create profile record in your "profiles" table
  const upsertProfile = async (supabaseUser) => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: supabaseUser.id,
        display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email,
        email: supabaseUser.email,
        avatar_url: supabaseUser.user_metadata?.avatar_url || '',
        role: supabaseUser.user_metadata?.role || 'Roommate',
        households_ids: [],
      });
      if (error) {
        console.error('[Auth] Upsert profile error:', error);
      }
    } catch (e) {
      console.error('[Auth] Upsert profile exception:', e);
    }
  };

  // Fetch profile from "profiles" table
  const fetchProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, role, households_ids')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[Auth] Error fetching profile:', error);
      }

      return profile;
    } catch (e) {
      console.error('[Auth] Fetch profile exception:', e);
      return null;
    }
  };

  // Refresh user session and profile info
  const refreshUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[Auth] Error refreshing session:', error);
        setUser(null);
        return;
      }

      if (session?.user) {
        await upsertProfile(session.user);
        const profile = await fetchProfile(session.user.id);

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
    } catch (e) {
      console.error('[Auth] refreshUser exception:', e);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authListener;

    // Poll session for initial auth state with retry
    const pollSession = async (attempts = 5) => {
      for (let i = 0; i < attempts; i++) {
        if (!mounted) return;

        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('[Auth] Poll session error:', error);
            break;
          }

          if (session?.user) {
            console.log('[Auth] Poll session user found:', session.user.email);
            await upsertProfile(session.user);
            const profile = await fetchProfile(session.user.id);
            if (!mounted) return;
            setUser({
              id: session.user.id,
              email: session.user.email,
              displayName: profile?.display_name || session.user.email,
              avatarUrl: profile?.avatar_url || '',
              role: profile?.role || 'Roommate',
              households: Array.isArray(profile?.households_ids) ? profile.households_ids : [],
            });
            break;
          }

          console.log(`[Auth] Poll attempt ${i + 1}, no session yet`);
          if (i === attempts - 1) {
            console.warn('[Auth] No session found after polling attempts');
          }

          // Wait 1 second before next attempt
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.error('[Auth] Poll session exception:', e);
          break;
        }
      }
      if (mounted) setLoading(false);
    };

    // Initialize auth state and listen for changes
    const initAuth = async () => {
      setLoading(true);
      await pollSession();

      authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;

        console.log('[Auth] onAuthStateChange:', _event, session?.user?.email);

        if (session?.user) {
          await upsertProfile(session.user);
          const profile = await fetchProfile(session.user.id);

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
      });
    };

    initAuth();

    // Safety fallback timeout to avoid stuck loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 7000);

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  // Register user with metadata
  const registerUser = async (email, password, displayName, role = 'Roommate') => {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          avatar_url: '',
        },
      },
    });

    if (signUpError) {
      console.error('[Auth] Supabase SignUp Error:', signUpError);
      throw signUpError;
    }

    return true;
  };

  // Login user
  const loginUser = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[Auth] Supabase Login Error:', error);
      throw error;
    }

    return true;
  };

  // Logout user
  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] Supabase Logout Error:', error);
      throw error;
    }
  };

  // Update user and profile metadata
  const updateUser = async (updatedData) => {
    if (!user) throw new Error('User not authenticated');

    const { displayName, avatarUrl, role, households } = updatedData;

    // Update auth user metadata
    const authUserUpdatePayload = {};
    if (displayName !== undefined) authUserUpdatePayload.display_name = displayName;
    if (avatarUrl !== undefined) authUserUpdatePayload.avatar_url = avatarUrl;
    if (role !== undefined) authUserUpdatePayload.role = role;

    if (Object.keys(authUserUpdatePayload).length > 0) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: authUserUpdatePayload,
      });
      if (authUpdateError) {
        console.error('[Auth] Error updating user auth metadata:', authUpdateError);
        throw authUpdateError;
      }
    }

    // Update profiles table
    const profileUpdatePayload = {};
    if (displayName !== undefined) profileUpdatePayload.display_name = displayName;
    if (avatarUrl !== undefined) profileUpdatePayload.avatar_url = avatarUrl;
    if (role !== undefined) profileUpdatePayload.role = role;
    if (households !== undefined) profileUpdatePayload.households_ids = households;

    if (Object.keys(profileUpdatePayload).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdatePayload)
        .eq('id', user.id);

      if (profileError) {
        console.error('[Auth] Error updating profile:', profileError);
        throw profileError;
      }
    }

    // Update local user state
    const refreshedUser = {
      ...user,
      ...(displayName !== undefined && { displayName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(role !== undefined && { role }),
      ...(households !== undefined && { households }),
    };

    setUser(refreshedUser);
    return refreshedUser;
  };

  const value = {
    user,
    loading,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

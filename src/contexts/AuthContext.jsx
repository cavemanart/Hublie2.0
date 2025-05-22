import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const upsertProfile = async (supabaseUser) => {
    const { error } = await supabase.from('profiles').upsert({
      id: supabaseUser.id,
      display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email,
      email: supabaseUser.email,
      avatar_url: supabaseUser.user_metadata?.avatar_url || '',
      role: supabaseUser.user_metadata?.role || 'Roommate',
      households_ids: [],
    });

    if (error) console.error('Upsert profile error:', error);
  };

  const fetchProfile = async (userId) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role, households_ids')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    return profile;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await upsertProfile(session.user);
        const profile = await fetchProfile(session.user.id);

        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: profile?.display_name || session.user.email,
          avatarUrl: profile?.avatar_url || '',
          role: profile?.role || 'Roommate',
          households: profile?.households_ids || [],
        });
      }

      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await upsertProfile(session.user);
          const profile = await fetchProfile(session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: profile?.display_name || session.user.email,
            avatarUrl: profile?.avatar_url || '',
            role: profile?.role || 'Roommate',
            households: profile?.households_ids || [],
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const registerUser = async (email, password, displayName, role = 'Roommate') => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role,
          avatar_url: ''
        },
      },
    });

    if (signUpError) {
      console.error('Supabase SignUp Error:', signUpError);
      throw signUpError;
    }

    return true; // Auth listener will handle upsert + user state
  };

  const loginUser = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase Login Error:', error);
      throw error;
    }

    return true;
  };

  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase Logout Error:', error);
      throw error;
    }
  };

  const updateUser = async (updatedData) => {
    if (!user) throw new Error("User not authenticated");

    const { displayName, avatarUrl, role, households } = updatedData;

    const authUserUpdatePayload = {};
    if (displayName !== undefined) authUserUpdatePayload.display_name = displayName;
    if (avatarUrl !== undefined) authUserUpdatePayload.avatar_url = avatarUrl;
    if (role !== undefined) authUserUpdatePayload.role = role;

    if (Object.keys(authUserUpdatePayload).length > 0) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: authUserUpdatePayload,
      });
      if (authUpdateError) {
        console.error("Error updating user auth metadata:", authUpdateError);
        throw authUpdateError;
      }
    }

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
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
    }

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

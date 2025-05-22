import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, role, households_ids')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
        
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
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, role, households_ids')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile on auth change:', profileError);
          }
          
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
        if (loading) {
            setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loading]);

  const registerUser = async (email, password, displayName, role = 'Roommate') => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // This data is for auth.users table's raw_user_meta_data
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
    
    if (authData.user) {
      // This insert operation will be checked by the RLS policy.
      // The `id` field MUST match `authData.user.id` (which is auth.uid() in the policy context).
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id, // This is crucial for the RLS policy
          display_name: displayName,
          email: authData.user.email, // Storing email in profiles table too
          role: role,
          avatar_url: '',
          households_ids: [],
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // If RLS fails, this error will indicate it.
        throw profileError;
      }
      // The onAuthStateChange listener will update the user state with profile data.
      // For immediate UI update, we can return the basic user info.
      return {
        id: authData.user.id,
        email: authData.user.email,
        displayName: displayName,
        role: role,
        avatarUrl: '',
        households: []
      };
    }
    return null;
  };

  const loginUser = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      throw error;
    }
    // onAuthStateChange will handle setting the user state
    return true;
  };

  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase Logout Error:', error);
      throw error;
    }
    // onAuthStateChange will handle setting user to null
  };

  const updateUser = async (updatedData) => {
    if (!user) throw new Error("User not authenticated");

    const { displayName, avatarUrl, role, households } = updatedData;
    
    // Prepare data for Supabase user metadata update (auth.users table)
    const authUserUpdatePayload = {};
    if (displayName !== undefined) authUserUpdatePayload.display_name = displayName;
    if (avatarUrl !== undefined) authUserUpdatePayload.avatar_url = avatarUrl;
    if (role !== undefined) authUserUpdatePayload.role = role; // Store role in metadata too for consistency

    if (Object.keys(authUserUpdatePayload).length > 0) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
            data: authUserUpdatePayload 
        });
        if (authUpdateError) {
            console.error("Error updating user auth metadata:", authUpdateError);
            throw authUpdateError;
        }
    }
    
    // Prepare data for profiles table update
    const profileUpdatePayload = {};
    if (displayName !== undefined) profileUpdatePayload.display_name = displayName;
    if (avatarUrl !== undefined) profileUpdatePayload.avatar_url = avatarUrl;
    if (role !== undefined) profileUpdatePayload.role = role;
    if (households !== undefined) profileUpdatePayload.households_ids = households;


    if (Object.keys(profileUpdatePayload).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdatePayload)
        .eq('id', user.id); // RLS policy "Users can update their own profile." will check this

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
    }
    
    // Optimistically update local user state
    // Or refetch user from onAuthStateChange after auth.updateUser
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabaseClient';

const HouseholdContext = createContext(null);

const defaultPermissions = {
  'Parent/Adult': {
    manage: ['notes', 'bills', 'chores', 'appreciation', 'weeklySync', 'goals', 'mentalLoad', 'users', 'settings'],
    view: ['notes', 'bills', 'chores', 'appreciation', 'weeklySync', 'goals', 'mentalLoad', 'routines'],
  },
  'Nanny': {
    view: ['routines', 'child_notes'],
    send_notes_to: ['Parent/Adult', 'Grandparent'],
  },
  'Child': {
    view: ['assigned_chores', 'assigned_notes'],
    send_notes_to: [],
  },
  'Grandparent': {
    view: ['shared_notes', 'routines'],
    send_notes_to: ['Parent/Adult', 'Child'],
  },
  'Roommate': {
    manage: ['shared_notes', 'chores', 'bills', 'appreciation', 'goals'],
    view: ['shared_notes', 'chores', 'bills', 'appreciation', 'goals'],
  }
};

export const HouseholdProvider = ({ children }) => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [household, setHousehold] = useState(null);
  const [currentMemberPermissions, setCurrentMemberPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHouseholdData = async () => {
      setLoading(true);
      if (user && user.households && user.households.length > 0) {
        const currentHouseholdId = user.households[0];

        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select(`
            *,
            members: household_members (
              user_id,
              role,
              profiles (display_name, avatar_url)
            )
          `)
          .eq('id', currentHouseholdId)
          .single();

        if (householdError) {
          console.error('Error fetching household data:', householdError);
          setHousehold(null);
          setCurrentMemberPermissions(null);
        } else if (householdData) {
          setHousehold(householdData);
          const member = householdData.members.find(m => m.user_id === user.id);
          if (member && member.role) {
            setCurrentMemberPermissions(defaultPermissions[member.role] || {});
          } else {
            setCurrentMemberPermissions(null);
          }
        } else {
          setHousehold(null);
          setCurrentMemberPermissions(null);
        }
      } else {
        setHousehold(null);
        setCurrentMemberPermissions(null);
      }
      setLoading(false);
    };

    if (user) {
        loadHouseholdData();
    } else {
        setHousehold(null);
        setCurrentMemberPermissions(null);
        setLoading(false);
    }
  }, [user]);

  const createHousehold = async (name, adminUserId) => {
    const inviteCode = uuidv4().substring(0, 8).toUpperCase();
    
    const { data: newHouseholdData, error: createError } = await supabase
      .from('households')
      .insert([{ name, invite_code: inviteCode }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating household:', createError);
      throw createError;
    }

    if (!newHouseholdData) {
        throw new Error("Failed to create household, no data returned.");
    }

    const { error: memberError } = await supabase
      .from('household_members')
      .insert([{ household_id: newHouseholdData.id, user_id: adminUserId, role: 'Parent/Adult' }]);

    if (memberError) {
      console.error('Error adding admin to household:', memberError);
      throw memberError;
    }

    if (user && user.id === adminUserId) {
      const updatedUserHouseholds = [...(user.households || []), newHouseholdData.id];
      await updateAuthUser({ households: updatedUserHouseholds });
    }
    
    const { data: fetchedHousehold, error: fetchError } = await supabase
        .from('households')
        .select(`*, members: household_members (user_id, role, profiles (display_name, avatar_url))`)
        .eq('id', newHouseholdData.id)
        .single();
    
    if (fetchError || !fetchedHousehold) {
        console.error('Error refetching new household:', fetchError);
        setHousehold(newHouseholdData);
    } else {
        setHousehold(fetchedHousehold);
    }
    setCurrentMemberPermissions(defaultPermissions['Parent/Adult'] || {});
    return fetchedHousehold || newHouseholdData;
  };

  const joinHousehold = async (inviteCode, userId, role = 'Roommate') => {
    const { data: targetHouseholdData, error: findError } = await supabase
      .from('households')
      .select('id, members: household_members(user_id)')
      .eq('invite_code', inviteCode)
      .single();

    if (findError || !targetHouseholdData) {
      console.error('Error finding household or invalid invite code:', findError);
      return null;
    }

    const isAlreadyMember = targetHouseholdData.members.some(m => m.user_id === userId);
    if (isAlreadyMember) {
         const { data: fullHousehold, error: fetchFullError } = await supabase
            .from('households')
            .select(`*, members: household_members (user_id, role, profiles (display_name, avatar_url))`)
            .eq('id', targetHouseholdData.id)
            .single();
        if(fetchFullError || !fullHousehold) {
            console.error("Error fetching full household details for existing member:", fetchFullError);
            return null;
        }
        setHousehold(fullHousehold);
        const member = fullHousehold.members.find(m => m.user_id === userId);
        setCurrentMemberPermissions(defaultPermissions[member?.role || role] || {});
        return fullHousehold;
    }

    const { error: memberError } = await supabase
      .from('household_members')
      .insert([{ household_id: targetHouseholdData.id, user_id: userId, role }]);

    if (memberError) {
      console.error('Error adding user to household:', memberError);
      throw memberError;
    }

    if (user && user.id === userId) {
      const updatedUserHouseholds = [...(user.households || []), targetHouseholdData.id];
      await updateAuthUser({ households: updatedUserHouseholds });
    }
    
    const { data: fetchedHousehold, error: fetchError } = await supabase
        .from('households')
        .select(`*, members: household_members (user_id, role, profiles (display_name, avatar_url))`)
        .eq('id', targetHouseholdData.id)
        .single();
    
    if (fetchError || !fetchedHousehold) {
        console.error('Error refetching household after join:', fetchError);
        return null;
    }

    setHousehold(fetchedHousehold);
    setCurrentMemberPermissions(defaultPermissions[role] || {});
    return fetchedHousehold;
  };
  
  const value = {
    household,
    currentMemberPermissions,
    loading,
    createHousehold,
    joinHousehold,
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};
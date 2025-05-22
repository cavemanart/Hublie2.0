import { supabase } from './supabaseClient';

export async function signUpWithEmail(email, password, fullName) {
  // 1. Sign up user with email and password
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw signUpError;
  }

  const user = signUpData.user;

  // 2. Insert user profile into 'profiles' table
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: user.id,
      full_name: fullName,
      created_at: new Date(),
    },
  ]);

  if (profileError) {
    throw profileError;
  }

  return user;
}

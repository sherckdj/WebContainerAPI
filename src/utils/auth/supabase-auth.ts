import { supabase } from '../../lib/supabase';
import { AuthResult } from './types';

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { 
      user: null, 
      error: new Error(error.message)
    };
  }

  if (!data.user) {
    return {
      user: null,
      error: new Error('Authentication failed')
    };
  }

  return { user: data.user };
}
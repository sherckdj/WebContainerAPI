import { AuthError, Role } from '../types/auth';
import { supabase } from '../lib/supabase';

export async function signIn(email: string, password: string) {
  try {
    // First authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    // Then get their role from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User role not found');
    }

    // Update session with role
    await supabase.auth.updateUser({
      data: { role: userData.role }
    });

    return {
      user: {
        ...authData.user,
        user_metadata: {
          ...authData.user.user_metadata,
          role: userData.role as Role
        }
      }
    };
  } catch (error) {
    throw error;
  }
}

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    switch (error.message) {
      case 'User role not found':
        return { message: 'Account setup incomplete. Please contact support.' };
      case 'Invalid login credentials':
        return { message: 'Invalid email or password' };
      case 'Authentication failed':
        return { message: 'Login failed. Please try again.' };
      default:
        return { message: error.message };
    }
  }
  return { message: 'An unexpected error occurred' };
}
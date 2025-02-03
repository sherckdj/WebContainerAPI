import { supabase } from '../../lib/supabase';
import { AuthError } from '../../types/auth';
import { AuthenticatedUser } from './types';

export async function signIn(email: string, password: string): Promise<{ user: AuthenticatedUser }> {
  try {
    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Authentication failed');

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData?.role) {
      // If role fetch fails, sign out and throw error
      await supabase.auth.signOut();
      throw new Error('User role not found');
    }

    // Update user metadata with role
    const { error: updateError } = await supabase.auth.updateUser({
      data: { role: userData.role }
    });

    if (updateError) {
      await supabase.auth.signOut();
      throw new Error('Failed to update user role');
    }

    return {
      user: {
        ...authData.user,
        user_metadata: {
          ...authData.user.user_metadata,
          role: userData.role
        }
      } as AuthenticatedUser
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Authentication failed');
  }
}

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Invalid login credentials':
        return { message: 'Invalid email or password' };
      case 'User role not found':
        return { message: 'Account setup incomplete. Please contact support.' };
      case 'Failed to update user role':
        return { message: 'Failed to set user role. Please try again.' };
      case 'Authentication failed':
        return { message: 'Login failed. Please try again.' };
      default:
        return { message: error.message };
    }
  }
  return { message: 'An unexpected error occurred' };
}
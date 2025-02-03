import { supabase } from '../../lib/supabase';
import { Role } from '../../types/auth';

export async function getUserRole(userId: string): Promise<Role> {
  // First try to get from auth metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role) {
    return user.user_metadata.role as Role;
  }

  // Fallback to users table
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data?.role) {
    throw new Error('User role not found');
  }

  return data.role as Role;
}

export async function updateUserMetadata(userId: string, role: Role): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: { role }
  });

  if (error) {
    console.error('Failed to update user metadata:', error);
  }
}
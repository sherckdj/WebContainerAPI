import { supabase } from '../lib/supabase';

export async function checkAdminStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error) return false;
  return data?.role === 'admin';
}
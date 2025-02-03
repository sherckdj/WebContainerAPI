import { User as SupabaseUser } from '@supabase/supabase-js';
import { Role } from '../../types/auth';

export interface AuthenticatedUser extends SupabaseUser {
  user_metadata: {
    role: Role;
    [key: string]: unknown;
  };
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error?: Error;
}
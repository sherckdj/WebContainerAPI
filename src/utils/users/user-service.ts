import { supabase } from '../../lib/supabase';
import { User, CreateUserData } from '../../types/user';

export async function createUserRecord(userData: CreateUserData): Promise<User> {
  try {
    // Check if user already exists in auth
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userData.email);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw new Error('Failed to check if user exists');
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: userData.role,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          student_number: userData.student_number || null
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // Wait for auth user to be fully created and trigger to run
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify user record was created
    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !createdUser) {
      // Clean up auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError?.message || 'Failed to create user profile');
    }

    return createdUser;
  } catch (error) {
    if (error instanceof Error) {
      console.error('User creation failed:', error.message);
      throw error;
    }
    throw new Error('Failed to create user');
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
}
/*
  # User Authentication and Profile Setup
  
  1. Changes
    - Create users table if not exists
    - Set up user profiles view
    - Add user creation trigger
    - Configure security policies
  
  2. Security
    - Enable RLS
    - Add granular access policies
*/

-- Create users table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create user profiles view
CREATE OR REPLACE VIEW user_profiles AS 
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  updated_at
FROM auth.users;

-- Create function for user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
EXCEPTION WHEN others THEN
  RAISE LOG 'Error creating trigger: %', SQLERRM;
END $$;

-- Add policies for user access
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read_own" ON users;
  CREATE POLICY "users_read_own"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  DROP POLICY IF EXISTS "admin_full_access" ON users;
  CREATE POLICY "admin_full_access"
    ON users
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN others THEN
  RAISE LOG 'Error creating policies: %', SQLERRM;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
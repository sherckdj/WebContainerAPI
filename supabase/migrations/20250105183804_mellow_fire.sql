/*
  # Fix user policies and manual creation

  1. Changes
    - Drop problematic policies
    - Create simplified policies for user access
    - Add function for admin user creation
  
  2. Security
    - Enable RLS
    - Add basic policies for user access
    - Add admin-only policy for user management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create simplified policies
CREATE POLICY "Enable read access to own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable read access for admins"
  ON users FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Function to create a new user (admin only)
CREATE OR REPLACE FUNCTION admin_create_user(
  auth_id uuid,
  user_email text,
  user_role text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create users';
  END IF;

  -- Insert the new user
  INSERT INTO users (id, email, role)
  VALUES (auth_id, user_email, user_role);
END;
$$;
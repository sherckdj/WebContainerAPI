/*
  # Fix User Access Policies

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies
    - Update user_profiles view
    - Add proper indexes

  2. Security
    - Use JWT claims for role checks
    - Proper access control for profiles
    - No recursive policy dependencies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_own_profile" ON users;
DROP POLICY IF EXISTS "allow_admin_write" ON users;

-- Create new non-recursive policies
CREATE POLICY "users_select_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read user data

CREATE POLICY "users_update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR  -- Users can update their own profile
    auth.jwt() ->> 'role' = 'admin'  -- Admins can update any profile
  )
  WITH CHECK (
    id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "admin_insert_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'  -- Only admins can create users
  );

CREATE POLICY "admin_delete_policy"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'  -- Only admins can delete users
  );

-- Drop and recreate view without any filtering
DROP VIEW IF EXISTS user_profiles;
CREATE VIEW user_profiles AS 
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  student_number,
  created_at,
  updated_at
FROM users;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_number ON users(student_number);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
/*
  # Fix User Profiles View Security

  1. Changes
    - Remove SECURITY DEFINER from user_profiles view
    - Implement proper RLS policies
    - Ensure proper data access control

  2. Security
    - Use RLS instead of SECURITY DEFINER
    - Maintain data privacy through policies
*/

-- Drop existing view
DROP VIEW IF EXISTS user_profiles;

-- Create view without SECURITY DEFINER
CREATE VIEW user_profiles AS 
SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  u.student_number,
  u.created_at,
  u.updated_at
FROM users u;

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;

-- Create new policies for proper access control
CREATE POLICY "users_read_own_and_admin"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "admin_write_policy"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
/*
  # Fix Recursive Policy Issue

  1. Changes
    - Remove recursive policies
    - Implement simplified access control
    - Use JWT claims for role checks

  2. Security
    - Maintain data privacy
    - Prevent infinite recursion
    - Use proper authorization checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own_and_admin" ON users;
DROP POLICY IF EXISTS "admin_write_policy" ON users;

-- Create simplified non-recursive policies
CREATE POLICY "allow_read_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "allow_admin_write"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Update view to use proper access control
DROP VIEW IF EXISTS user_profiles;
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
FROM users u
WHERE 
  auth.uid() = u.id OR
  auth.jwt() ->> 'role' = 'admin';
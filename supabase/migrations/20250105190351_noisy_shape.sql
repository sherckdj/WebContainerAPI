/*
  # Fix user visibility and policies

  1. Changes
    - Simplify RLS policies
    - Fix admin access
    - Ensure proper user visibility

  2. Security
    - Maintain data isolation
    - Allow admins full access
    - Allow users to see their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin read access" ON users;
DROP POLICY IF EXISTS "Admin write access" ON users;

-- Create simplified policies
CREATE POLICY "Admin full access"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users view own data"
  ON users
  FOR SELECT
  USING (id = auth.uid());
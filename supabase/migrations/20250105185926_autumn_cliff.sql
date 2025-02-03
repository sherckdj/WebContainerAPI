/*
  # Fix admin policies and user management

  1. Changes
    - Update admin policy to work with metadata
    - Add upsert policy for admin users
    - Simplify self-access policy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin access" ON users;
DROP POLICY IF EXISTS "Self access" ON users;

-- Create new policies
CREATE POLICY "Admin read access"
  ON users
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role' = 'admin') OR
    (auth.uid() = id)
  );

CREATE POLICY "Admin write access"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
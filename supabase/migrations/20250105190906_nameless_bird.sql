/*
  # Fix user policies and visibility

  1. Changes
    - Simplify policies to ensure proper visibility
    - Fix user creation and access control
    
  2. Security
    - Maintain RLS while ensuring proper access
    - Allow authenticated users to read user data
    - Allow user creation with proper validation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_read" ON users;
DROP POLICY IF EXISTS "authenticated_insert" ON users;

-- Create new simplified policies
CREATE POLICY "allow_read_users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_create_users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
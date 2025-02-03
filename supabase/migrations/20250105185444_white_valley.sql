/*
  # Fix Admin Policies and User Management

  1. Changes
    - Drop existing policies
    - Add new admin policies for full access
    - Add new user policies for self-access
  
  2. Security
    - Admins can perform all operations
    - Users can only read their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access to own user data" ON users;
DROP POLICY IF EXISTS "Enable read access for admins" ON users;

-- Create new policies
CREATE POLICY "Admins have full access"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
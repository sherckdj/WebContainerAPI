/*
  # Fix user management and policies

  1. Changes
    - Simplify policies for better visibility
    - Add proper indexes
    - Ensure proper user creation flow
    
  2. Security
    - Maintain RLS while ensuring proper access
    - Allow authenticated users to read and create users
*/

-- Create new simplified policies
CREATE POLICY "allow_read"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
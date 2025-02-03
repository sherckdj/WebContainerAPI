/*
  # Fix RLS policies to prevent recursion

  1. Changes
    - Replace recursive admin check with metadata check
    - Simplify policies for better performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policies using auth.jwt() for role check
CREATE POLICY "Admins have full access"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
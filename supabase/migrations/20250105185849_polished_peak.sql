/*
  # Fix recursive RLS policy

  1. Changes
    - Remove recursive policy check
    - Simplify admin access policy
    - Update user data access policy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new non-recursive policies
CREATE POLICY "Admin access"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Self access"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
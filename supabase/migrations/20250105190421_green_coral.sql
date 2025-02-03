/*
  # Fix policy recursion and improve access control

  1. Changes
    - Remove recursive policy checks
    - Implement role-based access using metadata
    - Simplify policy structure

  2. Security
    - Maintain strict access control
    - Use JWT claims for role verification
    - Enable self-access for users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Users view own data" ON users;

-- Create new non-recursive policies
CREATE POLICY "admin_all_access"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "user_self_access"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
-- Drop existing policies
DROP POLICY IF EXISTS "admin_all_access" ON users;
DROP POLICY IF EXISTS "user_self_access" ON users;

-- Create new simplified policies
CREATE POLICY "users_read_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_write_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
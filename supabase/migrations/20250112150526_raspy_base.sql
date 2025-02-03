-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "courses_write_policy" ON courses;

-- Create non-recursive policies for users table
CREATE POLICY "users_read_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_write_policy"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Update course write policy to use JWT claim
CREATE POLICY "courses_write_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR (auth.jwt() ->> 'role' = 'admin')
  );
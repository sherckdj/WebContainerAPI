-- Update policies for courses table
DROP POLICY IF EXISTS "courses_read_policy" ON courses;
DROP POLICY IF EXISTS "courses_write_policy" ON courses;

CREATE POLICY "courses_read_policy"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_write_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update policies for users table
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;

CREATE POLICY "users_read_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_write_policy"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update policies for enrollments table
DROP POLICY IF EXISTS "enrollments_read_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_write_policy" ON enrollments;

CREATE POLICY "enrollments_read_policy"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "enrollments_write_policy"
  ON enrollments
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
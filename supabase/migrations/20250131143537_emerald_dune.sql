-- Drop existing policies
DROP POLICY IF EXISTS "course_read_policy" ON courses;
DROP POLICY IF EXISTS "course_write_policy" ON courses;
DROP POLICY IF EXISTS "users_read_policy" ON users;

-- Create course policies
CREATE POLICY "courses_select"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_update"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = instructor_id
    OR EXISTS (
      SELECT 1 
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "courses_delete"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = instructor_id
    OR EXISTS (
      SELECT 1 
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "courses_insert"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'instructor')
    )
  );

-- Create user policies
CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  );
$$;

-- Create view for course details with proper access control
DROP VIEW IF EXISTS course_details;
CREATE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
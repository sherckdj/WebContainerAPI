-- Drop existing views
DROP VIEW IF EXISTS course_details;
DROP VIEW IF EXISTS user_profiles;

-- Create user profiles view with proper structure
CREATE OR REPLACE VIEW user_profiles AS 
SELECT 
  u.id,
  u.email,
  u.role,
  u.created_at,
  u.updated_at
FROM users u
WHERE 
  auth.uid() = u.id 
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  );

-- Create course details view with instructor info
CREATE OR REPLACE VIEW course_details AS 
SELECT 
  c.id,
  c.title,
  c.description,
  c.instructor_id,
  c.created_at,
  c.updated_at,
  u.email as instructor_email
FROM courses c
JOIN users u ON c.instructor_id = u.id
WHERE auth.role() = 'authenticated';

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "courses_read_policy" ON courses;
DROP POLICY IF EXISTS "courses_write_policy" ON courses;

-- Create new policies for users table
CREATE POLICY "users_read_policy_new"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    auth.uid() = id
    OR 
    -- Admins can read all data
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "users_write_policy_new"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Create new policies for courses table
CREATE POLICY "courses_read_policy_new"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);  -- All authenticated users can read courses

CREATE POLICY "courses_write_policy_new"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
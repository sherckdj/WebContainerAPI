-- Drop all existing policies first
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "allow_read_courses" ON courses;
DROP POLICY IF EXISTS "allow_modify_courses" ON courses;
DROP POLICY IF EXISTS "courses_select" ON courses;
DROP POLICY IF EXISTS "courses_modify" ON courses;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "course_read_policy" ON courses;
DROP POLICY IF EXISTS "course_write_policy" ON courses;

-- Create new simplified policies with unique names
CREATE POLICY "users_read_access_v2"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_read_access_v2"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_modify_access_v2"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = instructor_id
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Update course details view
DROP VIEW IF EXISTS course_details;
CREATE VIEW course_details AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.instructor_id,
  c.created_at,
  c.updated_at,
  u.email as instructor_email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
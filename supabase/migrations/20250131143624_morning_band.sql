-- Drop existing policies
DROP POLICY IF EXISTS "courses_select" ON courses;
DROP POLICY IF EXISTS "courses_update" ON courses;
DROP POLICY IF EXISTS "courses_delete" ON courses;
DROP POLICY IF EXISTS "courses_insert" ON courses;
DROP POLICY IF EXISTS "users_select" ON users;

-- Create simplified course policies
CREATE POLICY "courses_select"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_modify"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = instructor_id
    OR (auth.jwt() ->> 'role' = 'admin')
  );

-- Create simplified user policies
CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create simplified view for course details
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
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
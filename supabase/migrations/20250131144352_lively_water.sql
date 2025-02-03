-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy_v4" ON users;
DROP POLICY IF EXISTS "courses_read_policy_v4" ON courses;
DROP POLICY IF EXISTS "courses_write_policy_v4" ON courses;

-- Create policy for users table with broader read access
CREATE POLICY "users_read_policy_v5"
  ON users
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read user data

-- Create policies for courses table
CREATE POLICY "courses_read_policy_v5"
  ON courses
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read courses

CREATE POLICY "courses_write_policy_v5"
  ON courses
  FOR ALL
  USING (
    instructor_id = auth.uid()
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Update course details view to use LEFT JOIN
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
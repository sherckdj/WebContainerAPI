-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy_v3" ON users;
DROP POLICY IF EXISTS "courses_read_policy_v3" ON courses;
DROP POLICY IF EXISTS "courses_write_policy_v3" ON courses;

-- Create policy for users table that allows reading user data
CREATE POLICY "users_read_policy_v4"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    id = auth.uid()
    OR
    -- Anyone can read instructor data
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.instructor_id = users.id
    )
    OR
    -- Admins can read all user data
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for courses table
CREATE POLICY "courses_read_policy_v4"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_write_policy_v4"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Update course details view to use LEFT JOIN for better performance
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
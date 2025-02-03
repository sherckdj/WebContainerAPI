-- Drop existing policies with new names to avoid conflicts
DROP POLICY IF EXISTS "users_read_policy_new" ON users;
DROP POLICY IF EXISTS "users_write_policy_new" ON users;
DROP POLICY IF EXISTS "courses_read_policy_new" ON courses;
DROP POLICY IF EXISTS "courses_write_policy_new" ON courses;

-- Create simplified user policies with unique names
CREATE POLICY "users_read_policy_new"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create simplified course policies with unique names
CREATE POLICY "courses_read_policy_new"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_create_policy_new"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = instructor_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update view for course details
DROP VIEW IF EXISTS course_details;
CREATE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;
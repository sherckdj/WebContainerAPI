-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy_new" ON users;
DROP POLICY IF EXISTS "courses_read_policy_new" ON courses;
DROP POLICY IF EXISTS "courses_create_policy_new" ON courses;

-- Create policies for users table
CREATE POLICY "users_read_access"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for courses table
CREATE POLICY "courses_read_access"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_insert_access"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "courses_update_access"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = instructor_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Ensure view exists with correct permissions
DROP VIEW IF EXISTS course_details;
CREATE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;
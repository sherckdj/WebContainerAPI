-- Drop existing policies
DROP POLICY IF EXISTS "course_read_policy" ON courses;
DROP POLICY IF EXISTS "course_write_policy" ON courses;
DROP POLICY IF EXISTS "course_delete_policy" ON courses;
DROP POLICY IF EXISTS "course_insert_policy" ON courses;

-- Create simplified course policies
CREATE POLICY "course_read_policy"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "course_write_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create view for course details
CREATE OR REPLACE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
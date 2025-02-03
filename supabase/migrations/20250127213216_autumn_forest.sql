-- Drop existing course policies
DROP POLICY IF EXISTS "courses_read_policy" ON courses;
DROP POLICY IF EXISTS "courses_write_policy" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;

-- Create new course policies
CREATE POLICY "course_read_policy"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);  -- All authenticated users can view courses

CREATE POLICY "course_write_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    -- Course instructor can modify their own courses
    instructor_id = auth.uid()
    OR
    -- Admins can modify any course
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create view for course details that includes instructor info
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
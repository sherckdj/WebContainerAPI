-- Drop existing course policies
DROP POLICY IF EXISTS "course_read_policy" ON courses;
DROP POLICY IF EXISTS "course_write_policy" ON courses;

-- Create new course policies with proper permissions
CREATE POLICY "course_read_policy"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);  -- All authenticated users can view courses

CREATE POLICY "course_write_policy"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (
    -- Course instructor can modify their own courses
    instructor_id = auth.uid()
    OR
    -- Admins can modify any course
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "course_delete_policy"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "course_insert_policy"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only instructors and admins can create courses
    (SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin')
  );

-- Update course details view to use LEFT JOIN
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
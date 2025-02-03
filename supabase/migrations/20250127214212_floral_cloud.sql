-- Drop existing policies and view
DROP POLICY IF EXISTS "course_read_policy" ON courses;
DROP POLICY IF EXISTS "course_write_policy" ON courses;
DROP POLICY IF EXISTS "course_delete_policy" ON courses;
DROP POLICY IF EXISTS "course_insert_policy" ON courses;
DROP VIEW IF EXISTS course_details;

-- Create simplified policies using only JWT claims and direct course access
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
    instructor_id = auth.uid()
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "course_delete_policy"
  ON courses
  FOR DELETE
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "course_insert_policy"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('instructor', 'admin')
  );

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
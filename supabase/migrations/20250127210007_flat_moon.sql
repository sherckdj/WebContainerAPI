-- Drop existing policies
DROP POLICY IF EXISTS "enrollments_read_policy" ON enrollments;
DROP POLICY IF EXISTS "enrollments_write_policy" ON enrollments;
DROP POLICY IF EXISTS "Students can manage their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view their course enrollments" ON enrollments;

-- Create new policies for enrollments
CREATE POLICY "enrollment_read_policy"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (
    -- Students can view their own enrollments
    user_id = auth.uid()
    OR 
    -- Instructors can view enrollments for their courses
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR
    -- Admins can view all enrollments
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "enrollment_insert_policy"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Students can enroll themselves
    (user_id = auth.uid())
    OR
    -- Instructors can enroll students in their courses
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR
    -- Admins can enroll anyone
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "enrollment_delete_policy"
  ON enrollments
  FOR DELETE
  TO authenticated
  USING (
    -- Students can unenroll themselves
    user_id = auth.uid()
    OR
    -- Instructors can remove students from their courses
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
    OR
    -- Admins can remove any enrollment
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
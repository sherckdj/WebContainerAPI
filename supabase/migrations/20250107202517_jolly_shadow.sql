-- Drop existing policies
DROP POLICY IF EXISTS "admin_manage_enrollments" ON enrollments;
DROP POLICY IF EXISTS "users_view_own_enrollments" ON enrollments;

-- Update enrollments table structure
ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS fk_enrollments_user;

-- Ensure the column exists before trying to rename
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enrollments' 
    AND column_name = 'student_id'
  ) THEN
    ALTER TABLE enrollments RENAME COLUMN student_id TO user_id;
  END IF;
END $$;

-- Add proper constraints
ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollments_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_user ON enrollments(course_id, user_id);

-- Create policies
CREATE POLICY "admin_manage_enrollments"
  ON enrollments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "users_view_own_enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
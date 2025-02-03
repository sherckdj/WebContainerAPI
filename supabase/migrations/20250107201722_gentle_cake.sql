-- Update enrollments table to properly reference users table
ALTER TABLE enrollments
RENAME COLUMN student_id TO user_id;

-- Add foreign key constraint
ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollments_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_enrollments_user ON enrollments(user_id);

-- Update policies for enrollments
DROP POLICY IF EXISTS "Students can manage their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view their course enrollments" ON enrollments;

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
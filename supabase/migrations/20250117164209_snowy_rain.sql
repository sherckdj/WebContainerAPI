-- Add new columns for user profile information if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'student_number') THEN
    ALTER TABLE users ADD COLUMN student_number text;
  END IF;
END $$;

-- Create index for student number lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' 
    AND indexname = 'idx_users_student_number'
  ) THEN
    CREATE INDEX idx_users_student_number ON users(student_number);
  END IF;
END $$;

-- Update or create user_profiles view
DROP VIEW IF EXISTS user_profiles;
CREATE VIEW user_profiles AS 
SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  u.student_number,
  u.created_at,
  u.updated_at
FROM users u;

-- Add policies for profile fields
CREATE POLICY "users_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
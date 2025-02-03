-- Drop existing view
DROP VIEW IF EXISTS user_profiles;

-- Create user profiles view with proper structure
CREATE OR REPLACE VIEW user_profiles AS 
SELECT 
  users.id,
  users.email,
  users.role,
  users.created_at,
  users.updated_at
FROM users
WHERE 
  auth.uid() = users.id 
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  );

-- Modify courses table to reference users table
ALTER TABLE courses
DROP CONSTRAINT IF EXISTS fk_instructor,
ADD CONSTRAINT fk_instructor 
  FOREIGN KEY (instructor_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Create view for course details with instructor info
CREATE OR REPLACE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email,
  u.role as instructor_role
FROM courses c
JOIN users u ON c.instructor_id = u.id
WHERE 
  -- Show all courses to authenticated users
  auth.role() = 'authenticated';

-- Update courses policies
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;

CREATE POLICY "course_access_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    -- Instructors can manage their own courses
    instructor_id = auth.uid()
    OR
    -- Admins can manage all courses
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
    OR
    -- Everyone can view courses
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.role() = 'authenticated'
    )
  );
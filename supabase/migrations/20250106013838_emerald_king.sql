/*
  # Update Database Schema and Policies

  1. Views
    - Create user_profiles view for safe user data access
    - Create course_details view for course information with instructor details
  
  2. Policies
    - Update users table policies for proper access control
    - Update courses table policies for course management
    
  3. Indexes
    - Add performance optimization indexes
*/

-- Drop existing views
DROP VIEW IF EXISTS course_details;
DROP VIEW IF EXISTS user_profiles;

-- Create user profiles view
CREATE VIEW user_profiles AS 
SELECT 
  u.id,
  u.email,
  u.role,
  u.created_at,
  u.updated_at
FROM users u;

-- Create course details view
CREATE VIEW course_details AS 
SELECT 
  c.id,
  c.title,
  c.description,
  c.instructor_id,
  c.created_at,
  c.updated_at,
  u.email as instructor_email
FROM courses c
JOIN users u ON c.instructor_id = u.id;

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "courses_read_policy" ON courses;
DROP POLICY IF EXISTS "courses_write_policy" ON courses;

-- Create new policies for users table
CREATE POLICY "users_read_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "users_write_policy"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Create new policies for courses table
CREATE POLICY "courses_read_policy"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courses_write_policy"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
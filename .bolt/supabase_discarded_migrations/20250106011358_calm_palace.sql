/*
  # Course Management Schema
  
  1. Creates a secure user profiles view with built-in access control
  2. Sets up courses and enrollments tables with relationships
  3. Implements RLS policies and performance indexes
*/

-- Create user profiles view with built-in access control
CREATE OR REPLACE VIEW public.user_profiles AS 
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  updated_at
FROM auth.users
WHERE 
  -- Built-in access control: users can only see their own profile or all profiles if admin
  auth.uid() = id OR 
  auth.jwt()->>'role' = 'admin';

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('enrolled', 'completed', 'dropped')),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(course_id, student_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Instructors can manage their courses"
  ON courses
  FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Everyone can view courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Enrollments policies
CREATE POLICY "Students can manage their enrollments"
  ON enrollments
  FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Instructors can view their course enrollments"
  ON enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);
/*
  # Create User Profiles View and Course Management Tables
  
  1. Creates a secure view of auth.users
  2. Sets up courses and enrollments tables
  3. Implements RLS policies for data access control
*/

-- First, create a view of auth.users in public schema with built-in row-level security
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE 
  -- Built-in access control: only show records the user should see
  auth.uid() = id 
  OR (auth.jwt()->>'role' = 'admin');

-- Recreate tables with references to auth.users
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_instructor 
    FOREIGN KEY (instructor_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('enrolled', 'completed', 'dropped')),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT fk_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_student 
    FOREIGN KEY (student_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  CONSTRAINT unique_enrollment 
    UNIQUE(course_id, student_id)
);

-- Enable RLS on tables (not the view)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "Students can manage their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view their course enrollments" ON enrollments;

-- Courses policies
CREATE POLICY "Instructors can manage their courses"
  ON courses FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Everyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Enrollments policies
CREATE POLICY "Students can manage their enrollments"
  ON enrollments FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Instructors can view their course enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);
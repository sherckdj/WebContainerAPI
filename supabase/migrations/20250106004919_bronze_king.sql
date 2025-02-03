/*
  # Fix Course Management Relationships

  1. Changes
    - Drop and recreate courses and enrollments tables with proper relationships
    - Update policies to use proper joins
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Add policies for course viewing and management
    - Add policies for enrollment management
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;

-- Recreate courses table with proper relationships
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate enrollments table with proper relationships
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('enrolled', 'completed', 'dropped')),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);
/*
  # Setup Course Management System

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `instructor_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `enrollments`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `student_id` (uuid, references auth.users)
      - `status` (text, enum: enrolled, completed, dropped)
      - `enrolled_at` (timestamp)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for course management and viewing
    - Add policies for enrollment management

  3. Performance
    - Add indexes for foreign keys and commonly queried columns
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;

-- Create courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE enrollments (
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
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);
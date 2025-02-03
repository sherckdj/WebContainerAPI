/*
  # Course Management Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `instructor_id` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `enrollments`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `student_id` (uuid, references users)
      - `status` (text: 'enrolled', 'completed', 'dropped')
      - `enrolled_at` (timestamp)
      - `completed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on both tables
    - Policies for instructors to manage their courses
    - Policies for students to view available courses and manage enrollments
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor_id uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
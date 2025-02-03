/*
  # Add course content functionality
  
  1. New Tables
    - `course_content`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text)
      - `content` (text)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `course_content` table
    - Add policies for instructors and admins to manage content
    - Add policies for enrolled students to view content
*/

-- Create course content table
CREATE TABLE course_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Instructors can manage their course content"
  ON course_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_content.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all content"
  ON course_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Enrolled students can view content"
  ON course_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = course_content.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'enrolled'
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_course_content_course ON course_content(course_id);
CREATE INDEX idx_course_content_order ON course_content("order");
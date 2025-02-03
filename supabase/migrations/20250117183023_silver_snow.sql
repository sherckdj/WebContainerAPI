/*
  # Add course labs support
  
  1. New Tables
    - `course_labs`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `app_id` (uuid, references apps)
      - `title` (text)
      - `description` (text)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Create course_labs table
CREATE TABLE course_labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_labs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage labs"
  ON course_labs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Course participants can view labs"
  ON course_labs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = course_labs.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'enrolled'
    ) OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_labs.course_id
      AND courses.instructor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM course_instructors
      WHERE course_instructors.course_id = course_labs.course_id
      AND course_instructors.instructor_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX idx_course_labs_course ON course_labs(course_id);
CREATE INDEX idx_course_labs_app ON course_labs(app_id);
CREATE INDEX idx_course_labs_order ON course_labs("order");
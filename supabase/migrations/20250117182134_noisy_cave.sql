/*
  # Add course instructors support
  
  1. New Tables
    - `course_instructors`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `instructor_id` (uuid, references users)
      - `created_at` (timestamp)

  2. Views
    - Update `course_details` view to include co-instructors

  3. Security
    - Enable RLS on course_instructors table
    - Add policies for instructor access
*/

-- Create course_instructors table
CREATE TABLE course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, instructor_id)
);

-- Enable RLS
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Instructors can view their courses"
  ON course_instructors
  FOR SELECT
  TO authenticated
  USING (
    instructor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_instructors.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Course owners can manage instructors"
  ON course_instructors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_instructors.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Drop and recreate course_details view
DROP VIEW IF EXISTS course_details;
CREATE VIEW course_details AS
SELECT 
  c.*,
  u.email as instructor_email,
  (
    SELECT json_agg(json_build_object(
      'instructor', ui.*
    ))
    FROM course_instructors ci
    JOIN users ui ON ci.instructor_id = ui.id
    WHERE ci.course_id = c.id
  ) as co_instructors
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id;

-- Add indexes for better performance
CREATE INDEX idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX idx_course_instructors_instructor ON course_instructors(instructor_id);
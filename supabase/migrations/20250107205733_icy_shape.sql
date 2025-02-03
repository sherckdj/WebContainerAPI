-- Create grades table
CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_name text NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, student_id, assignment_name)
);

-- Enable RLS
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Instructors can manage grades for their courses"
  ON grades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = grades.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own grades"
  ON grades
  FOR SELECT
  USING (student_id = auth.uid());

-- Create indexes
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);
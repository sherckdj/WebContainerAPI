-- Check and create course_content table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'course_content') THEN
    CREATE TABLE course_content (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title text NOT NULL,
      content text NOT NULL,
      "order" integer NOT NULL DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'course_content' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Instructors can manage their course content" ON course_content;
DROP POLICY IF EXISTS "Admins can manage all content" ON course_content;
DROP POLICY IF EXISTS "Enrolled students can view content" ON course_content;

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

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'course_content' 
    AND indexname = 'idx_course_content_course'
  ) THEN
    CREATE INDEX idx_course_content_course ON course_content(course_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'course_content' 
    AND indexname = 'idx_course_content_order'
  ) THEN
    CREATE INDEX idx_course_content_order ON course_content("order");
  END IF;
END $$;
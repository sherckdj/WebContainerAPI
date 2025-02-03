-- Add app_instance_id column to course_content table
ALTER TABLE course_content
ADD COLUMN app_instance_id uuid REFERENCES app_instances(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_course_content_app_instance ON course_content(app_instance_id);

-- Update course content view to include app instance data
CREATE OR REPLACE VIEW course_content_details AS
SELECT 
  cc.*,
  ai.title as app_title,
  ai.config as app_config,
  a.type as app_type,
  a.config_schema as app_schema
FROM course_content cc
LEFT JOIN app_instances ai ON cc.app_instance_id = ai.id
LEFT JOIN apps a ON ai.app_id = a.id;

-- Add policy for viewing course content with apps
CREATE POLICY "view_course_content_with_apps"
  ON course_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = course_content.course_id
      AND e.user_id = auth.uid()
      AND e.status = 'enrolled'
    )
    OR EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_content.course_id
      AND c.instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );
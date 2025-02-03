-- Ensure we have the correct column name
DO $$ 
BEGIN
  -- First check if we need to rename the column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enrollments' 
    AND column_name = 'student_id'
  ) THEN
    ALTER TABLE enrollments RENAME COLUMN student_id TO user_id;
  END IF;
END $$;

-- Ensure we have the proper foreign key constraint
ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS fk_enrollments_user;

ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollments_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Create or replace the enrollments view for easier access
CREATE OR REPLACE VIEW enrollment_details AS
SELECT 
  e.*,
  u.email as user_email,
  u.role as user_role,
  c.title as course_title
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id;
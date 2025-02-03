-- Rename assignment_name to activity_title in grades table
ALTER TABLE grades 
RENAME COLUMN assignment_name TO activity_title;

-- Update indexes if they exist
DROP INDEX IF EXISTS idx_grades_assignment;
CREATE INDEX idx_grades_activity ON grades(activity_title);
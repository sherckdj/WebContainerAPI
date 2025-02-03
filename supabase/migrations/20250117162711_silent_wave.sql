-- Add new columns for student information
ALTER TABLE users
ADD COLUMN first_name text,
ADD COLUMN last_name text,
ADD COLUMN student_number text;

-- Create index for student number lookups
CREATE INDEX idx_users_student_number ON users(student_number);

-- Update user_profiles view to include new fields
DROP VIEW IF EXISTS user_profiles;
CREATE VIEW user_profiles AS 
SELECT 
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  u.student_number,
  u.created_at,
  u.updated_at
FROM users u;
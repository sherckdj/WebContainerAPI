/*
  # Remove Student Accounts
  
  1. Changes
    - Delete all student accounts except student2@email.com
    - Preserve all non-student accounts
    - Log deleted accounts for audit purposes

  2. Security
    - Only delete users with role = 'student'
    - Explicit email check for preservation
    - Cascading delete through foreign key constraints
*/

-- Create a function to log deleted users
CREATE OR REPLACE FUNCTION log_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'Deleted user: % (role: %)', OLD.email, OLD.role;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging
CREATE TRIGGER log_user_deletion
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_deleted_user();

-- Delete student accounts except student2@email.com
DELETE FROM users
WHERE role = 'student'
AND email != 'student2@email.com';

-- Drop the logging trigger and function
DROP TRIGGER IF EXISTS log_user_deletion ON users;
DROP FUNCTION IF EXISTS log_deleted_user();
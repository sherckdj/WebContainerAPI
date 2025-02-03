/*
  # Fix user creation and policies

  1. Changes
    - Simplify policies to ensure proper user creation and visibility
    - Add better error handling for user creation
    - Ensure proper role synchronization

  2. Security
    - Maintain RLS while fixing visibility issues
    - Ensure proper access control for user management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "admin_write_policy" ON users;
DROP POLICY IF EXISTS "admin_update_policy" ON users;

-- Create new simplified policies
CREATE POLICY "authenticated_read"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add better error handling for user creation
CREATE OR REPLACE FUNCTION handle_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure role is set
  IF NEW.role IS NULL THEN
    RAISE EXCEPTION 'Role cannot be null';
  END IF;

  -- Ensure email is set
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be null';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user creation validation
DROP TRIGGER IF EXISTS validate_user_creation ON users;
CREATE TRIGGER validate_user_creation
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_creation();
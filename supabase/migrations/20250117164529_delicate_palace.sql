/*
  # Update User Profile Fields

  1. Changes
    - Add trigger to sync user metadata with profile fields
    - Update user_profiles view to include all fields
    - Add policy for profile updates

  2. Security
    - Maintain existing RLS policies
    - Add specific policy for profile updates
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_metadata ON users;

-- Create function to sync user metadata
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata with profile fields
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object(
      'role', NEW.role,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'student_number', NEW.student_number
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for metadata synchronization
CREATE TRIGGER sync_user_metadata
  AFTER INSERT OR UPDATE OF role, first_name, last_name, student_number ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_metadata();

-- Update user_profiles view
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

-- Add policy for profile updates if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_update_profile'
  ) THEN
    CREATE POLICY "users_update_profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      )
      WITH CHECK (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;
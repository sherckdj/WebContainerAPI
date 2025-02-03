/*
  # Fix admin access and RLS policies

  1. Changes
    - Add function to sync role to auth metadata
    - Update RLS policies to use both JWT and users table check
    - Add trigger to keep auth metadata in sync
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create function to sync role to auth metadata
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata with the role
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to keep auth metadata in sync
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role();

-- Create new policies
CREATE POLICY "Admins have full access"
  ON users
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    OR (
      SELECT role FROM users WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
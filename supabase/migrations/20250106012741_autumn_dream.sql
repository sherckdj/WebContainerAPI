-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "admin_full_access" ON users;

-- Create simplified policies without recursion
CREATE POLICY "allow_read_own_user"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- User can read their own data
    auth.uid() = id
  );

CREATE POLICY "allow_admin_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Admin access based on JWT claim
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create function to sync role to JWT claims
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

-- Create trigger for role synchronization
DROP TRIGGER IF EXISTS on_user_role_change ON users;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
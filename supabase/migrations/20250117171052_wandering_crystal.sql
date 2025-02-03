-- Create function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the deletion
  RAISE LOG 'Deleting user: % (role: %)', OLD.email, OLD.role;
  
  -- Delete auth user (this will cascade to the public.users table)
  DELETE FROM auth.users WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cleanup
CREATE TRIGGER cleanup_deleted_user
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Add index for better deletion performance
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);
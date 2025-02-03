-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function for user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  role_value text;
  first_name_value text;
  last_name_value text;
  student_number_value text;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
    RAISE LOG 'User already exists: %', NEW.email;
    RETURN NEW;
  END IF;

  -- Extract and validate role
  role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF role_value NOT IN ('student', 'instructor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', role_value;
  END IF;

  -- Extract other fields
  first_name_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  last_name_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  student_number_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'student_number'), '');

  -- Log the insertion attempt
  RAISE LOG 'Creating user % with role % (first_name: %, last_name: %, student_number: %)',
    NEW.email, role_value, first_name_value, last_name_value, student_number_value;

  -- Insert the user with all fields
  INSERT INTO public.users (
    id,
    email,
    role,
    first_name,
    last_name,
    student_number,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    role_value,
    first_name_value,
    last_name_value,
    student_number_value,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Log successful insertion
  RAISE LOG 'Successfully created user % with role %', NEW.email, role_value;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log any errors that occur
  RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger with proper timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add function to properly clean up deleted users
CREATE OR REPLACE FUNCTION cleanup_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete from auth.users if it exists
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error cleaning up user %: %', OLD.email, SQLERRM;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cleanup
DROP TRIGGER IF EXISTS cleanup_deleted_user ON users;
CREATE TRIGGER cleanup_deleted_user
  AFTER DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_deleted_user();
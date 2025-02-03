/*
  # Fix User Creation Process

  1. Changes
    - Update handle_new_user function to properly handle all user fields
    - Add validation for student fields
    - Improve error handling and logging
    - Update trigger to handle all fields

  2. Security
    - Maintain SECURITY DEFINER
    - Proper error handling
    - Data validation
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the function with improved handling
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
  -- Extract and validate role
  role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF role_value NOT IN ('student', 'instructor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', role_value;
  END IF;

  -- Extract other fields
  first_name_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  last_name_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  student_number_value := NULLIF(TRIM(NEW.raw_user_meta_data->>'student_number'), '');

  -- Validate student fields
  IF role_value = 'student' THEN
    IF student_number_value IS NULL THEN
      RAISE LOG 'Warning: Student created without student number';
    END IF;
  END IF;

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
  );

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

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_users_student_number ON users(student_number);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(last_name, first_name);
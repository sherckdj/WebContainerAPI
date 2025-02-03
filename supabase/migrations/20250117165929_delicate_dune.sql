/*
  # Fix User Creation Function

  1. Changes
    - Drop trigger before function
    - Recreate function with proper profile field handling
    - Recreate trigger

  2. Security
    - Maintain SECURITY DEFINER
    - Proper error handling
    - Safe metadata extraction
*/

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function for user creation
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
  -- Extract values from metadata with proper null handling
  role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  first_name_value := NEW.raw_user_meta_data->>'first_name';
  last_name_value := NEW.raw_user_meta_data->>'last_name';
  student_number_value := NEW.raw_user_meta_data->>'student_number';

  -- Log the values for debugging
  RAISE LOG 'Creating user with role: %, first_name: %, last_name: %, student_number: %',
    role_value, first_name_value, last_name_value, student_number_value;

  -- Insert user with profile fields
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

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
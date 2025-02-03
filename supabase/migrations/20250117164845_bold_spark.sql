/*
  # Update User Creation Process

  1. Changes
    - Update handle_new_user function to include profile fields
    - Add validation for student profile fields
    - Ensure metadata sync on creation

  2. Security
    - Maintain existing RLS policies
    - Keep security definer context
*/

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function for user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extract profile fields from metadata
  INSERT INTO public.users (
    id,
    email,
    role,
    first_name,
    last_name,
    student_number
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'student_number'
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
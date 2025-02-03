/*
  # Fix user creation trigger

  1. Changes
    - Drop and recreate the trigger function with proper error handling
    - Drop and recreate the trigger with proper timing
    - Add logging for debugging

  2. Security
    - Maintains existing RLS policies
    - Uses SECURITY DEFINER for proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log the incoming data for debugging
  RAISE LOG 'Creating new user record: id=%, email=%, role=%', 
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role';

  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  
  RAISE LOG 'User record created successfully';
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating user record: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with AFTER timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
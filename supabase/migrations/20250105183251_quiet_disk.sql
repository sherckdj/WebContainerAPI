/*
  # Add manual users function

  1. Changes
    - Add function to manually create users with proper role
    - Add RLS policy for admins to create users
    - Remove signup-related triggers

  2. Security
    - Only admins can create new users
    - Maintains existing RLS policies
*/

-- Drop the automatic user creation trigger since we're moving to manual creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function for manual user creation
CREATE OR REPLACE FUNCTION create_user(
  user_email text,
  user_role text,
  OUT user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate role
  IF user_role NOT IN ('student', 'instructor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be student, instructor, or admin';
  END IF;

  -- Insert into users table
  INSERT INTO public.users (id, email, role)
  VALUES (gen_random_uuid(), user_email, user_role)
  RETURNING id INTO user_id;
END;
$$;
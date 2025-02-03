/*
  # Update User Profiles View and Course Foreign Key
  
  1. Creates a secure view of auth.users with built-in access control
  2. Updates courses table foreign key constraint
*/

-- Create public view for user profiles with built-in access control
CREATE OR REPLACE VIEW public.user_profiles AS 
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at,
  updated_at
FROM auth.users
WHERE 
  -- Built-in access control: users can only see their own profile or all profiles if admin
  auth.uid() = id OR 
  auth.jwt()->>'role' = 'admin';

-- Update courses table to use auth.users reference
ALTER TABLE courses
DROP CONSTRAINT IF EXISTS fk_instructor,
ADD CONSTRAINT fk_instructor 
  FOREIGN KEY (instructor_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
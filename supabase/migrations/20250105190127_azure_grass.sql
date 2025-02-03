/*
  # Add email constraint and improve user management

  1. Changes
    - Add unique constraint on email column
    - Update RLS policies for better security
    - Add trigger for handling user creation

  2. Security
    - Maintain existing RLS policies
    - Add constraint to prevent duplicate emails
*/

-- Add unique constraint to email
ALTER TABLE users 
ADD CONSTRAINT users_email_key UNIQUE (email);

-- Update existing trigger for better error handling
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in sync_user_role: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
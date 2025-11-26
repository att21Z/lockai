/*
  # Fix habits table foreign key constraint

  1. Changes
    - Drop the existing foreign key constraint from habits.user_id to auth.users.id
    - Add a new foreign key constraint from habits.user_id to public.users.id
    - This allows habits to reference users in the public.users table instead of auth.users
  
  2. Reasoning
    - The application uses public.users table for user management
    - auth.users table is empty (no authentication configured yet)
    - Habits need to reference the correct users table
*/

-- Drop the old foreign key constraint pointing to auth.users
ALTER TABLE habits 
DROP CONSTRAINT IF EXISTS habits_user_id_fkey;

-- Add new foreign key constraint pointing to public.users
ALTER TABLE habits 
ADD CONSTRAINT habits_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

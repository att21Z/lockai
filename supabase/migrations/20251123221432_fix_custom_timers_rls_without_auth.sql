/*
  # Fix Custom Timers RLS for Non-Authenticated Users

  1. Changes
    - Drop existing restrictive RLS policies that require auth.uid()
    - Create new permissive policies that work without authentication
    - Allow all authenticated and anon users to manage timers

  2. Security Note
    - Since the app doesn't use Supabase Auth, we remove auth.uid() checks
    - Users are managed in the public.users table
    - In production, proper authentication should be implemented
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can create own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can update own timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can delete own timers" ON custom_timers;

-- Create new permissive policies that don't require auth.uid()
CREATE POLICY "Allow all to read timers"
  ON custom_timers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all to create timers"
  ON custom_timers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all to update timers"
  ON custom_timers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete timers"
  ON custom_timers
  FOR DELETE
  TO public
  USING (true);
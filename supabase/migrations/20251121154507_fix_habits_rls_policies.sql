/*
  # Fix habits RLS policies for deletion

  1. Problem
    - Multiple conflicting policies exist for habits table
    - Some policies use auth.uid() which returns null (no auth session)
    - Deletion is blocked by authenticated policies

  2. Changes
    - Drop all existing policies
    - Create new simple policies that work without authentication
    - Allow all operations for public role (since no auth is configured yet)
  
  3. Security Note
    - These policies are permissive to allow the app to function
    - When authentication is added later, these should be updated
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete their habits" ON habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert their habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can update their habits" ON habits;
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can view their habits" ON habits;

-- Create simple policies that work without authentication
CREATE POLICY "Allow all select on habits"
  ON habits
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all insert on habits"
  ON habits
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all update on habits"
  ON habits
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all delete on habits"
  ON habits
  FOR DELETE
  TO public
  USING (true);

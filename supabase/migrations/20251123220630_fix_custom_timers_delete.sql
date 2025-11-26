/*
  # Fix Custom Timers DELETE Operation

  1. Changes
    - Enable RLS on custom_timers table
    - Add SELECT policy for authenticated users to read their own timers
    - Add INSERT policy for authenticated users to create their own timers
    - Add DELETE policy for authenticated users to delete their own timers
    - Add UPDATE policy for authenticated users to update their own timers

  2. Security
    - All policies check authentication via auth.uid()
    - All policies verify ownership via user_id match
    - Ensures users can only manage their own timers
*/

-- Enable Row Level Security
ALTER TABLE custom_timers ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own timers
CREATE POLICY "Users can read own timers"
  ON custom_timers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create their own timers
CREATE POLICY "Users can create own timers"
  ON custom_timers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own timers
CREATE POLICY "Users can update own timers"
  ON custom_timers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own timers
CREATE POLICY "Users can delete own timers"
  ON custom_timers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
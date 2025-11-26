/*
  # Add AI Coach Name to Users Table

  1. Changes
    - Add `coach_name` column to `users` table to store the personalized AI coach name
    - Add `coach_name` column to `onboarding_responses` table to persist data from onboarding
  
  2. Details
    - `coach_name` (text, nullable) - Stores the custom name the user gives to their AI coach
    - This allows personalization of the coaching experience throughout the app
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'coach_name'
  ) THEN
    ALTER TABLE users ADD COLUMN coach_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'coach_name'
  ) THEN
    ALTER TABLE onboarding_responses ADD COLUMN coach_name text;
  END IF;
END $$;

/*
  # Add Daily Habit Tracking and Streak Management

  1. Schema Changes
    - Add `last_completion_date` to users table - Track the last day all habits were completed
    - Add `last_reset_check` to users table - Track when we last checked for streak reset
    - Add `completed_date` to habits table - Track when each habit was last completed
    
  2. Purpose
    - Enable daily habit completion tracking
    - Support streak calculation and reset logic
    - Track individual habit completion dates for accurate streak management
    
  3. Notes
    - `last_completion_date` stores the date (not timestamp) when all habits were completed
    - `last_reset_check` prevents multiple streak resets on the same day
    - `completed_date` on habits tracks individual habit completions
*/

-- Add last_completion_date to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_completion_date'
  ) THEN
    ALTER TABLE users ADD COLUMN last_completion_date date;
  END IF;
END $$;

-- Add last_reset_check to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_reset_check'
  ) THEN
    ALTER TABLE users ADD COLUMN last_reset_check date;
  END IF;
END $$;

-- Add completed_date to habits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE habits ADD COLUMN completed_date date;
  END IF;
END $$;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_habits_completed_date ON habits(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_users_last_completion ON users(last_completion_date);

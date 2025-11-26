/*
  # Update Onboarding Schema for Multiple Selections

  1. Changes
    - Convert `entrepreneurial_status` from text to jsonb array
    - Convert `main_goal` from text to jsonb array
    - Convert `current_situation` from text to jsonb array
    - Convert `main_motivation` from text to jsonb array
    - Convert `main_obstacle` from text to jsonb array

  2. Notes
    - These changes allow users to select multiple options for each question
    - Provides more detailed and accurate onboarding data
    - Maintains backward compatibility with existing data
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'entrepreneurial_status' AND data_type = 'text'
  ) THEN
    ALTER TABLE onboarding_responses 
      ALTER COLUMN entrepreneurial_status TYPE jsonb USING 
        CASE 
          WHEN entrepreneurial_status IS NULL OR entrepreneurial_status = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(entrepreneurial_status)
        END,
      ALTER COLUMN entrepreneurial_status SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'main_goal' AND data_type = 'text'
  ) THEN
    ALTER TABLE onboarding_responses 
      ALTER COLUMN main_goal TYPE jsonb USING 
        CASE 
          WHEN main_goal IS NULL OR main_goal = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(main_goal)
        END,
      ALTER COLUMN main_goal SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'current_situation' AND data_type = 'text'
  ) THEN
    ALTER TABLE onboarding_responses 
      ALTER COLUMN current_situation TYPE jsonb USING 
        CASE 
          WHEN current_situation IS NULL OR current_situation = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(current_situation)
        END,
      ALTER COLUMN current_situation SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'main_motivation' AND data_type = 'text'
  ) THEN
    ALTER TABLE onboarding_responses 
      ALTER COLUMN main_motivation TYPE jsonb USING 
        CASE 
          WHEN main_motivation IS NULL OR main_motivation = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(main_motivation)
        END,
      ALTER COLUMN main_motivation SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'onboarding_responses' AND column_name = 'main_obstacle' AND data_type = 'text'
  ) THEN
    ALTER TABLE onboarding_responses 
      ALTER COLUMN main_obstacle TYPE jsonb USING 
        CASE 
          WHEN main_obstacle IS NULL OR main_obstacle = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(main_obstacle)
        END,
      ALTER COLUMN main_obstacle SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

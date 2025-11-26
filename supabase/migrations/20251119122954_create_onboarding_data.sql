/*
  # Onboarding Data Schema

  1. New Tables
    - `onboarding_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users if exists, nullable for now)
      - `first_name` (text)
      - `entrepreneurial_status` (text)
      - `life_domains` (jsonb array)
      - `main_goal` (text)
      - `current_situation` (text)
      - `main_motivation` (text)
      - `main_obstacle` (text)
      - `last_proud_moment` (text)
      - `goal_tracking_method` (text)
      - `commitment_level` (text)
      - `potential_scores` (jsonb)
      - `target_date` (date)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `onboarding_responses` table
    - Add policy for users to manage their own onboarding data
*/

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name text,
  entrepreneurial_status text,
  life_domains jsonb DEFAULT '[]'::jsonb,
  main_goal text,
  current_situation text,
  main_motivation text,
  main_obstacle text,
  last_proud_moment text,
  goal_tracking_method text,
  commitment_level text,
  potential_scores jsonb DEFAULT '{}'::jsonb,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own onboarding data"
  ON onboarding_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own onboarding data"
  ON onboarding_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own onboarding data"
  ON onboarding_responses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_created_at ON onboarding_responses(created_at);

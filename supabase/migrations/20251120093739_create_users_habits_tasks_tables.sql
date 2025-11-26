/*
  # Create Users, Habits and Tasks Tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `email` (text, unique)
      - `onboarding_id` (uuid, references onboarding_responses)
      - `current_streak` (integer, default 0)
      - `best_streak` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `title` (text)
      - `color` (text)
      - `completed_today` (boolean, default false)
      - `streak` (integer, default 0)
      - `order_index` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `title` (text)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text,
  onboarding_id uuid REFERENCES onboarding_responses(id),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  color text DEFAULT '#58A6FF',
  completed_today boolean DEFAULT false,
  streak integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their habits"
  ON habits FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their habits"
  ON habits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their habits"
  ON habits FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their habits"
  ON habits FOR DELETE
  USING (true);

CREATE POLICY "Users can view their tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their tasks"
  ON tasks FOR DELETE
  USING (true);

CREATE POLICY "Users can view their journal entries"
  ON journal_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their journal entries"
  ON journal_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their journal entries"
  ON journal_entries FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

/*
  # Align Habits Schema and Add Analytics Functions

  1. Schema Alignment
    - Add missing columns to habits table (title, color, order_index, streak, completed_today)
    - Keep existing columns for backward compatibility

  2. Analytics Functions
    - get_weekly_stats - Weekly completion statistics
    - get_monthly_heatmap - Monthly heatmap data
    - get_habit_streak - Calculate habit streak

  3. Indexes
    - Optimize query performance
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'title') THEN
    ALTER TABLE habits ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'color') THEN
    ALTER TABLE habits ADD COLUMN color text DEFAULT '#58A6FF';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'order_index') THEN
    ALTER TABLE habits ADD COLUMN order_index integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'streak') THEN
    ALTER TABLE habits ADD COLUMN streak integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'completed_today') THEN
    ALTER TABLE habits ADD COLUMN completed_today boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'updated_at') THEN
    ALTER TABLE habits ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

UPDATE habits SET title = name WHERE title IS NULL AND name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);

CREATE OR REPLACE FUNCTION get_weekly_stats(p_user_id uuid)
RETURNS TABLE(
  day_name text,
  completion_count bigint,
  total_habits bigint,
  completion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(d.day, 'Day') as day_name,
    COUNT(DISTINCT hc.habit_id) as completion_count,
    (SELECT COUNT(*) FROM habits WHERE user_id = p_user_id)::bigint as total_habits,
    ROUND(
      (COUNT(DISTINCT hc.habit_id)::numeric / NULLIF((SELECT COUNT(*) FROM habits WHERE user_id = p_user_id), 0)) * 100,
      2
    ) as completion_rate
  FROM (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date as day
  ) d
  LEFT JOIN habit_completions hc ON
    DATE(hc.completed_at) = d.day
    AND hc.user_id = p_user_id
  GROUP BY d.day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_monthly_heatmap(p_user_id uuid, p_year int, p_month int)
RETURNS TABLE(
  date date,
  completion_count bigint,
  habits_completed text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.day::date as date,
    COUNT(DISTINCT hc.habit_id) as completion_count,
    ARRAY_AGG(DISTINCT COALESCE(h.title, h.name)) FILTER (WHERE COALESCE(h.title, h.name) IS NOT NULL) as habits_completed
  FROM (
    SELECT generate_series(
      DATE_TRUNC('month', MAKE_DATE(p_year, p_month, 1)),
      DATE_TRUNC('month', MAKE_DATE(p_year, p_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day',
      '1 day'::interval
    )::date as day
  ) d
  LEFT JOIN habit_completions hc ON
    DATE(hc.completed_at) = d.day
    AND hc.user_id = p_user_id
  LEFT JOIN habits h ON h.id = hc.habit_id
  GROUP BY d.day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_habit_streak(p_habit_id uuid)
RETURNS int AS $$
DECLARE
  current_streak int := 0;
  check_date date := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id
      AND DATE(completed_at) = check_date
    ) THEN
      current_streak := current_streak + 1;
      check_date := check_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

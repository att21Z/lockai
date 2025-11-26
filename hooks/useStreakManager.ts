import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseStreakManagerProps {
  userId: string | undefined;
  onStreakUpdate?: (newStreak: number) => void;
}

export function useStreakManager({ userId, onStreakUpdate }: UseStreakManagerProps) {
  useEffect(() => {
    if (!userId) return;

    checkAndUpdateStreak();

    const interval = setInterval(checkAndUpdateStreak, 60000);

    return () => clearInterval(interval);
  }, [userId]);

  async function checkAndUpdateStreak() {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_streak, last_completion_date, last_reset_check')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData.last_reset_check === today) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, completed_date')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (habitsError) throw habitsError;

      if (!habitsData || habitsData.length === 0) {
        return;
      }

      const allHabitsCompletedYesterday = habitsData.every(
        (habit) => habit.completed_date === yesterdayStr
      );

      let newStreak = userData.current_streak;

      if (userData.last_completion_date === yesterdayStr) {
        if (!allHabitsCompletedYesterday) {
          newStreak = 0;
        }
      } else if (userData.last_completion_date) {
        const lastCompletion = new Date(userData.last_completion_date);
        const daysDiff = Math.floor(
          (yesterday.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 1) {
          newStreak = 0;
        }
      }

      await supabase
        .from('users')
        .update({
          current_streak: newStreak,
          last_reset_check: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (onStreakUpdate && newStreak !== userData.current_streak) {
        onStreakUpdate(newStreak);
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  }

  async function completeHabit(habitId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error: habitError } = await supabase
        .from('habits')
        .update({
          completed_today: true,
          completed_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId);

      if (habitError) throw habitError;

      const { data: allHabits, error: fetchError } = await supabase
        .from('habits')
        .select('completed_date')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const allCompleted = allHabits?.every(
        (habit) => habit.completed_date === today
      );

      if (allCompleted) {
        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('current_streak, best_streak')
          .eq('id', userId)
          .single();

        if (userFetchError) throw userFetchError;

        const newStreak = userData.current_streak + 1;
        const newBestStreak = Math.max(userData.best_streak, newStreak);

        const { error: updateError } = await supabase
          .from('users')
          .update({
            current_streak: newStreak,
            best_streak: newBestStreak,
            last_completion_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        if (onStreakUpdate) {
          onStreakUpdate(newStreak);
        }
      }

      return true;
    } catch (error) {
      console.error('Error completing habit:', error);
      return false;
    }
  }

  return { completeHabit };
}

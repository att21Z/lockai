import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  title: string;
  color: string;
  order_index: number;
  completed_today: boolean;
  streak: number;
  frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refetchHabits: () => Promise<void>;
  addHabit: (title: string, color: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, isCompleted: boolean) => Promise<void>;
  getTodayCompletions: () => string[];
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);

  const getTodayCompletions = () => todayCompletions;

  const fetchHabits = async () => {
    if (!user) {
      setHabits([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index');

      if (habitsError) throw habitsError;

      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .lt('completed_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      if (completionsError) throw completionsError;

      const completedIds = completionsData?.map(c => c.habit_id) || [];
      setTodayCompletions(completedIds);

      const enrichedHabits = habitsData?.map(habit => ({
        ...habit,
        completed_today: completedIds.includes(habit.id),
      })) || [];

      setHabits(enrichedHabits);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  const refetchHabits = fetchHabits;

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const addHabit = async (title: string, color: string = '#58A6FF') => {
    if (!user) {
      const errorMsg = 'User not authenticated';
      console.error('addHabit error:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order_index)) : -1;

      const habitData = {
        user_id: user.id,
        name: title,
        title: title,
        color: color || '#58A6FF',
        order_index: maxOrder + 1,
        streak: 0,
        is_active: true,
        frequency: 'daily',
      };

      console.log('Inserting habit:', habitData);

      const { data, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Habit inserted successfully:', data);
      await refetchHabits();
    } catch (err) {
      console.error('Error adding habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to add habit');
      throw err;
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchHabits();
    } catch (err) {
      console.error('Error updating habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to update habit');
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete habit');
      throw err;
    }
  };

  const toggleHabitCompletion = async (habitId: string, isCompleted: boolean) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      if (isCompleted) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user.id)
          .gte('completed_at', today)
          .lt('completed_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;

        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          await updateHabit(habitId, { streak: habit.streak + 1 });
        }
      }

      await refetchHabits();

      const allCompleted = habits.every(h =>
        h.id === habitId ? !isCompleted : todayCompletions.includes(h.id)
      );

      if (allCompleted && !isCompleted && user) {
        const newStreak = user.currentStreak + 1;
        await supabase
          .from('users')
          .update({
            current_streak: newStreak,
            best_streak: Math.max(user.bestStreak, newStreak),
          })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Error toggling habit completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle habit completion');
      throw err;
    }
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        error,
        refetchHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        getTodayCompletions,
      }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitsProvider');
  }
  return context;
}

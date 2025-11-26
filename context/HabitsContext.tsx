import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { generatePersonalizedHabits } from '../lib/generateHabits';

interface Habit {
  id: string;
  title: string;
  user_id: string;
  completed_today: boolean;
  completed_date: string | null;
  color: string;
  order_index: number;
  created_at: string;
  is_active: boolean;
}

interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  addHabit: (habitName: string) => Promise<Habit[] | undefined>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, isCompleted: boolean) => Promise<void>;
  fetchHabits: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('HabitsContext: Loading user...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('HabitsContext: Session found, user:', session.user.id);
          const { data } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          if (data) {
            console.log('HabitsContext: User loaded from session:', data.id);
            setUserId(data.id);
          }
        } else {
          console.log('HabitsContext: No session, loading first user from database');
          const { data, error } = await supabase.from('users').select('id').limit(1).maybeSingle();
          if (error) {
            console.error('HabitsContext: Error loading user:', error);
          }
          if (data) {
            console.log('HabitsContext: User loaded from database:', data.id);
            setUserId(data.id);
          } else {
            console.warn('HabitsContext: No user found in database');
          }
        }
      } catch (error) {
        console.error('HabitsContext: Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const fetchHabits = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', userId)
        .gte('completed_at', today)
        .lt('completed_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      const completedIds = completionsData?.map(c => c.habit_id) || [];

      const enrichedHabits = (data || []).map(habit => ({
        ...habit,
        name: habit.title || habit.name || '',
        completed_today: completedIds.includes(habit.id),
      }));

      setHabits(enrichedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHabits();
    }
  }, [userId]);

  const addHabit = async (habitName: string) => {
    if (!userId) {
      console.error('addHabit: No user ID available');
      return;
    }

    try {
      console.log('addHabit: Inserting habit with userId:', userId);
      const habitData = {
        title: habitName,
        name: habitName,
        user_id: userId,
        color: '#58A6FF',
        order_index: habits.length,
        streak: 0,
        is_active: true,
        frequency: 'daily'
      };

      console.log('addHabit: Habit data:', habitData);

      const { data, error } = await supabase
        .from('habits')
        .insert([habitData])
        .select();

      if (error) {
        console.error('addHabit: Supabase error:', error);
        throw error;
      }

      console.log('addHabit: Insert successful, data:', data);
      await fetchHabits();
      return data;
    } catch (error) {
      console.error('addHabit: Error:', error instanceof Error ? error.message : error, error);
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, isCompleted: boolean) => {
    if (!userId) return;

    try {
      console.log(`Toggling habit ${habitId} to ${!isCompleted}`);

      setHabits(habits.map(h => h.id === habitId ? { ...h, completed_today: !isCompleted } : h));

      const today = new Date().toISOString().split('T')[0];

      if (isCompleted) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', userId)
          .gte('completed_at', today)
          .lt('completed_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      } else {
        await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: userId,
            completed_at: new Date().toISOString(),
          });
      }

      await fetchHabits();
    } catch (error) {
      console.error('Error toggling habit:', error instanceof Error ? error.message : error);
    }
  };

  const initializeHabitsFromOnboarding = async () => {
    if (!userId) return;

    try {
      console.log('initializeHabitsFromOnboarding: Checking existing habits for userId:', userId);

      const { data: existingHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId);

      if (existingHabits && existingHabits.length > 0) {
        console.log('initializeHabitsFromOnboarding: User already has habits, skipping initialization');
        return;
      }

      console.log('initializeHabitsFromOnboarding: No habits found, fetching user onboarding data');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_id')
        .eq('id', userId)
        .single();

      if (userError || !userData?.onboarding_id) {
        console.log('initializeHabitsFromOnboarding: No onboarding_id found, using default habits');
        const defaultHabits = [
          { title: 'Méditer 10 minutes', color: '#58A6FF' },
          { title: 'Faire 30 min de sport', color: '#FFA657' },
          { title: 'Lire 20 pages', color: '#7CE38B' },
        ];

        for (let i = 0; i < defaultHabits.length; i++) {
          await supabase.from('habits').insert({
            user_id: userId,
            title: defaultHabits[i].title,
            name: defaultHabits[i].title,
            color: defaultHabits[i].color,
            order_index: i,
            streak: 0,
            is_active: true,
            frequency: 'daily',
          });
        }
        console.log('initializeHabitsFromOnboarding: Default habits created');
      } else {
        console.log('initializeHabitsFromOnboarding: Fetching onboarding data for:', userData.onboarding_id);

        const { data: onboardingData, error: onboardingError } = await supabase
          .from('onboarding_responses')
          .select('main_goal, entrepreneurial_status, life_domains, main_motivation, main_obstacle')
          .eq('id', userData.onboarding_id)
          .single();

        if (onboardingError || !onboardingData) {
          console.error('initializeHabitsFromOnboarding: Error fetching onboarding:', onboardingError);
          return;
        }

        console.log('initializeHabitsFromOnboarding: Generating personalized habits from:', onboardingData);
        const personalizedHabits = generatePersonalizedHabits(onboardingData);
        const colors = ['#58A6FF', '#FFA657', '#7CE38B'];

        for (let i = 0; i < personalizedHabits.length; i++) {
          await supabase.from('habits').insert({
            user_id: userId,
            title: personalizedHabits[i],
            name: personalizedHabits[i],
            color: colors[i],
            order_index: i,
            streak: 0,
            is_active: true,
            frequency: 'daily',
          });
        }
        console.log('initializeHabitsFromOnboarding: Personalized habits created:', personalizedHabits);
      }

      await fetchHabits();
    } catch (error) {
      console.error('initializeHabitsFromOnboarding: Error:', error);
    }
  };

  useEffect(() => {
    if (userId && habits.length === 0 && !loading) {
      initializeHabitsFromOnboarding();
    }
  }, [userId, habits.length, loading]);

  const deleteHabit = async (habitId: string) => {
    if (!userId) {
      console.error('deleteHabit: No user ID available');
      throw new Error('No user ID available');
    }

    try {
      console.log('deleteHabit: Starting deletion for habit:', habitId, 'userId:', userId);

      const { data, error, status } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .select();

      console.log('deleteHabit: Response:', { data, error, status });

      if (error) {
        console.error('deleteHabit: Supabase error:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('deleteHabit: No rows deleted, habit may not exist');
      } else {
        console.log('deleteHabit: Successfully deleted:', data);
      }

      console.log('deleteHabit: Refreshing habits list...');
      await fetchHabits();
      console.log('deleteHabit: Complete');
    } catch (error: any) {
      console.error('deleteHabit: Error:', error?.message || error, 'Full error:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  return (
    <HabitsContext.Provider value={{ habits, loading, addHabit, deleteHabit, toggleHabitCompletion, fetchHabits }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  firstName: string;
  email?: string;
  currentStreak: number;
  bestStreak: number;
  onboardingId?: string;
  coachName?: string;
  challengeStartDate?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  createUserFromOnboarding: (onboardingId: string, firstName: string, coachName?: string) => Promise<User>;
  updateStreak: (streak: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserFromOnboarding = async (onboardingId: string, firstName: string, coachName?: string): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          first_name: firstName,
          onboarding_id: onboardingId,
          current_streak: 0,
          best_streak: 0,
          coach_name: coachName,
        })
        .select()
        .single();

      if (error) throw error;

      const newUser: User = {
        id: data.id,
        firstName: data.first_name,
        email: data.email,
        currentStreak: data.current_streak,
        bestStreak: data.best_streak,
        onboardingId: data.onboarding_id,
        coachName: data.coach_name,
        challengeStartDate: data.challenge_start_date,
      };

      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateStreak = async (streak: number) => {
    if (!user) return;

    try {
      const bestStreak = Math.max(user.bestStreak, streak);

      const { error } = await supabase
        .from('users')
        .update({
          current_streak: streak,
          best_streak: bestStreak,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        currentStreak: streak,
        bestStreak,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const loadExistingUser = async () => {
    try {
      console.log('UserContext: Loading existing user...');
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('UserContext: Session found, loading user from auth');
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          const loadedUser: User = {
            id: data.id,
            firstName: data.first_name,
            email: data.email,
            currentStreak: data.current_streak,
            bestStreak: data.best_streak,
            onboardingId: data.onboarding_id,
            coachName: data.coach_name,
          };
          console.log('UserContext: User loaded from session:', loadedUser.id);
          setUser(loadedUser);
        }
      } else {
        console.log('UserContext: No session, loading first user from database');
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('UserContext: Error loading user:', error);
        } else if (data) {
          const loadedUser: User = {
            id: data.id,
            firstName: data.first_name,
            email: data.email,
            currentStreak: data.current_streak,
            bestStreak: data.best_streak,
            onboardingId: data.onboarding_id,
            coachName: data.coach_name,
          };
          console.log('UserContext: User loaded from database:', loadedUser.id);
          setUser(loadedUser);
        } else {
          console.log('UserContext: No user found');
        }
      }
    } catch (error) {
      console.error('UserContext: Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadExistingUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, createUserFromOnboarding, updateStreak }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

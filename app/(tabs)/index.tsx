import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Trash2, Flame } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useUser } from '../../contexts/UserContext';
import { useHabits } from '../../context/HabitsContext';
import { supabase } from '../../lib/supabase';
import CircularProgressBadge from '../../components/CircularProgressBadge';
import { useStreakManager } from '../../hooks/useStreakManager';


interface Habit {
  id: string;
  title: string;
  completed_date: string | null;
  completed_today: boolean;
}

export default function HomePage() {
  const { user, loading: userLoading, setUser } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  const { completeHabit } = useStreakManager({
    userId: user?.id,
    onStreakUpdate: (newStreak) => {
      if (user) {
        setUser({
          ...user,
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
        });
      }
    },
  });

  useEffect(() => {
    if (user) {
      loadHabitsWithCompletion();
    }
  }, [user]);

  const loadHabitsWithCompletion = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setHabits(data.map(h => ({
        ...h,
        completed_today: h.completed_date === today
      })));
    }
  };

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }


  const handleAddHabit = async () => {
    if (!user || newHabitName.trim() === '') return;

    try {
      console.log('Adding habit:', newHabitName.trim());

      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: newHabitName.trim(),
          title: newHabitName.trim(),
          user_id: user.id,
          color: '#58A6FF',
          completed_today: false,
          streak: 0,
          is_active: true,
          order_index: habits.length,
          frequency: 'daily',
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding habit:', error);
        return;
      }

      console.log('Habit added successfully:', data);
      setNewHabitName('');

      await loadHabitsWithCompletion();
    } catch (error) {
      console.error('Error adding habit in HomePage:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting habit:', error);
        return;
      }

      await loadHabitsWithCompletion();
    } catch (error) {
      console.error('Error in handleDeleteHabit:', error);
    }
  };

  const handleHabitLongPress = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.completed_today) return;

    const success = await completeHabit(habitId);

    if (success) {
      await loadHabitsWithCompletion();

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('current_streak, best_streak')
          .eq('id', user.id)
          .single();

        if (userData) {
          setUser({
            ...user,
            currentStreak: userData.current_streak,
            bestStreak: userData.best_streak,
          });
        }
      }
    }
  };


  const completedHabits = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;

  const calculateChallengeDay = () => {
    if (!user?.challengeStartDate) return 1;
    const startDate = new Date(user.challengeStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const challengeDay = calculateChallengeDay();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>BONJOUR</Text>
          <Text style={styles.username}>{user?.firstName || 'Entrepreneur'}</Text>
        </View>
        <View style={styles.challengeDayContainer}>
          <Flame size={20} color={colors.orange} fill={colors.orange} strokeWidth={2} />
          <Text style={styles.challengeDayText}>JOUR {challengeDay}</Text>
        </View>
      </View>

      <CircularProgressBadge
        streakDays={user?.currentStreak || 0}
        completedHabits={completedHabits}
        totalHabits={totalHabits}
        challengeDay={challengeDay}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AJOUTER UNE HABITUDE</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nouvelle habitude..."
            placeholderTextColor={colors.text + '40'}
            value={newHabitName}
            onChangeText={setNewHabitName}
            onSubmitEditing={handleAddHabit}
          />
          <TouchableOpacity
            style={[styles.addButton, !newHabitName.trim() && styles.addButtonDisabled]}
            onPress={handleAddHabit}
            disabled={!newHabitName.trim()}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.habitsList}>
          {habits.length === 0 ? (
            <View style={styles.emptyHabitsContainer}>
              <Text style={styles.emptyState}>Aucune habitude ajoutée</Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit.id}
                title={habit.title}
                completed={habit.completed_today}
                onPress={() => handleHabitLongPress(habit.id)}
                onDelete={() => handleDeleteHabit(habit.id)}
              />
            ))
          )}
        </View>
      </View>

    </ScrollView>
  );
}

function HabitItem({ title, completed, onPress, onDelete }: { title: string; completed: boolean; onPress: () => void; onDelete: () => void }) {
  return (
    <View style={styles.habitItemContainer}>
      <TouchableOpacity
        style={[styles.habitPreview, completed && styles.habitCompleted]}
        onPress={onPress}>
        <View style={[styles.habitIndicator, { backgroundColor: completed ? colors.green : colors.blue }]} />
        <Text style={[styles.habitPreviewText, completed && styles.habitCompletedText]}>{title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={18} color={colors.text} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 16, fontSize: 16, fontFamily: fonts.interRegular, color: colors.text },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 14, fontFamily: fonts.robotoMonoRegular, color: colors.text, marginBottom: 4, opacity: 0.6, letterSpacing: 1 },
  username: { fontSize: 32, fontFamily: fonts.spaceGroteskBold, color: colors.white },
  challengeDayContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gray, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.lightGray },
  challengeDayText: { fontSize: 12, fontFamily: fonts.robotoMonoRegular, color: colors.orange, fontWeight: 'bold', letterSpacing: 1 },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.spaceGroteskBold, color: colors.white, letterSpacing: 1.5 },
  formContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: { flex: 1, backgroundColor: colors.gray, borderWidth: 1, borderColor: colors.lightGray, borderRadius: 8, padding: 16, fontSize: 15, fontFamily: fonts.interRegular, color: colors.white },
  addButton: { backgroundColor: colors.blue, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 8, justifyContent: 'center' },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { fontSize: 14, fontFamily: fonts.interMedium, color: colors.dark },
  habitsList: { gap: 8 },
  habitItemContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  habitPreview: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray, padding: 16, borderRadius: 8, gap: 12, borderWidth: 1, borderColor: colors.lightGray },
  habitCompleted: { backgroundColor: colors.gray, opacity: 0.6 },
  habitIndicator: { width: 3, height: 24, borderRadius: 2 },
  habitPreviewText: { fontSize: 15, fontFamily: fonts.interRegular, color: colors.white, flex: 1 },
  habitCompletedText: { textDecorationLine: 'line-through', opacity: 0.7 },
  deleteButton: { backgroundColor: colors.gray, width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.lightGray },
  emptyHabitsContainer: { padding: 32, alignItems: 'center' },
  emptyState: { fontSize: 14, fontFamily: fonts.interRegular, color: colors.text, opacity: 0.5 },
});

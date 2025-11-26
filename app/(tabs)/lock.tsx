import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Lock, Play, Pause, RotateCcw, Coffee, Zap, Brain, Flame, Plus, Trash2, Clock } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import CreateTimerModal from '../../components/CreateTimerModal';

const TIMER_MODES = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, icon: Flame, color: colors.orange },
  { id: 'deep', name: 'Deep Work', duration: 90 * 60, icon: Brain, color: colors.blue },
  { id: 'sprint', name: 'Sprint', duration: 15 * 60, icon: Zap, color: colors.green },
  { id: 'break', name: 'Pause', duration: 5 * 60, icon: Coffee, color: colors.text },
];

interface CustomTimer {
  id: string;
  name: string;
  work_duration: number;
  break_duration: number;
  icon: string;
  color: string;
}

export default function LockScreen() {
  const { user } = useUser();
  const [selectedMode, setSelectedMode] = useState(TIMER_MODES[0]);
  const [timeLeft, setTimeLeft] = useState(selectedMode.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadCustomTimers();
  }, [user]);

  const loadCustomTimers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCustomTimers(data);
    } catch (error) {
      console.error('Error loading custom timers:', error);
    }
  };

  const handleCreateTimer = async (timerData: Omit<CustomTimer, 'id'>) => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une minuterie');
      return;
    }

    try {
      console.log('Creating timer:', timerData);
      const { data, error } = await supabase
        .from('custom_timers')
        .insert({
          user_id: user.id,
          ...timerData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating timer:', error);
        Alert.alert('Erreur', 'Impossible de créer la minuterie');
        throw error;
      }

      if (data) {
        console.log('Timer created successfully:', data);
        setCustomTimers(prev => [data, ...prev]);
        setShowCreateModal(false);
        Alert.alert('Succès', 'Minuterie créée avec succès !');
      }
    } catch (error) {
      console.error('Error creating custom timer:', error);
    }
  };

  const handleDeleteTimer = async (timerId: string) => {
    if (!user) return;

    Alert.alert(
      'Supprimer la minuterie',
      'Êtes-vous sûr de vouloir supprimer cette minuterie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting timer:', timerId);
              const { error } = await supabase
                .from('custom_timers')
                .delete()
                .eq('id', timerId)
                .eq('user_id', user.id);

              if (error) {
                console.error('Error deleting timer:', error);
                Alert.alert('Erreur', 'Impossible de supprimer la minuterie');
                return;
              }

              console.log('Timer deleted successfully');
              setCustomTimers(prev => prev.filter(t => t.id !== timerId));

              if (selectedMode.id === timerId) {
                handleModeSelect(TIMER_MODES[0]);
              }

              Alert.alert('Succès', 'Minuterie supprimée avec succès');
            } catch (error) {
              console.error('Error deleting timer:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleModeSelect = (mode: typeof TIMER_MODES[0]) => {
    setSelectedMode(mode);
    setTimeLeft(mode.duration);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedMode.duration);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / selectedMode.duration;

  const circleRadius = 140;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Lock size={28} color={colors.blue} strokeWidth={2.5} />
          <Text style={styles.title}>MODE LOCK</Text>
        </View>
        <Text style={styles.subtitle}>Focus & Productivité</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.circularProgressContainer}>
          <Svg width={320} height={320} style={styles.circularProgress}>
            <Circle
              cx={160}
              cy={160}
              r={circleRadius}
              stroke={colors.gray}
              strokeWidth={20}
              fill="none"
            />
            <Circle
              cx={160}
              cy={160}
              r={circleRadius}
              stroke={selectedMode.color}
              strokeWidth={20}
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 160 160)`}
            />
          </Svg>

          <View style={styles.timerContent}>
            <Text style={[styles.timerText, { color: selectedMode.color }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.timerLabel}>{selectedMode.name}</Text>
          </View>
        </View>

        <View style={styles.timerControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTimer}
            disabled={timeLeft === selectedMode.duration && !isRunning}>
            <RotateCcw size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.playButton,
              { backgroundColor: selectedMode.color },
            ]}
            onPress={toggleTimer}>
            {isRunning ? (
              <Pause size={28} color={colors.dark} strokeWidth={2.5} />
            ) : (
              <Play size={28} color={colors.dark} strokeWidth={2.5} />
            )}
          </TouchableOpacity>

          <View style={[styles.controlButton, styles.placeholderButton]} />
        </View>

        {timeLeft === 0 && (
          <View style={styles.completionBanner}>
            <Text style={styles.completionText}>Session terminée !</Text>
            <Text style={styles.completionSubtext}>Excellent travail 🎉</Text>
          </View>
        )}
      </View>

      <View style={styles.modesContainer}>
        <Text style={styles.modesTitle}>Minuteries prédéfinies</Text>
        <View style={styles.modesGrid}>
          {TIMER_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode.id === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeCard,
                  isSelected && styles.modeCardActive,
                  { borderColor: isSelected ? mode.color : colors.lightGray },
                ]}
                onPress={() => handleModeSelect(mode)}
                disabled={isRunning}>
                <Icon
                  size={24}
                  color={isSelected ? mode.color : colors.text}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.modeName,
                    isSelected && { color: mode.color },
                  ]}>
                  {mode.name}
                </Text>
                <Text style={styles.modeDuration}>{formatTime(mode.duration)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {customTimers.length > 0 && (
        <View style={styles.modesContainer}>
          <Text style={styles.modesTitle}>Mes minuteries</Text>
          <View style={styles.modesGrid}>
            {customTimers.map((timer) => {
              const isSelected = selectedMode.id === timer.id;
              return (
                <View key={timer.id} style={styles.customTimerWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.modeCard,
                      isSelected && styles.modeCardActive,
                      { borderColor: isSelected ? timer.color : colors.lightGray },
                    ]}
                    onPress={() => handleModeSelect({
                      id: timer.id,
                      name: timer.name,
                      duration: timer.work_duration * 60,
                      icon: Clock,
                      color: timer.color,
                    })}
                    disabled={isRunning}>
                    <Text style={styles.timerEmoji}>
                      {timer.icon === 'Clock' && '⏰'}
                      {timer.icon === 'Flame' && '🔥'}
                      {timer.icon === 'Brain' && '🧠'}
                      {timer.icon === 'Zap' && '⚡'}
                      {timer.icon === 'Coffee' && '☕'}
                      {timer.icon === 'Book' && '📚'}
                      {timer.icon === 'Dumbbell' && '🏋️'}
                      {timer.icon === 'Laptop' && '💻'}
                    </Text>
                    <Text
                      style={[
                        styles.modeName,
                        isSelected && { color: timer.color },
                      ]}>
                      {timer.name}
                    </Text>
                    <Text style={styles.modeDuration}>{formatTime(timer.work_duration * 60)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteTimerButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteTimer(timer.id);
                    }}
                    activeOpacity={0.6}>
                    <Trash2 size={14} color={colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}>
          <Plus size={20} color={colors.dark} strokeWidth={2.5} />
          <Text style={styles.createButtonText}>Créer une minuterie</Text>
        </TouchableOpacity>
      </View>

      <CreateTimerModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTimer}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.floor(((selectedMode.duration - timeLeft) / 60))}
          </Text>
          <Text style={styles.statLabel}>Minutes écoulées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.floor((timeLeft / 60))}
          </Text>
          <Text style={styles.statLabel}>Minutes restantes</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Pourquoi le Mode Lock ?</Text>
        <Text style={styles.infoText}>
          Le Mode Lock t'aide à rester concentré en te donnant des sessions de travail structurées.
          Choisis ton mode, lance le timer, et travaille sans distraction jusqu'à la fin !
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.6,
  },
  modesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  modesTitle: {
    fontSize: 18,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 16,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.gray,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: 8,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  modeName: {
    fontSize: 14,
    fontFamily: fonts.interMedium,
    color: colors.text,
  },
  modeDuration: {
    fontSize: 12,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    opacity: 0.6,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  circularProgressContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circularProgress: {
    position: 'absolute',
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontFamily: fonts.spaceGroteskBold,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.6,
    marginTop: 8,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  resetButton: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  placeholderButton: {
    backgroundColor: 'transparent',
  },
  completionBanner: {
    marginTop: 32,
    padding: 24,
    backgroundColor: colors.green + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 20,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.green,
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 14,
    fontFamily: fonts.interRegular,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
  infoBox: {
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    backgroundColor: colors.gray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.interMedium,
    color: colors.white,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.interRegular,
    color: colors.text,
    lineHeight: 20,
    opacity: 0.8,
  },
  customTimerWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '47%',
  },
  deleteTimerButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerEmoji: {
    fontSize: 28,
  },
  createButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';

const PRESET_GOALS = [
  'Avoir un corps athlétique et musclé 💪',
  'Atteindre la liberté financière 💰',
  'Développer mon business et générer mes premiers revenus 🚀',
  'Améliorer mes relations et trouver une copine 💑',
  'Devenir plus intelligent et apprendre une nouvelle compétence 🧠',
  'Avoir la liberté géographique et temporelle 🌍',
];

export default function Step4() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(data.mainGoal) ? data.mainGoal : data.mainGoal ? [data.mainGoal] : []
  );
  const [customGoal, setCustomGoal] = useState('');

  const toggleSelection = (goal: string) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
    setCustomGoal('');
  };

  const handleContinue = () => {
    let finalGoals = [...selected];
    if (customGoal.trim()) {
      finalGoals.push(customGoal.trim());
    }
    if (finalGoals.length > 0) {
      updateData({ mainGoal: finalGoals });
      router.push('/onboarding/step5');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={4} total={13} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Quel objectif veux-tu le PLUS{'\n'}atteindre dans les{'\n'}90 prochains jours ?
        </Text>
        <Text style={styles.subtitle}>Tu peux en choisir plusieurs ou écrire les tiens.</Text>

        <View style={styles.options}>
          {PRESET_GOALS.map((goal, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.goalButton,
                selected.includes(goal) && styles.goalButtonSelected,
              ]}
              onPress={() => toggleSelection(goal)}>
              <Text style={[
                styles.goalText,
                selected.includes(goal) && styles.goalTextSelected,
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.customInput}
            placeholder="Ou écris tes objectifs personnels..."
            placeholderTextColor={colors.text + '40'}
            value={customGoal}
            onChangeText={setCustomGoal}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            selected.length === 0 && !customGoal.trim() && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selected.length === 0 && !customGoal.trim()}>
          <Text style={styles.buttonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: 24, gap: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 32, fontFamily: fonts.spaceGroteskBold, color: colors.white, marginBottom: 12, lineHeight: 40 },
  subtitle: { fontSize: 14, fontFamily: fonts.robotoMonoRegular, color: colors.text, marginBottom: 32, opacity: 0.7 },
  options: { paddingBottom: 32, gap: 12 },
  goalButton: { backgroundColor: colors.gray, borderWidth: 2, borderColor: colors.lightGray, borderRadius: 12, padding: 20 },
  goalButtonSelected: { borderColor: colors.white, backgroundColor: colors.lightGray },
  goalText: { fontSize: 15, fontFamily: fonts.interRegular, color: colors.text },
  goalTextSelected: { color: colors.white },
  customInput: { backgroundColor: colors.gray, borderWidth: 2, borderColor: colors.lightGray, borderRadius: 12, padding: 20, fontSize: 15, fontFamily: fonts.interRegular, color: colors.white, minHeight: 100, textAlignVertical: 'top' },
  footer: { padding: 24, paddingBottom: 48 },
  button: { backgroundColor: colors.white, paddingVertical: 20, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { fontSize: 16, fontFamily: fonts.spaceGroteskBold, color: colors.dark, letterSpacing: 0.5 },
});

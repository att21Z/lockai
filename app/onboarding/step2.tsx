import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Book, Rocket, TrendingUp, Compass } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';
import OptionCard from '../../components/onboarding/OptionCard';

const OPTIONS = [
  {
    id: 'student',
    title: 'Étudiant / Salarié',
    subtitle: 'Je veux développer de nouvelles compétences',
    icon: <Book size={28} color={colors.blue} strokeWidth={2.5} />,
  },
  {
    id: 'beginner',
    title: 'Entrepreneur débutant',
    subtitle: 'Je veux lancer mon premier business',
    icon: <Rocket size={28} color={colors.orange} strokeWidth={2.5} />,
  },
  {
    id: 'confirmed',
    title: 'Entrepreneur confirmé',
    subtitle: 'Je veux scaler mon business',
    icon: <TrendingUp size={28} color={colors.green} strokeWidth={2.5} />,
  },
  {
    id: 'transition',
    title: 'En transition',
    subtitle: 'Je cherche ma voie',
    icon: <Compass size={28} color={colors.text} strokeWidth={2.5} />,
  },
];

export default function Step2() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(data.entrepreneurialStatus)
      ? data.entrepreneurialStatus
      : data.entrepreneurialStatus ? [data.entrepreneurialStatus] : []
  );

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      updateData({ entrepreneurialStatus: selected });
      router.push('/onboarding/step3');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={2} total={13} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {data.firstName}, où en es-tu{'\n'}dans ton parcours ?
        </Text>
        <Text style={styles.subtitle}>Tu peux en choisir plusieurs.</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              subtitle={option.subtitle}
              selected={selected.includes(option.id)}
              onPress={() => toggleSelection(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={selected.length === 0}>
          <Text style={styles.buttonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    marginBottom: 32,
    opacity: 0.7,
  },
  options: {
    paddingBottom: 32,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});

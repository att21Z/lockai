import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';

const OPTIONS = [
  'Je suis déjà sur la bonne voie, mais je veux aller plus loin.',
  'Ça va, mais je sais que je peux faire beaucoup mieux.',
  'Je stagne et j\'ai besoin d\'un vrai déclic.',
  'Je suis frustré et insatisfait de ma situation.',
  'Je suis au plus bas et j\'ai besoin d\'un changement radical.',
];

export default function Step5() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(data.currentSituation) ? data.currentSituation : data.currentSituation ? [data.currentSituation] : []
  );

  const toggleSelection = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      updateData({ currentSituation: selected });
      router.push('/onboarding/step6');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={5} total={13} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Où en es-tu dans ta vie{'\n'}en ce moment ?</Text>
        <Text style={styles.subtitle}>Tu peux en choisir plusieurs.</Text>

        <View style={styles.options}>
          {OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, selected.includes(option) && styles.optionSelected]}
              onPress={() => toggleSelection(option)}>
              <Text style={[styles.optionText, selected.includes(option) && styles.optionTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: 24, gap: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 32, fontFamily: fonts.spaceGroteskBold, color: colors.white, marginBottom: 12, lineHeight: 40 },
  subtitle: { fontSize: 16, fontFamily: fonts.robotoMonoRegular, color: colors.text, marginBottom: 32, opacity: 0.7 },
  options: { paddingBottom: 32, gap: 12 },
  optionButton: { backgroundColor: colors.gray, borderWidth: 2, borderColor: colors.lightGray, borderRadius: 12, padding: 20 },
  optionSelected: { borderColor: colors.white, backgroundColor: colors.lightGray },
  optionText: { fontSize: 15, fontFamily: fonts.interRegular, color: colors.text },
  optionTextSelected: { color: colors.white },
  footer: { padding: 24, paddingBottom: 48 },
  button: { backgroundColor: colors.white, paddingVertical: 20, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { fontSize: 16, fontFamily: fonts.spaceGroteskBold, color: colors.dark, letterSpacing: 0.5 },
});

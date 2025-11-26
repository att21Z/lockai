import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';
import { ChevronLeft, Sparkles } from 'lucide-react-native';

export default function Step9() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [coachName, setCoachName] = useState(data.coachName || '');

  const handleNext = () => {
    if (coachName.trim()) {
      updateData({ coachName: coachName.trim() });
      router.push('/onboarding/step12');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={9} total={13} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Sparkles size={56} color={colors.blue} strokeWidth={2} />
        </View>

        <Text style={styles.title}>
          Comment veux-tu que{'\n'}ton coach IA s'appelle ?
        </Text>

        <Text style={styles.description}>
          Donne un prénom à ton coach personnel.{'\n'}Il t'accompagnera tout au long de ton défi.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Exemple : Max, Alex, Jordan..."
            placeholderTextColor={colors.text + '40'}
            value={coachName}
            onChangeText={setCoachName}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={20}
          />
        </View>

        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>💡 Suggestions populaires :</Text>
          <View style={styles.examplesRow}>
            {['Marcus', 'Alex', 'Victor', 'Jordan'].map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.exampleChip}
                onPress={() => setCoachName(name)}>
                <Text style={styles.exampleText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !coachName.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!coachName.trim()}>
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
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.text,
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: fonts.interMedium,
    color: colors.white,
  },
  exampleContainer: {
    gap: 16,
    marginBottom: 40,
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    opacity: 0.7,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleChip: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: fonts.interMedium,
    color: colors.white,
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
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});

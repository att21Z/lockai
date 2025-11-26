import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Lock } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';

const BENEFITS = [
  'Deviens ultra-concentré et discipliné.',
  'Ta productivité va exploser.',
  'Tu te sentiras plus énergique et motivé que jamais.',
  'Renforce ta confiance et ton estime de toi.',
  'Atteins tes objectifs les plus ambitieux.',
];

export default function Step13() {
  const router = useRouter();
  const { data } = useOnboarding();

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 90);
  const formattedDate = targetDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Lock size={48} color={colors.blue} strokeWidth={3} />
          <Text style={styles.logo}>LOCK AI</Text>
        </View>

        <Text style={styles.title}>
          {data.firstName}, le système{'\n'}va t'aider à devenir la{'\n'}meilleure version de{'\n'}toi-même.
        </Text>


        <View style={styles.benefits}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <CheckCircle size={24} color={colors.green} strokeWidth={2.5} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/paywall')}>
          <Text style={styles.buttonText}>Démarrer ma transformation →</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    letterSpacing: 2,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 32,
    lineHeight: 40,
  },
  benefits: {
    gap: 20,
    marginBottom: 80,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.white,
    flex: 1,
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  },
  button: {
    backgroundColor: colors.blue,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});

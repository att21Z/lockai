import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';

const POTENTIAL_SCORES = [
  { label: 'Confiance', value: 96, color: colors.white },
  { label: 'Discipline', value: 94, color: colors.white },
  { label: 'Productivité', value: 91, color: colors.white },
  { label: 'Clarté d\'esprit', value: 93, color: colors.white },
  { label: 'Énergie', value: 89, color: colors.white },
  { label: 'Focus', value: 95, color: colors.white },
];

function AnimatedBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value,
      duration: 1500,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  const width = animation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}%</Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function Step12() {
  const router = useRouter();
  const { data } = useOnboarding();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar progress={12} total={13} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{data.firstName}, voici{'\n'}ton potentiel.</Text>

        <Text style={styles.subtitle}>
          Ce que tu pourrais atteindre avec Lock AI{'\n'}en 90 jours.
        </Text>

        <View style={styles.scoresContainer}>
          {POTENTIAL_SCORES.map((score, index) => (
            <AnimatedBar
              key={score.label}
              label={score.label}
              value={score.value}
              color={score.color}
              delay={index * 200}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/step13')}>
          <Text style={styles.buttonText}>Voir mon plan de transformation</Text>
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 120,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 16,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    marginBottom: 48,
    opacity: 0.7,
    lineHeight: 24,
  },
  scoresContainer: {
    gap: 24,
    marginBottom: 60,
  },
  barContainer: {
    gap: 8,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 15,
    fontFamily: fonts.interMedium,
    color: colors.white,
  },
  barValue: {
    fontSize: 20,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
  },
  barTrack: {
    height: 12,
    backgroundColor: colors.gray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
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
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});

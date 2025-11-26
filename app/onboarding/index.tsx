import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/theme';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>LOCK AI</Text>

        <Text style={styles.tagline}>
          Disparais, et reviens{'\n'}meilleur à jamais
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Transformation de vie gamifiée</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Coach IA personnalisé</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Discipline & Focus maximal</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/step1')}>
          <Text style={styles.buttonText}>Commencer ma transformation →</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 64,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    letterSpacing: 4,
    marginBottom: 32,
    marginTop: -40,
  },
  tagline: {
    fontSize: 22,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 64,
  },
  features: {
    alignSelf: 'stretch',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  featureText: {
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.text,
  },
  footer: {
    padding: 32,
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

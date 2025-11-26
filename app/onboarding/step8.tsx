import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';
import { ChevronLeft } from 'lucide-react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

export default function Step8() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={8} total={13} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>En 90 jours, tu peux{'\n'}surmonter n'importe quel{'\n'}obstacle.</Text>

        <View style={styles.graphContainer}>
          <View style={styles.graphCard}>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Sans Lock</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.white }]} />
                <Text style={styles.legendText}>Lock AI</Text>
              </View>
            </View>

            <Svg width="100%" height="200" viewBox="0 0 300 200">
              <Path
                d="M 20 150 Q 80 145, 140 148 Q 200 150, 280 152"
                stroke="#EF4444"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Circle cx="20" cy="150" r="5" fill="#EF4444" />
              <Circle cx="280" cy="152" r="5" fill="#EF4444" />

              <Path
                d="M 20 160 Q 80 140, 140 100 Q 200 60, 280 30"
                stroke={colors.white}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <Circle cx="20" cy="160" r="5" fill={colors.white} />
              <Circle cx="280" cy="30" r="5" fill={colors.white} />

              <SvgText
                x="10"
                y="190"
                fill={colors.text}
                fontSize="12"
                fontFamily={fonts.interRegular}>
                Jour 1
              </SvgText>
              <SvgText
                x="250"
                y="190"
                fill={colors.text}
                fontSize="12"
                fontFamily={fonts.interRegular}>
                Jour 90
              </SvgText>
            </Svg>
          </View>

          <Text style={styles.reminder}>
            Les 3 premiers jours sont les plus durs. Après, tu construis un momentum inarrêtable.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/step9')}>
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
  title: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 48,
    lineHeight: 40,
  },
  graphContainer: {
    gap: 24,
    marginBottom: 60,
  },
  graphCard: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 60,
    gap: 16,
    marginBottom: 40,
    zIndex: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: fonts.interMedium,
    color: colors.text,
  },
  reminder: {
    fontSize: 14,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
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

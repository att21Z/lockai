import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { generatePersonalizedHabits } from '../../lib/generateHabits';
import Constants from 'expo-constants';

const PLANS = [
  {
    id: 'monthly',
    title: 'Mensuel',
    price: '9,99 €',
    period: '/mois',
    popular: false,
    stripePriceId: 'price_1SWhBMRwURtgVcrZJgSiGZky',
  },
  {
    id: 'yearly',
    title: 'Annuel',
    price: '2,99 €',
    period: '/mois',
    popular: true,
    badge: 'Le plus populaire',
    savings: 'Économise 70%',
    stripePriceId: 'price_1SWhCbRwURtgVcrZjmlCPi0N',
  },
];

export default function Paywall() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const { data: onboardingData } = useOnboarding();
  const { createUserFromOnboarding } = useUser();

  useEffect(() => {
    if (searchParams.success === 'true') {
      handlePaymentSuccess();
    } else if (searchParams.canceled === 'true') {
      Alert.alert('Paiement annulé', 'Vous pouvez réessayer quand vous le souhaitez.');
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const { data: onboardingResponse, error: onboardingError } = await supabase
        .from('onboarding_responses')
        .insert({
          first_name: onboardingData.firstName,
          entrepreneurial_status: onboardingData.entrepreneurialStatus,
          life_domains: onboardingData.lifeDomains,
          main_goal: onboardingData.mainGoal,
          current_situation: onboardingData.currentSituation,
          main_motivation: onboardingData.mainMotivation,
          main_obstacle: onboardingData.mainObstacle,
          coach_name: onboardingData.coachName,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (onboardingError) throw onboardingError;

      const user = await createUserFromOnboarding(onboardingResponse.id, onboardingData.firstName, onboardingData.coachName);

      const habitNames = generatePersonalizedHabits({
        main_goal: Array.isArray(onboardingData.mainGoal) ? onboardingData.mainGoal : [onboardingData.mainGoal].filter(Boolean),
        entrepreneurial_status: Array.isArray(onboardingData.entrepreneurialStatus) ? onboardingData.entrepreneurialStatus : [onboardingData.entrepreneurialStatus].filter(Boolean),
        life_domains: Array.isArray(onboardingData.lifeDomains) ? onboardingData.lifeDomains : [onboardingData.lifeDomains].filter(Boolean),
        main_motivation: Array.isArray(onboardingData.mainMotivation) ? onboardingData.mainMotivation : [onboardingData.mainMotivation].filter(Boolean),
        main_obstacle: Array.isArray(onboardingData.mainObstacle) ? onboardingData.mainObstacle : [onboardingData.mainObstacle].filter(Boolean),
      });

      const habitColors = ['#58A6FF', '#00E58F', '#9333EA'];

      const habitsToInsert = habitNames.map((name, index) => ({
        user_id: user.id,
        name,
        title: name,
        frequency: 'daily',
        is_active: true,
        color: habitColors[index],
        order_index: index,
        streak: 0,
        completed_today: false,
      }));

      const { error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToInsert);

      if (habitsError) {
        console.error('Error creating habits:', habitsError);
      } else {
        console.log('Successfully created 3 personalized habits');
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);

    try {
      const devMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

      if (devMode) {
        await handlePaymentSuccess();
        return;
      }

      const selectedPlan = PLANS.find(plan => plan.id === selected);
      if (!selectedPlan) {
        throw new Error('Plan non sélectionné');
      }

      let session = (await supabase.auth.getSession()).data.session;

      if (!session) {
        const tempEmail = `temp_${Date.now()}@lockai.tech`;
        const tempPassword = `${Math.random().toString(36).substring(2)}${Date.now()}`;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
          options: {
            data: {
              is_temp: true,
            },
          },
        });

        if (authError) {
          throw new Error(`Erreur d'authentification: ${authError.message}`);
        }

        session = authData.session;

        if (!session) {
          throw new Error('Impossible de créer une session');
        }
      }

      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
      const appUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://lockai.tech';
      const functionUrl = `${supabaseUrl}/functions/v1/stripe-checkout`;

      let checkoutWindow: Window | null = null;

      if (Platform.OS === 'web') {
        checkoutWindow = window.open('', '_blank');
        if (checkoutWindow) {
          checkoutWindow.document.write('<html><body><p>Chargement de la page de paiement...</p></body></html>');
        }
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: selectedPlan.stripePriceId,
          success_url: `${appUrl}/onboarding/paywall?success=true`,
          cancel_url: `${appUrl}/onboarding/paywall?canceled=true`,
          mode: 'subscription',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (checkoutWindow) {
          checkoutWindow.close();
        }
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      if (data.url) {
        if (Platform.OS === 'web') {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('lockai_onboarding_data', JSON.stringify(onboardingData));
            localStorage.setItem('lockai_session_token', session?.access_token || '');
          }

          if (checkoutWindow && !checkoutWindow.closed) {
            checkoutWindow.location.href = data.url;
          } else {
            window.location.href = data.url;
          }
        } else {
          const supported = await Linking.canOpenURL(data.url);
          if (supported) {
            await Linking.openURL(data.url);
          } else {
            Alert.alert('Erreur', 'Impossible d\'ouvrir le lien de paiement');
          }
        }
      } else {
        if (checkoutWindow) {
          checkoutWindow.close();
        }
        Alert.alert('Erreur', 'Aucune URL de paiement retournée');
      }

      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      Alert.alert('Erreur de paiement', errorMessage);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Lock size={56} color={colors.blue} strokeWidth={3} />
          <Text style={styles.tagline}>
            Disparais, et reviens{'\n'}meilleur à jamais
          </Text>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selected === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelected(plan.id)}>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>{plan.badge}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.checkCircle}>
                  {selected === plan.id && <Check size={20} color={colors.dark} strokeWidth={3} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.savings && (
                    <Text style={styles.savings}>{plan.savings}</Text>
                  )}
                </View>
              </View>

              <View style={styles.planPrice}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.features}>
          <FeatureItem text="Accès illimité à tous les outils" />
          <FeatureItem text="Coach IA personnalisé 24/7" />
          <FeatureItem text="Suivi de progression avancé" />
          <FeatureItem text="Sessions de focus illimitées" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.dark} />
          ) : (
            <Text style={styles.buttonText}>Continuer vers le paiement</Text>
          )}
        </TouchableOpacity>

        <View style={styles.links}>
          <Text style={styles.link}>Conditions générales</Text>
          <Text style={styles.linkDivider}>·</Text>
          <Text style={styles.link}>Politique de confidentialité</Text>
          <Text style={styles.linkDivider}>·</Text>
          <Text style={styles.link}>Restaurer</Text>
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Check size={20} color={colors.blue} strokeWidth={2.5} />
      <Text style={styles.featureText}>{text}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  tagline: {
    fontSize: 28,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 36,
  },
  plans: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
  },
  planCardSelected: {
    borderColor: colors.white,
    borderWidth: 3,
  },
  popularBadge: {
    backgroundColor: colors.blue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  popularText: {
    fontSize: 11,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.dark,
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 4,
  },
  savings: {
    fontSize: 13,
    fontFamily: fonts.interMedium,
    color: colors.white,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
  },
  period: {
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.7,
    marginLeft: 4,
  },
  features: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: fonts.interRegular,
    color: colors.text,
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
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontSize: 12,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.6,
  },
  linkDivider: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.4,
  },
});

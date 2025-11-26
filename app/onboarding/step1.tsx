import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import ProgressBar from '../../components/onboarding/ProgressBar';

export default function Step1FirstName() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.firstName);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleContinue = () => {
    if (name.trim()) {
      updateData({ firstName: name.trim() });
      setShowWelcome(true);
      setTimeout(() => {
        router.push('/onboarding/step2');
      }, 1500);
    }
  };

  if (showWelcome) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Bienvenue, {name}.
          </Text>
          <Text style={styles.welcomeSubtext}>
            Prêt à changer les règles du jeu ?
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar progress={1} total={13} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Pour commencer,{'\n'}comment t'appelles-tu ?</Text>

        <TextInput
          style={styles.input}
          placeholder="Ton prénom"
          placeholderTextColor={colors.text + '40'}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim()}>
          <Text style={styles.buttonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    marginBottom: 48,
    lineHeight: 40,
  },
  input: {
    backgroundColor: colors.gray,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    fontSize: 18,
    fontFamily: fonts.interRegular,
    color: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeText: {
    fontSize: 40,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontSize: 18,
    fontFamily: fonts.interRegular,
    color: colors.text,
    textAlign: 'center',
  },
});

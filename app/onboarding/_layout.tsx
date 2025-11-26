import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right',
          contentStyle: {
            borderWidth: 0,
          },
        }}
      />
    </OnboardingProvider>
  );
}

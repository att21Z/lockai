import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  RobotoMono_400Regular,
} from '@expo-google-fonts/roboto-mono';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '../contexts/UserContext';
import { HabitsProvider } from '../context/HabitsContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    RobotoMono_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <UserProvider>
      <HabitsProvider>
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: {
            borderWidth: 0,
          },
        }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </HabitsProvider>
    </UserProvider>
  );
}

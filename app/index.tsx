import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!hasNavigated) {
      setHasNavigated(true);
      const timer = setTimeout(() => {
        router.replace('/onboarding');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasNavigated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#58A6FF" />
    </View>
  );
}

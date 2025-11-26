import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Circle, Lock } from 'lucide-react-native';
import { colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 12,
            left: 24,
            right: 24,
            height: 65,
            backgroundColor: '#000000',
            borderRadius: 32.5,
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 25,
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 18,
            paddingBottom: 18,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <Home
                size={26}
                color={color}
                strokeWidth={2.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            tabBarIcon: ({ color }) => (
              <Circle
                size={26}
                color={color}
                strokeWidth={2.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="lock"
          options={{
            tabBarIcon: ({ color }) => (
              <Lock
                size={26}
                color={color}
                strokeWidth={2.5}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

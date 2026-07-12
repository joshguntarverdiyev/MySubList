import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrbitSection } from '@/components/welcome/OrbitSection';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Brand title */}
      <View className="absolute left-0 right-0 items-center" style={{ top: insets.top + 20 }}>
        <Text style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.8, color: '#111827' }}>
          {'My'}<Text style={{ color: '#7C4DFF' }}>SubList</Text>
        </Text>
      </View>

      {/* Orbit — all elements absolutely positioned, centred between headline and CTA */}
      <OrbitSection />

      {/* CTA anchored to bottom */}
      <View className="absolute left-6 right-6 items-center" style={{ bottom: insets.bottom + 20 }}>
        <Text className="mb-6 text-center text-base" style={{ color: '#403f3f', lineHeight: 22 }}>
          {'Track your subscriptions and\nmanage it to save your valuable money.'}
        </Text>

        <Pressable
          onPress={() => router.replace('/(onboarding)/step-1' as any)}
          className="mb-5 w-full items-center justify-center rounded-full bg-primary"
          style={{
            height: 57,
            shadowColor: '#7C4DFF',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="text-xl font-semibold tracking-tight text-white">Get Started</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/sign-in' as any)}
          className="flex-row items-center gap-1"
        >
          <Text className="text-base font-medium text-primary">I have an account</Text>
          <Text className="text-lg font-medium text-primary"> →</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingStep2() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Skip — top right */}
      <Pressable
        onPress={() => router.replace('/(auth)/sign-up' as any)}
        hitSlop={12}
        className="absolute right-6 z-10"
        style={{ top: insets.top + 18 }}
      >
        <Text style={{ color: '#7C4DFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 }}>
          Skip
        </Text>
      </Pressable>

      <View className="flex-1 items-center px-6" style={{ paddingTop: insets.top + 56 }}>

        {/* Headline — two-tone */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            letterSpacing: -0.8,
            textAlign: 'center',
            color: '#111827',
            marginBottom: 24,
          }}
        >
          {'Track renewals\non your '}
          <Text style={{ color: '#7C4DFF' }}>calendar</Text>
        </Text>

        {/* Calendar preview — PNG has card design baked in */}
        <Image
          source={require('../../../assets/onboarding-screen/calendar-container.png')}
          style={{ width: 359, aspectRatio: 0.751, borderRadius: 24, alignSelf: 'center' }}
          contentFit="contain"
        />

        <View style={{ flex: 1 }} />

        {/* Progress dots — ○ ● ○ */}
        <View className="flex-row items-center justify-center gap-3" style={{ marginBottom: 20 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#7C4DFF', opacity: 0.4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#7C4DFF' }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#7C4DFF', opacity: 0.4 }} />
        </View>

        {/* Next button */}
        <Pressable
          onPress={() => router.push('/(onboarding)/step-3' as any)}
          style={{
            width: 300,
            height: 57,
            borderRadius: 29,
            backgroundColor: '#7C4DFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: insets.bottom + 24,
            shadowColor: '#7C4DFF',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600', letterSpacing: -0.3 }}>
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

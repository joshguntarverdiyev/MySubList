import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingStep1() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Skip — top right */}
      <Pressable
        onPress={async () => {
          await SecureStore.setItemAsync('onboarding_complete', 'true');
          router.replace('/(auth)/sign-up');
        }}
        hitSlop={12}
        className="absolute right-6 z-10"
        style={{ top: insets.top + 18 }}
      >
        <Text style={{ color: '#7C4DFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 }}>
          Skip
        </Text>
      </Pressable>

      {/* Content scrolls; the button below stays pinned. On tall screens
          flexGrow + the flex-1 spacer keep the dots/button bottom-anchored
          exactly as before (no scrolling); on SE the content scrolls and the
          button remains visible. */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: insets.top + 56 }}
      >

        {/* Headline — centred, two-tone */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            letterSpacing: -0.8,
            textAlign: 'center',
            color: '#111827',
            marginBottom: 12,
          }}
        >
          {'Find the '}
          <Text style={{ color: '#7C4DFF' }}>ghost costs</Text>
        </Text>

        {/* Subtitle — centred, #444952 */}
        <Text
          style={{
            fontSize: 17,
            color: '#444952',
            textAlign: 'center',
            lineHeight: 24,
            letterSpacing: -0.8,
            maxWidth: 320,
            marginBottom: 36,
          }}
        >
          {'See where your money goes every month\nand catch forgotten subscriptions\nbefore they renew.'}
        </Text>

        {/* Dashboard preview card — PNG already has white card design baked in */}
        <Image
          source={require('../../../assets/onboarding-screen/onboarding-calendar.png')}
          style={{ width: 359, aspectRatio: 0.87, borderRadius: 24, alignSelf: 'center' }}
          contentFit="contain"
        />

        <View style={{ flex: 1 }} />

        {/* Progress dots — ● ○ ○ */}
        <View className="flex-row items-center justify-center gap-3" style={{ marginBottom: 20 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#7C4DFF' }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#7C4DFF', opacity: 0.4 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#7C4DFF', opacity: 0.4 }} />
        </View>
      </ScrollView>

      {/* Next button — pinned, always visible */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={() => router.push('/(onboarding)/step-2')}
          style={{
            width: 300,
            height: 57,
            borderRadius: 29,
            backgroundColor: '#7C4DFF',
            alignItems: 'center',
            justifyContent: 'center',
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

import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

const logo = require('../../assets/logo.png');

// Splash screen (screen 1) — branded loading screen shown on app open.
// TODO: once onboarding/auth/tabs exist, redirect from here based on session.
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <StatusBar style="light" />
      <Image
        source={logo}
        style={{ width: 150, height: 218 }}
        contentFit="contain"
      />
      <Text className="mt-8 text-3xl font-bold tracking-wide text-white">
        MySubList
      </Text>
      <Text className="mt-2 text-base font-medium text-white/[0.76]">
        Track every subscription. Save money.
      </Text>
    </View>
  );
}

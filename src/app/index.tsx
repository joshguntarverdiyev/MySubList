import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

const logo = require('../../assets/logo.png');

// Splash screen — shows for 1.5s then routes to welcome (or auth/tabs once built).
export default function Index() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/(onboarding)/welcome' as any), 1500);
    return () => clearTimeout(t);
  }, []);

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

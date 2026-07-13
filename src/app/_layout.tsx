import '../global.css';

import { Stack, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('onboarding_complete').then((value) => {
      if (value === 'true') {
        router.replace('/(auth)/sign-in' as any);
      } else {
        router.replace('/(onboarding)/welcome' as any);
      }
      setReady(true);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="subscription/add" options={{ presentation: 'modal' }} />
        </Stack>
        {!ready && (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#7C4DFF' }} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

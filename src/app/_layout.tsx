import '../global.css';

import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Show reminders as a banner even if the app is foregrounded when one fires.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

  // Tapping a renewal reminder opens the app to Home. Deep-linking straight to
  // the subscription detail is a v2 enhancement (data.subscriptionId is set).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/(tabs)' as any);
    });
    return () => sub.remove();
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

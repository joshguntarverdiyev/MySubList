import '../global.css';

import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useUserId } from '@/hooks/useUserId';
import { configureRevenueCat } from '@/lib/revenuecat';

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
  const userId = useUserId();

  // Initialize RevenueCat once we know who the user is, before any screen
  // runs a premium/entitlement check. Links purchases to the Supabase user id.
  useEffect(() => {
    if (userId) configureRevenueCat(userId);
  }, [userId]);

  // Startup routing: onboarding first, otherwise gate on the persisted Supabase
  // session so a signed-in user lands on the tabs instead of the sign-in screen.
  useEffect(() => {
    (async () => {
      const onboarded = await SecureStore.getItemAsync('onboarding_complete');
      if (onboarded !== 'true') {
        router.replace('/(onboarding)/welcome' as any);
      } else {
        const { data } = await supabase.auth.getSession();
        router.replace((data.session ? '/(tabs)' : '/(auth)/sign-in') as any);
      }
      setReady(true);
    })();
  }, []);

  // Send the user back to sign-in on sign-out / account deletion / failed token
  // refresh. (SIGNED_IN is intentionally not handled here — the auth screens and
  // deep-link handler route those, to avoid overriding e.g. password reset.)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/(auth)/sign-in' as any);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Tapping a renewal reminder opens the app to Home. Deep-linking straight to
  // the subscription detail is a v2 enhancement (data.subscriptionId is set).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/(tabs)' as any);
    });
    return () => sub.remove();
  }, []);

  // Handle Supabase auth deep links: password reset (mysublist://reset-password)
  // and email confirmation (mysublist://confirmed). Both carry the session
  // tokens in the URL hash fragment; we set the session manually (detectSessionInUrl
  // is off for native) then route to the right place.
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const isReset = url.includes('reset-password');
      const isConfirm = url.includes('confirmed');
      if (!isReset && !isConfirm) return;

      const fragment = url.split('#')[1] || url.split('?')[1] || '';
      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) return;

      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) return;
      router.replace((isReset ? '/(auth)/reset-password' : '/(tabs)') as any);
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="subscription/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="analytics" />
        </Stack>
        {!ready && (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#7C4DFF' }} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

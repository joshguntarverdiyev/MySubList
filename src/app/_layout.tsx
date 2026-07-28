import '../global.css';

import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useUserId } from '@/hooks/useUserId';
import { configureRevenueCat } from '@/lib/revenuecat';

// Keep the native splash up through JS init + the initial routing decision, so
// there's no flash between the native splash and the first screen. Hidden in the
// routing effect once we know where to send the user.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
      // If launched from a Supabase auth deep link, let /auth-callback own the
      // routing — it finishes the token exchange. Routing here on getSession()
      // would race it and dump a just-confirmed user on sign-in.
      const initialUrl = await Linking.getInitialURL();
      const isAuthLink = !!initialUrl && /reset-password|confirmed|email-changed/.test(initialUrl);

      if (!isAuthLink) {
        const onboarded = await SecureStore.getItemAsync('onboarding_complete');
        if (onboarded !== 'true') {
          router.replace('/(onboarding)/welcome');
        } else {
          const { data } = await supabase.auth.getSession();
          router.replace((data.session ? '/(tabs)' : '/(auth)/sign-in'));
        }
      }
      setReady(true);
      await SplashScreen.hideAsync().catch(() => {});
    })();
  }, []);

  // Send the user back to sign-in on sign-out / account deletion / failed token
  // refresh. (SIGNED_IN is intentionally not handled here — the auth screens and
  // /auth-callback route those, to avoid overriding e.g. password reset.)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/(auth)/sign-in');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Tapping a renewal reminder opens the app to Home. Deep-linking straight to
  // the subscription detail is a v2 enhancement (data.subscriptionId is set).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace('/(tabs)');
    });
    return () => sub.remove();
  }, []);

  // NB: Supabase auth deep links (confirm / reset / email-change) are handled by
  // src/app/+native-intent.tsx, which rewrites them to /auth-callback. That screen
  // owns the token exchange + onward routing, so there's no Unmatched Route flash.

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

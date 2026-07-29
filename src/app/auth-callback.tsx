import { useEffect, useRef } from 'react'
import { View, Text, ActivityIndicator, Alert } from 'react-native'
import { Image } from 'expo-image'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'
import { useAuthStore } from '@/store/authStore'

const logo = require('../../assets/logo.png')

/**
 * Pull access/refresh tokens out of a Supabase auth deep-link URL, tolerating an
 * extra layer of percent-encoding. Tries the raw string first (correct when it's
 * already decoded) then a further-decoded version, so normal tokens are never
 * corrupted by an unnecessary decode.
 */
function extractTokens(url: string): { access_token: string | null; refresh_token: string | null } {
  const candidates = [url]
  try {
    const once = decodeURIComponent(url)
    if (once !== url) candidates.push(once)
  } catch {
    // Malformed encoding — stick with what we have.
  }
  for (const candidate of candidates) {
    const fragment = candidate.split('#')[1] || candidate.split('?')[1] || ''
    const params = new URLSearchParams(fragment)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) return { access_token, refresh_token }
  }
  return { access_token: null, refresh_token: null }
}

// Single landing screen for all three Supabase auth deep links, reached via
// +native-intent (sign-up confirm, password reset, email change). It shows the
// branded splash while it finishes the token exchange, then owns the onward
// navigation itself — so there's no "Unmatched Route" flash and no race with the
// root startup routing (which skips when launched from an auth link).
export default function AuthCallback() {
  const { flow, u } = useLocalSearchParams<{ flow?: string; u?: string }>()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    ;(async () => {
      // `u` is the original deep-link URL; the session tokens live in its hash
      // fragment. We can't assume how many times it's been percent-encoded (Expo
      // Router decodes search params once, and Supabase sometimes double-encodes
      // the '#' as %2523), so try the value as-is then progressively decoded.
      const { access_token, refresh_token } = extractTokens(u ?? '')

      // No tokens: only the email-change "confirm the other link" state reaches
      // here (Secure email change on). Explain it, otherwise fall back to sign-in.
      if (!access_token || !refresh_token) {
        if (flow === 'email-changed') {
          router.replace('/(tabs)')
          Alert.alert(
            'Almost there',
            'Please tap the confirmation link sent to your other email address to finish changing it.',
          )
        } else {
          router.replace('/(auth)/sign-in')
        }
        return
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) {
        router.replace('/(auth)/sign-in')
        return
      }

      if (flow === 'reset') {
        router.replace('/(auth)/reset-password')
        return
      }

      // confirmed / email-changed: refresh the cached profile so the new email
      // (and name) show immediately, then enter the app.
      const uid = (await supabase.auth.getUser()).data.user?.id
      if (uid) await useProfileStore.getState().fetchProfile(uid)
      // Signal the (possibly still-mounted) email-change sheet to auto-dismiss so
      // it doesn't linger over Home after confirmation.
      if (flow === 'email-changed') useAuthStore.setState({ emailChangedAt: Date.now() })
      // Clear the whole stack so the sign-up verify-email screen (left underneath
      // by the confirm flow) can't resurface later via back/dismissAll. dismissAll
      // pops down to the root screen, then replace swaps that root for the tabs.
      if (router.canDismiss()) router.dismissAll()
      router.replace('/(tabs)')
    })()
  }, [flow, u])

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <StatusBar style="light" />
      <Image source={logo} style={{ width: 150, height: 218 }} contentFit="contain" />
      <ActivityIndicator color="#FFFFFF" style={{ marginTop: 24 }} />
      <Text className="mt-4 text-base font-medium text-white/[0.76]">Finishing up…</Text>
    </View>
  )
}

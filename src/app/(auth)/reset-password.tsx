import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Keyboard, LayoutAnimation, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthInput from '@/components/auth/AuthInput'
import PrimaryButton from '@/components/auth/PrimaryButton'

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  // null = still checking; false = arrived without a recovery session (invalid /
  // expired link). The deep-link handler in _layout sets the session from the
  // reset link before routing here, so a legitimate arrival always has one.
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // The password-entry form (vs. the loading / invalid-link / success states).
  const showForm = hasSession === true && !done

  // Track keyboard visibility + height ourselves (instead of KeyboardAvoidingView)
  // for two reasons: (1) we dock the form above the keyboard only while it's open,
  // and re-center it when it closes; (2) we listen ONLY to will/did-show & hide —
  // never keyboardWillChangeFrame — so the AutoFill bar reflowing as focus moves
  // between the two secure fields no longer nudges the layout (the "shake").
  const [kbVisible, setKbVisible] = useState(false)
  const [kbHeight, setKbHeight] = useState(0)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      setHasSession(!!data.session)
    })()
  }, [])

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvt, (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setKbHeight(e.endCoordinates.height)
      setKbVisible(true)
    })
    const hideSub = Keyboard.addListener(hideEvt, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setKbVisible(false)
    })
    return () => { showSub.remove(); hideSub.remove() }
  }, [])

  async function handleSave() {
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }

    // Guard against the session lapsing between mount and submit — never update
    // a password without an active (recovery) session.
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setHasSession(false)
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Something went wrong. Please try again.')
      return
    }

    setDone(true)
    setTimeout(() => router.replace('/(auth)/sign-in'), 1500)
  }

  // Dock the form 20px above the keyboard only while it's open; otherwise
  // (keyboard closed, or a transient loading / invalid / done state) center it.
  const docked = showForm && kbVisible

  return (
    <View style={{ flex: 1, backgroundColor: '#F0EBFF' }}>
      <View
        style={{
          flex: 1,
          justifyContent: docked ? 'flex-end' : 'center',
          paddingBottom: docked ? kbHeight + 20 : insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        {hasSession === null ? (
          <ActivityIndicator color="#7C4DFF" />
        ) : hasSession === false ? (
          <View className="items-center gap-y-4">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="text-[28px] font-bold text-[#1A1A2E] text-center">
              Link invalid or expired
            </Text>
            <Text className="text-base text-[#6B7280] text-center">
              Request a new password reset link and try again.
            </Text>
            <PrimaryButton
              label="Back to Sign In"
              onPress={() => router.replace('/(auth)/sign-in')}
              className="mt-2 w-full"
            />
          </View>
        ) : done ? (
          <View className="items-center gap-y-4">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text className="text-[28px] font-bold text-[#1A1A2E] text-center">
              Password updated!
            </Text>
          </View>
        ) : (
          <View className="gap-y-8">
            <View>
              <Text className="text-[34px] font-bold text-[#1A1A2E] tracking-tight">
                Reset Password
              </Text>
              <Text className="text-base text-[#6B7280] mt-1">
                Enter your new password
              </Text>
            </View>

            <View className="gap-y-5">
              <AuthInput
                label="New Password"
                icon="lock-closed-outline"
                placeholder="New password"
                value={password}
                onChangeText={(t) => { setPassword(t); setError('') }}
                secureTextEntry
                autoCapitalize="none"
                autoFocus
              />
              <AuthInput
                label="Confirm Password"
                icon="lock-closed-outline"
                placeholder="Confirm new password"
                value={confirm}
                onChangeText={(t) => { setConfirm(t); setError('') }}
                secureTextEntry
                autoCapitalize="none"
                error={error}
              />
            </View>

            <PrimaryButton label="Save New Password" onPress={handleSave} loading={loading} disabled={loading} />
          </View>
        )}
      </View>
    </View>
  )
}

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
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

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      setHasSession(!!data.session)
    })()
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F0EBFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingBottom: insets.bottom + 32,
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
    </KeyboardAvoidingView>
  )
}

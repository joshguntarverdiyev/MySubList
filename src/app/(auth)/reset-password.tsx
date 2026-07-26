import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSave() {
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
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
        {done ? (
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
              <View>
                <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">New Password</Text>
                <View
                  className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                    error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#7C4DFF" />
                  <TextInput
                    className="flex-1 ml-3 h-full text-sm text-[#1A1A2E]"
                    placeholder="New password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError('') }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Confirm Password</Text>
                <View
                  className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                    error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#7C4DFF" />
                  <TextInput
                    className="flex-1 ml-3 h-full text-sm text-[#1A1A2E]"
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    value={confirm}
                    onChangeText={(t) => { setConfirm(t); setError('') }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {error ? (
                <Text className="text-xs text-[#EF4444] -mt-2">{error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              className="h-14 rounded-full bg-[#7C4DFF] items-center justify-center"
              style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-semibold tracking-tight">
                  Save New Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

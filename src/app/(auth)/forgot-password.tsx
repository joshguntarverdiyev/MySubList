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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    setError('')
    if (!EMAIL_REGEX.test(email)) {
      setError('Enter a valid email address')
      return
    }

    setLoading(true)
    // Always surface the success UI regardless of the result so we never reveal
    // whether an account exists for this email (security best practice).
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'mysublist://reset-password',
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F0EBFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        {/* Back arrow */}
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center">
          <Ionicons name="arrow-back" size={26} color="#1A1A2E" />
        </TouchableOpacity>

        {sent ? (
          <View className="flex-1 justify-center items-center gap-y-4">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text className="text-[28px] font-bold text-[#1A1A2E] text-center">
              Check your inbox
            </Text>
            <Text className="text-base text-[#6B7280] text-center">
              We sent a reset link to {email.trim()}
            </Text>
            <TouchableOpacity
              className="h-14 w-full rounded-full bg-[#7C4DFF] items-center justify-center mt-4"
              onPress={() => router.replace('/(auth)/sign-in')}
              activeOpacity={0.85}
            >
              <Text className="text-white text-lg font-semibold tracking-tight">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 justify-center gap-y-8">
            <View>
              <Text className="text-[34px] font-bold text-[#1A1A2E] tracking-tight">
                Forgot Password
              </Text>
              <Text className="text-base text-[#6B7280] mt-1">
                Enter your email and we'll send you a reset link
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Email</Text>
              <View
                className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                  error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
                }`}
              >
                <Ionicons name="mail-outline" size={18} color="#7C4DFF" />
                <TextInput
                  className="flex-1 ml-3 text-sm text-[#1A1A2E]"
                  placeholder="Your email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError('') }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error ? (
                <Text className="text-xs text-[#EF4444] mt-1">{error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              className="h-14 rounded-full bg-[#7C4DFF] items-center justify-center"
              style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-semibold tracking-tight">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} className="items-center">
              <Text className="text-sm font-bold text-[#7C4DFF]">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

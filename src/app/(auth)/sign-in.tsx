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
import { Image } from 'expo-image'
import { router, Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import ForgotPasswordSheet from '@/components/auth/ForgotPasswordSheet'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignIn() {
    setApiError('')
    if (!validate()) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (error) {
      // Supabase returns this when the account exists but the email is unconfirmed.
      if (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) {
        setApiError('Please verify your email first. Check your inbox for our verification link.')
        return
      }
      setApiError('Invalid email or password. Please try again.')
      return
    }

    router.replace('/(tabs)' as any)
  }

  function handleForgotPassword() {
    setForgotOpen(true)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F0EBFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        {/* Top + Middle grouped together — centered in remaining space */}
        <View style={{ flex: 1, justifyContent: 'center' }} className="gap-y-8">
          {/* Logo + heading */}
          <View>
            <View className="flex-row items-center justify-center gap-x-2 mb-8">
              <Image
                source={require('../../../assets/icon.png')}
                style={{ width: 40, height: 40, borderRadius: 10 }}
                contentFit="cover"
              />
              <Text className="text-[26px] font-bold tracking-tight text-[#1A1A2E]">
                My<Text className="text-[#7C4DFF]">SubList</Text>
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-[34px] font-bold text-[#1A1A2E] tracking-tight text-center">
                Welcome Back
              </Text>
              <Text className="text-base text-[#6B7280] mt-1 text-center">
                Sign in to continue tracking your subscriptions
              </Text>
            </View>
          </View>

          {/* Form fields */}
          <View className="gap-y-5">
          {/* API error banner */}
          {apiError ? (
            <View className="bg-[#FEE2E2] rounded-xl px-4 py-3">
              <Text className="text-[#EF4444] text-sm text-center">{apiError}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View>
            <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Email</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                fieldErrors.email ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
              }`}
            >
              <Ionicons name="mail-outline" size={18} color="#7C4DFF" />
              <TextInput
                className="flex-1 ml-3 text-sm text-[#1A1A2E]"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(t) => { setEmail(t); setFieldErrors(p => ({ ...p, email: undefined })) }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.email ? (
              <Text className="text-xs text-[#EF4444] mt-1">{fieldErrors.email}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Password</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                fieldErrors.password ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
              }`}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#7C4DFF" />
              <TextInput
                className="flex-1 ml-3 text-sm text-[#1A1A2E]"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(t) => { setPassword(t); setFieldErrors(p => ({ ...p, password: undefined })) }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {fieldErrors.password ? (
              <Text className="text-xs text-[#EF4444] mt-1">{fieldErrors.password}</Text>
            ) : null}
          </View>

          {/* Forgot password */}
          <TouchableOpacity onPress={handleForgotPassword} className="self-end -mt-2">
            <Text className="text-sm font-bold text-[#7C4DFF]">Forgot password?</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Bottom: button + links */}
        <View className="gap-y-4">
          <TouchableOpacity
            className="h-14 rounded-full bg-[#7C4DFF] items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-semibold tracking-tight">
                Sign in
              </Text>
            )}
          </TouchableOpacity>

          <View className="h-px bg-[#E5E7EB] mx-4" />

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-[#6B7280]">Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-[#7C4DFF]">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      <ForgotPasswordSheet visible={forgotOpen} onClose={() => setForgotOpen(false)} />
    </KeyboardAvoidingView>
  )
}

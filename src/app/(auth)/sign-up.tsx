import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, Link } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'

const TERMS_URL = 'https://mysublist.app/terms'
const PRIVACY_URL = 'https://mysublist.app/privacy'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!fullName.trim()) errors.fullName = 'Full name is required'
    if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignUp() {
    setApiError('')
    if (!validate()) return

    setLoading(true)
    const trimmedEmail = email.trim()
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: 'mysublist://confirmed',
      },
    })
    setLoading(false)

    if (error) {
      setApiError(error.message)
      return
    }

    // With "Confirm email" on, signUp returns no session until the user taps the
    // link — send them to the verify screen. If confirmation is off, a session
    // is present and we go straight into the app.
    if (data.session) {
      router.replace('/(tabs)' as any)
    } else {
      router.replace({ pathname: '/(auth)/verify-email', params: { email: trimmedEmail } } as any)
    }
  }

  return (
      <ScrollView
        className="flex-1 bg-[#F0EBFF]"
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
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

        {/* Heading */}
        <View className="items-center mb-8 px-6">
          <Text className="text-[34px] font-bold text-[#1A1A2E] tracking-tight text-center">
            Create Account
          </Text>
          <Text className="text-base text-[#6B7280] mt-1 text-center">
            Start tracking your subscriptions
          </Text>
        </View>

        {/* API error banner */}
        {apiError ? (
          <View className="mx-6 mb-4 bg-[#FEE2E2] rounded-xl px-4 py-3">
            <Text className="text-[#EF4444] text-sm text-center">{apiError}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="px-6 gap-y-5">
          {/* Full Name */}
          <View>
            <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Full Name</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                fieldErrors.fullName ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
              }`}
            >
              <Ionicons name="person-outline" size={18} color="#7C4DFF" />
              <TextInput
                className="flex-1 ml-3 h-full text-[14px] text-[#1A1A2E]"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={(t) => { setFullName(t); setFieldErrors(p => ({ ...p, fullName: undefined })) }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.fullName ? (
              <Text className="text-xs text-[#EF4444] mt-1">{fieldErrors.fullName}</Text>
            ) : null}
          </View>

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
                className="flex-1 ml-3 h-full text-[14px] text-[#1A1A2E]"
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
                className="flex-1 ml-3 h-full text-[14px] text-[#1A1A2E]"
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

          {/* Confirm Password */}
          <View>
            <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">Confirm Password</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
                fieldErrors.confirmPassword ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
              }`}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#7C4DFF" />
              <TextInput
                className="flex-1 ml-3 h-full text-[14px] text-[#1A1A2E]"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setFieldErrors(p => ({ ...p, confirmPassword: undefined })) }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {fieldErrors.confirmPassword ? (
              <Text className="text-xs text-[#EF4444] mt-1">{fieldErrors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Terms acceptance */}
          <View className="flex-row items-center mt-1">
            <TouchableOpacity
              onPress={() => setAgreed((v) => !v)}
              hitSlop={8}
              activeOpacity={0.7}
            >
              {agreed
                ? <Ionicons name="checkbox" size={22} color="#7C4DFF" />
                : <Ionicons name="square-outline" size={22} color="#6B7280" />
              }
            </TouchableOpacity>
            <Text className="flex-1 ml-2.5 text-xs leading-5 text-[#1A1A2E]">
              I agree to the{' '}
              <Text
                className="text-[#7C4DFF] underline"
                onPress={() => Linking.openURL(TERMS_URL)}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text
                className="text-[#7C4DFF] underline"
                onPress={() => Linking.openURL(PRIVACY_URL)}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            className="h-14 rounded-full bg-[#7C4DFF] items-center justify-center mt-2"
            style={{
              opacity: agreed ? 1 : 0.5,
              shadowColor: '#7C4DFF',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.22,
              shadowRadius: 24,
              elevation: 8,
            }}
            onPress={handleSignUp}
            disabled={loading || !agreed}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-semibold tracking-tight">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign in link */}
          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-sm text-[#6B7280]">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-[#7C4DFF]">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
  )
}

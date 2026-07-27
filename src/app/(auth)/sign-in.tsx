import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import PasswordResetSheet from '@/components/auth/PasswordResetSheet'
import AuthInput from '@/components/auth/AuthInput'
import PrimaryButton from '@/components/auth/PrimaryButton'
import { useSignInForm } from '@/hooks/useSignInForm'

export default function SignInScreen() {
  const insets = useSafeAreaInsets()
  const f = useSignInForm()
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F0EBFF' }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-y-8">
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
          {f.apiError ? (
            <View className="bg-[#FEE2E2] rounded-xl px-4 py-3">
              <Text className="text-[#EF4444] text-sm text-center">{f.apiError}</Text>
            </View>
          ) : null}

          <AuthInput
            label="Email"
            icon="mail-outline"
            placeholder="Enter your email"
            value={f.email}
            onChangeText={(t) => { f.setEmail(t); f.clearError('email') }}
            error={f.fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthInput
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            value={f.password}
            onChangeText={(t) => { f.setPassword(t); f.clearError('password') }}
            error={f.fieldErrors.password}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Forgot password */}
          <TouchableOpacity onPress={() => setForgotOpen(true)} className="self-end -mt-2">
            <Text className="text-sm font-bold text-[#7C4DFF]">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Button + links */}
        <View className="gap-y-4">
          <PrimaryButton label="Sign in" onPress={f.handleSignIn} loading={f.loading} disabled={f.loading} />

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

      <PasswordResetSheet visible={forgotOpen} onClose={() => setForgotOpen(false)} title="Forgot Password" />
    </ScrollView>
  )
}

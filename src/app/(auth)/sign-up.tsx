import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useSignUpForm } from '@/hooks/useSignUpForm'
import AuthInput from '@/components/auth/AuthInput'
import TermsCheckbox from '@/components/auth/TermsCheckbox'
import PrimaryButton from '@/components/auth/PrimaryButton'

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const f = useSignUpForm()

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
      {f.apiError ? (
        <View className="mx-6 mb-4 bg-[#FEE2E2] rounded-xl px-4 py-3">
          <Text className="text-[#EF4444] text-sm text-center">{f.apiError}</Text>
        </View>
      ) : null}

      {/* Form */}
      <View className="px-6 gap-y-5">
        <AuthInput
          label="Full Name"
          icon="person-outline"
          placeholder="Enter your full name"
          value={f.fullName}
          onChangeText={(t) => { f.setFullName(t); f.clearError('fullName') }}
          error={f.fieldErrors.fullName}
          autoCapitalize="words"
          autoCorrect={false}
        />

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

        <AuthInput
          label="Confirm Password"
          icon="lock-closed-outline"
          placeholder="Confirm your password"
          value={f.confirmPassword}
          onChangeText={(t) => { f.setConfirmPassword(t); f.clearError('confirmPassword') }}
          error={f.fieldErrors.confirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TermsCheckbox agreed={f.agreed} onToggle={() => f.setAgreed(!f.agreed)} />

        <PrimaryButton
          label="Create Account"
          onPress={f.handleSignUp}
          loading={f.loading}
          disabled={f.loading || !f.agreed}
          dimmed={!f.agreed}
          className="mt-2"
        />

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

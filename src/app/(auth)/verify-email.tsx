import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets()
  const { email } = useLocalSearchParams<{ email?: string }>()

  const [resending, setResending] = useState(false)
  const [notice, setNotice] = useState('')

  // iOS opens Apple Mail via the message:// scheme. If no mail app handles it,
  // fall back to mailto: which triggers the system mail chooser.
  async function handleOpenEmail() {
    try {
      const supported = await Linking.canOpenURL('message://')
      await Linking.openURL(supported ? 'message://' : 'mailto:')
    } catch {
      // No mail app available — nothing more we can do.
    }
  }

  async function handleResend() {
    if (!email) return
    setNotice('')
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: 'mysublist://confirmed' },
    })
    setResending(false)
    // Never reveal whether the address exists — always confirm we've resent.
    setNotice(error ? 'Please wait a moment before resending.' : 'Confirmation email sent again.')
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F0EBFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 24,
      }}
    >
      <View className="w-full items-center gap-y-4">
        <Ionicons name="mail-unread-outline" size={48} color="#7C4DFF" />
        <Text className="text-[28px] font-bold text-[#1A1A2E] text-center">
          Check your email!
        </Text>
        <Text className="text-base text-[#6B7280] text-center">
          We sent a verification link to{' '}
          <Text className="font-semibold text-[#1A1A2E]">{email ?? 'your inbox'}</Text>. Click the
          link to activate your account.
        </Text>

        {notice ? (
          <Text className="text-sm text-[#10B981] text-center">{notice}</Text>
        ) : null}

        <TouchableOpacity
          className="h-14 w-full rounded-full bg-[#7C4DFF] items-center justify-center mt-4"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8 }}
          onPress={handleOpenEmail}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-semibold">Open Email App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="h-14 w-full rounded-full bg-white border border-[#7C4DFF] items-center justify-center"
          onPress={() => router.replace('/(auth)/sign-in')}
          activeOpacity={0.85}
        >
          <Text className="text-[#7C4DFF] text-base font-semibold">Back to Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending} className="mt-1 h-6 justify-center">
          {resending ? (
            <ActivityIndicator color="#7C4DFF" />
          ) : (
            <Text className="text-sm font-bold text-[#7C4DFF]">Resend email</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

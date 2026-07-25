import { useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  /** When set, the email is fixed/read-only (Change Password from Account). */
  email?: string
}

export default function PasswordResetSheet({ visible, onClose, title, email: fixedEmail }: Props) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const close = () => { setEmail(''); setError(''); setSent(false); onClose() }

  async function handleSend() {
    setError('')
    if (!fixedEmail && !EMAIL_REGEX.test(email)) {
      setError('Enter a valid email address')
      return
    }
    const target = (fixedEmail ?? email).trim()
    setLoading(true)
    // Always surface success regardless of the result so we never reveal whether
    // an account exists for this email (security best practice).
    await supabase.auth.resetPasswordForEmail(target, { redirectTo: 'mysublist://reset-password' })
    setLoading(false)
    setSent(true)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />
        <View className="rounded-t-3xl bg-white px-6 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-1 items-center"><View className="h-1 w-10 rounded-full bg-[#E5E0F5]" /></View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[20px] font-bold text-[#111827]">{title}</Text>
            <TouchableOpacity
              onPress={close}
              className="h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
              style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
            >
              <Ionicons name="close" size={22} color="#7C4DFF" />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View className="items-center pb-2 pt-1">
              <Ionicons name="checkmark-circle" size={44} color="#10B981" />
              <Text className="mt-3 text-center text-[17px] font-bold text-[#111827]">Check your inbox</Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-[#6B7280]">
                We sent a password reset link to {(fixedEmail ?? email).trim()}.
              </Text>
              <Pressable onPress={close} className="mt-5 h-12 w-full items-center justify-center rounded-xl bg-[#7C4DFF]">
                <Text className="text-[15px] font-semibold text-white">Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="mb-3 text-[14px] leading-5 text-[#6B7280]">
                {fixedEmail
                  ? "We'll email a password reset link to your account email."
                  : "Enter your email and we'll send you a reset link."}
              </Text>
              {fixedEmail ? (
                <View className="h-[54px] justify-center rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-4">
                  <Text className="text-[15px] text-[#9CA3AF]">{fixedEmail}</Text>
                </View>
              ) : (
                <View className={`h-[54px] flex-row items-center rounded-xl border bg-white px-4 ${error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'}`}>
                  <Ionicons name="mail-outline" size={18} color="#7C4DFF" />
                  <TextInput
                    className="ml-3 flex-1 text-sm text-[#1A1A2E]"
                    placeholder="Your email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError('') }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
              {error ? <Text className="mt-1 text-xs text-[#EF4444]">{error}</Text> : null}
              <TouchableOpacity
                onPress={handleSend}
                disabled={loading}
                activeOpacity={0.85}
                className="mt-5 h-14 items-center justify-center rounded-xl bg-[#7C4DFF]"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-[16px] font-semibold text-white">Send Reset Link</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

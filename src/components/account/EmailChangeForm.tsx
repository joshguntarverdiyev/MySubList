import { useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  visible: boolean
  currentEmail: string
  onClose: () => void
}

export default function EmailChangeForm({ visible, currentEmail, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)

  const close = () => { setEmail(''); setError(''); setSentTo(null); onClose() }

  async function handleSubmit() {
    setError('')
    const next = email.trim()
    if (!EMAIL_REGEX.test(next)) { setError('Please enter a valid email address'); return }
    setLoading(true)
    // Supabase sends a verification link to the NEW address; the change only
    // takes effect once the user taps it.
    const { error: err } = await supabase.auth.updateUser({ email: next })
    setLoading(false)
    if (err) {
      const m = err.message.toLowerCase()
      setError(m.includes('already') || m.includes('registered') || m.includes('in use')
        ? 'This email is already in use'
        : 'Something went wrong. Please try again.')
      return
    }
    setSentTo(next)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />
        <View className="rounded-t-3xl bg-white px-6 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-3 items-center"><View className="h-1 w-10 rounded-full bg-[#E5E0F5]" /></View>

          {sentTo ? (
            <View className="items-center py-3">
              <Ionicons name="mail-unread-outline" size={40} color="#7C4DFF" />
              <Text className="mt-3 text-center text-[17px] font-bold text-[#111827]">Verify your new email</Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-[#6B7280]">
                Verification email sent to {sentTo}. Please check your inbox and tap the link to confirm your new email address.
              </Text>
              <Pressable onPress={close} className="mt-5 h-12 w-full items-center justify-center rounded-xl bg-[#7C4DFF]">
                <Text className="text-[15px] font-semibold text-white">Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-[18px] font-bold text-[#111827]">Change Email</Text>
              <Text className="mb-1 mt-4 text-[13px] font-semibold text-[#6B7280]">Current email</Text>
              <View className="h-[52px] justify-center rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-4">
                <Text className="text-[15px] text-[#9CA3AF]">{currentEmail}</Text>
              </View>
              <Text className="mb-1 mt-4 text-[13px] font-semibold text-[#6B7280]">New email</Text>
              <View className={`h-[52px] flex-row items-center rounded-xl border bg-white px-4 ${error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'}`}>
                <Ionicons name="mail-outline" size={18} color="#7C4DFF" />
                <TextInput
                  className="ml-3 flex-1 h-full text-[15px] text-[#1A1A2E]"
                  placeholder="Enter new email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError('') }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error ? <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text> : null}
              <Pressable onPress={handleSubmit} disabled={loading} className="mt-5 h-14 items-center justify-center rounded-xl bg-[#7C4DFF]" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-[16px] font-semibold text-white">Update Email</Text>}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

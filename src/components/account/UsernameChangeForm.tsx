import { useState, useEffect } from 'react'
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'

interface Props {
  visible: boolean
  currentName: string
  onClose: () => void
}

export default function UsernameChangeForm({ visible, currentName, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Re-seed the input each time the sheet opens.
  useEffect(() => { if (visible) { setName(currentName); setError('') } }, [visible, currentName])

  async function handleSubmit() {
    setError('')
    const next = name.trim()
    if (!next) { setError('Please enter your name'); return }
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    const { error: err } = userId
      ? await supabase.from('profiles').update({ full_name: next }).eq('id', userId)
      : { error: new Error('no-user') }
    setLoading(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    useProfileStore.getState().setFullName(next)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View className="rounded-t-3xl bg-white px-6 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-3 items-center"><View className="h-1 w-10 rounded-full bg-[#E5E0F5]" /></View>
          <Text className="text-[18px] font-bold text-[#111827]">Change Username</Text>
          <Text className="mb-1 mt-4 text-[13px] font-semibold text-[#6B7280]">Username</Text>
          <View className={`h-[52px] flex-row items-center rounded-xl border bg-white px-4 ${error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'}`}>
            <Ionicons name="person-outline" size={18} color="#7C4DFF" />
            <TextInput
              className="ml-3 flex-1 h-full text-[15px] text-[#1A1A2E]"
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(t) => { setName(t); setError('') }}
              autoCapitalize="words"
              maxLength={60}
            />
          </View>
          {error ? <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text> : null}
          <Pressable onPress={handleSubmit} disabled={loading} className="mt-5 h-14 items-center justify-center rounded-xl bg-[#7C4DFF]" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-[16px] font-semibold text-white">Update Username</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

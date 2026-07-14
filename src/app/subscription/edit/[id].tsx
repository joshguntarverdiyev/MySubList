import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useSubscription } from '@/hooks/useSubscription'
import { useSubscriptionForm } from '@/hooks/useSubscriptionForm'
import SubscriptionFormFields from '@/components/subscription/SubscriptionFormFields'

export default function EditSubscription() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { subscription: sub, loading, notFound } = useSubscription(id)

  if (loading) {
    return (
      <View className="flex-1 bg-[#F0EBFF] items-center justify-center">
        <ActivityIndicator color="#7C4DFF" />
      </View>
    )
  }

  if (notFound || !sub) {
    return (
      <View className="flex-1 bg-[#F0EBFF] items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] text-[#6B7280] text-center mb-4">
          This subscription could not be found.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#7C4DFF] rounded-full px-6 py-3">
          <Text className="text-white font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return <EditForm sub={sub} insets={insets} />
}

function EditForm({ sub, insets }: { sub: NonNullable<ReturnType<typeof useSubscription>['subscription']>; insets: { top: number; bottom: number } }) {
  const f = useSubscriptionForm({ subscription: sub })

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#F0EBFF]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-[18px] bg-white border border-[#EFE9FF] items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
          >
            <Ionicons name="arrow-back" size={22} color="#7C4DFF" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[24px] font-bold text-[#111827] mr-11">Edit Subscription</Text>
        </View>

        <SubscriptionFormFields f={f} />
      </ScrollView>

      {/* Submit */}
      <View className="absolute left-0 right-0 bottom-0 px-6 bg-[#F0EBFF]" style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={f.submit}
          disabled={f.loading}
          activeOpacity={0.9}
          className="h-14 rounded-[28px] bg-[#7C4DFF] flex-row items-center justify-center"
          style={{ opacity: f.loading ? 0.7 : 1, shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 }}
        >
          {f.loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text className="text-white text-[18px] font-semibold ml-1">Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  hasTrial: boolean
  trialDays: number
  purchasing: boolean
  onSubscribe: () => void
  onRestore: () => void
}

/** Trial badge + subscribe CTA + restore link + billing fine print. */
export default function PaywallActions({ hasTrial, trialDays, purchasing, onSubscribe, onRestore }: Props) {
  return (
    <>
      {hasTrial ? (
        <View className="mt-4 items-center">
          <View className="flex-row items-center gap-x-1.5">
            <Ionicons name="gift-outline" size={16} color="#6C47D9" />
            <Text className="text-[14px] font-bold text-[#6C47D9]">
              Start your {trialDays}-day free trial
            </Text>
          </View>
          <Text className="mt-0.5 text-[12px] text-[#6B7280]">Cancel anytime</Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onSubscribe}
        disabled={purchasing}
        activeOpacity={0.85}
        className="mx-5 mt-5 h-14 items-center justify-center rounded-xl bg-[#6C47D9]"
        style={{ opacity: purchasing ? 0.6 : 1 }}
      >
        {purchasing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-[16px] font-bold text-white">
            {hasTrial ? 'Start Free Trial' : 'Subscribe'}
          </Text>
        )}
      </TouchableOpacity>

      <Text onPress={onRestore} className="mt-4 text-center text-[14px] text-[#6B7280]">
        Restore Purchases
      </Text>
      <Text className="mx-8 mt-3 text-center text-[11px] text-[#9CA3AF]">
        Recurring billing. Cancel anytime in App Store settings. Payment charged to your Apple ID.
      </Text>
    </>
  )
}

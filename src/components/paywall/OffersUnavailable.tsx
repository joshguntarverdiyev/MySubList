import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { INFO } from '@/constants/legal'

interface Props {
  onRetry: () => void
  onRestore: () => void
}

/**
 * Shown when RevenueCat offerings fail to load. We deliberately render a retry
 * state instead of any hardcoded prices, so a non-EUR storefront never sees
 * euro amounts (and we never advertise a price the store can't honor).
 */
export default function OffersUnavailable({ onRetry, onRestore }: Props) {
  return (
    <View className="mx-5 mt-8 items-center">
      <Text className="text-center text-[14px] text-[#6B7280]">
        We couldn&apos;t load subscription plans. Check your connection and try again.
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        className="mt-4 h-12 items-center justify-center rounded-xl bg-[#7C4DFF] px-8"
      >
        <Text className="text-[15px] font-bold text-white">Retry</Text>
      </TouchableOpacity>
      <Text onPress={onRestore} className="mt-4 text-[14px] text-[#6B7280]">
        Restore Purchases
      </Text>

      {/* Terms + Privacy stay reachable even when offerings fail (App Store 3.1.2). */}
      <View className="mt-4 flex-row items-center justify-center">
        <Text
          onPress={() => INFO.terms.fullUrl && Linking.openURL(INFO.terms.fullUrl)}
          className="px-2 text-[11px] font-semibold text-[#7C4DFF]"
        >
          Terms of Use
        </Text>
        <Text className="text-[11px] text-[#9CA3AF]">·</Text>
        <Text
          onPress={() => INFO.privacy.fullUrl && Linking.openURL(INFO.privacy.fullUrl)}
          className="px-2 text-[11px] font-semibold text-[#7C4DFF]"
        >
          Privacy Policy
        </Text>
      </View>
    </View>
  )
}

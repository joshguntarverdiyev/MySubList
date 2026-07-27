import { View, Text, TouchableOpacity } from 'react-native'

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
        className="mt-4 h-12 items-center justify-center rounded-xl bg-[#6C47D9] px-8"
      >
        <Text className="text-[15px] font-bold text-white">Retry</Text>
      </TouchableOpacity>
      <Text onPress={onRestore} className="mt-4 text-[14px] text-[#6B7280]">
        Restore Purchases
      </Text>
    </View>
  )
}

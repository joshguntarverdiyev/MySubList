import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-10 py-20">
      <View className="w-16 h-16 rounded-full bg-[#FEE2E2] items-center justify-center mb-5">
        <Ionicons name="cloud-offline-outline" size={30} color="#EF4444" />
      </View>
      <Text className="text-[18px] font-bold text-[#1A1A2E] text-center mb-1">
        Something went wrong
      </Text>
      <Text className="text-[15px] text-[#6B7280] text-center mb-6">
        We couldn&apos;t load your subscriptions.
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.9}
        className="h-12 px-6 rounded-full bg-[#7C4DFF] flex-row items-center justify-center"
      >
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text className="text-white text-[15px] font-semibold ml-1">Try again</Text>
      </TouchableOpacity>
    </View>
  )
}

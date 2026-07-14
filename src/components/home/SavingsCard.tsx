import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'

interface SavingsCardProps {
  amount: string
  opportunities: number
  onPress?: () => void
}

export default function SavingsCard({ amount, opportunities, onPress }: SavingsCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mx-6 rounded-[24px] border border-[#E6D9FF] overflow-hidden"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 5 }}
    >
      <View className="bg-white px-6 pt-5 pb-3 flex-row items-center">
        {/* Text side */}
        <View className="flex-1 pr-2">
          <Text className="text-[18px] font-bold text-[#7C4DFF] mb-1">Potential Savings</Text>
          <View className="flex-row items-baseline gap-x-1 mb-1">
            <Text className="text-[18px] font-bold text-[#1A1A2E]">Save {amount}</Text>
            <Text className="text-xs text-[#667085]">/ month</Text>
          </View>
          <Text className="text-xs text-[#6B7280] mb-3">
            Based on {opportunities} {opportunities === 1 ? 'opportunity' : 'opportunities'}
          </Text>
          <Text className="text-[10px] text-[#9CA3AF]">Tap to see more</Text>
        </View>

        {/* Pig image */}
        <Image
          source={require('../../../assets/home-screen/pig-3d.png')}
          style={{ width: 80, height: 80 }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  )
}

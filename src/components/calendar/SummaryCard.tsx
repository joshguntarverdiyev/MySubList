import { View, Text } from 'react-native'
import { Image } from 'expo-image'

interface SummaryCardProps {
  monthTotal: string
  paymentsCount: number
  nextName: string | null
  nextDaysLabel: string | null
}

export default function SummaryCard({ monthTotal, paymentsCount, nextName, nextDaysLabel }: SummaryCardProps) {
  return (
    <View
      className="bg-white rounded-2xl mx-6 px-5 py-4"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
    >
      <View className="flex-row items-center">
        {/* Left — This month */}
        <View className="flex-1">
          <Text className="text-[12px] text-[#6B7280] mb-1">This month</Text>
          <Text className="text-[26px] font-bold text-[#1A1A2E]">{monthTotal}</Text>
          <Text className="text-[12px] font-semibold text-[#7C4DFF] mt-0.5">
            {paymentsCount} {paymentsCount === 1 ? 'payment' : 'payments'}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-12 bg-[#E5E7EB] mx-3" />

        {/* Right — Next payment */}
        <View className="flex-1">
          <Text className="text-[12px] text-[#6B7280] mb-1">Next payment</Text>
          <Text className="text-[16px] font-bold text-[#1A1A2E]" numberOfLines={1}>
            {nextName ?? '—'}
          </Text>
          {nextDaysLabel ? (
            <Text className="text-[12px] font-semibold text-[#7C4DFF] mt-0.5">{nextDaysLabel}</Text>
          ) : null}
        </View>

        {/* 3D calendar image at the right edge */}
        <Image
          source={require('../../../assets/calendar-screen/calendar.png')}
          style={{ width: 70, height: 70, marginLeft: 4, marginTop: -18 }}
          contentFit="contain"
        />
      </View>
    </View>
  )
}

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
      className="bg-white rounded-2xl mx-6"
      style={{
        flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 90,
        shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4,
      }}
    >
      {/* Left — This month */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-[12px] text-[#6B7280] text-center mb-1">This month</Text>
        <Text className="text-[28px] font-bold text-[#1A1A2E] text-center">{monthTotal}</Text>
        <Text className="text-[12px] font-semibold text-[#7C4DFF] text-center mt-0.5">
          {paymentsCount} {paymentsCount === 1 ? 'payment' : 'payments'}
        </Text>
      </View>

      {/* Vertical divider */}
      <View style={{ width: 1, height: '70%', backgroundColor: '#E5E7EB', alignSelf: 'center', marginHorizontal: 12 }} />

      {/* Right — Next payment text + 3D image */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-[12px] text-[#6B7280] text-center mb-1">Next payment</Text>
          <Text className="text-[18px] font-bold text-[#1A1A2E] text-center" numberOfLines={1}>
            {nextName ?? '—'}
          </Text>
          {nextDaysLabel ? (
            <Text className="text-[12px] font-semibold text-[#7C4DFF] text-center mt-0.5">{nextDaysLabel}</Text>
          ) : null}
        </View>
        <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../../../assets/calendar-screen/calendar.png')}
            style={{ width: 80, height: 80 }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  )
}

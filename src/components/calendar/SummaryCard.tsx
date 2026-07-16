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
        flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 14, minHeight: 88,
        shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4,
      }}
    >
      {/* Left — This month */}
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Text className="text-[13px] text-[#6B7280] mb-0 text-left" numberOfLines={1}>This month</Text>
        <Text className="text-[26px] font-bold text-[#1A1A2E] text-left" style={{ lineHeight: 30 }} numberOfLines={1} adjustsFontSizeToFit>{monthTotal}</Text>
        <Text className="text-[13px] font-semibold text-[#7C4DFF] mt-0 text-left" numberOfLines={1}>
          {paymentsCount} {paymentsCount === 1 ? 'payment' : 'payments'}
        </Text>
      </View>

      {/* Vertical divider */}
      <View style={{ width: 1, height: '72%', backgroundColor: '#E5E7EB', alignSelf: 'center', marginHorizontal: 10 }} />

      {/* Right — Next payment text + 3D image (image is absolute so long names never slide under it) */}
      <View style={{ flex: 1.7, position: 'relative', justifyContent: 'center' }}>
        {/* paddingRight reserves the image's zone so text truncates before reaching it */}
        <View style={{ alignItems: 'flex-start', paddingRight: 98 }}>
          <Text className="text-[13px] text-[#6B7280] mb-0 text-left" numberOfLines={1}>Next payment</Text>
          <Text className="text-[18px] font-bold text-[#1A1A2E] text-left" style={{ lineHeight: 24 }} numberOfLines={1}>
            {nextName ?? '—'}
          </Text>
          {nextDaysLabel ? (
            <Text className="text-[13px] font-semibold text-[#7C4DFF] mt-0 text-left" numberOfLines={1}>{nextDaysLabel}</Text>
          ) : null}
        </View>
        <Image
          source={require('../../../assets/calendar-screen/calendar.png')}
          style={{ position: 'absolute', right: -20, top: '50%', marginTop: -45, width: 110, height: 110 }}
          contentFit="contain"
        />
      </View>
    </View>
  )
}

import { View, Text } from 'react-native'
import { KIND_COLOR } from '@/utils/renewalDates'

const ITEMS: { label: string; color: string }[] = [
  { label: 'Paid', color: KIND_COLOR.paid },
  { label: 'Trial', color: KIND_COLOR.trial },
  { label: 'Weekly', color: KIND_COLOR.weekly },
  { label: 'Monthly', color: KIND_COLOR.monthly },
  { label: 'Yearly', color: KIND_COLOR.yearly },
]

export default function LegendRow() {
  return (
    <View className="flex-row items-center justify-between mt-5 px-1">
      {ITEMS.map((item) => (
        <View key={item.label} className="flex-row items-center">
          <View
            className="rounded-full mr-1.5"
            style={{ width: 9, height: 9, backgroundColor: item.color }}
          />
          <Text className="text-[11px] text-[#6B7280]">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

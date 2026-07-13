import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Subscription } from '@/types/subscription'
import { getBrandVisual } from '@/utils/brand'
import { computeTotalPaid, formatLongDate } from '@/utils/subscriptionStats'

export default function ServiceSummaryCard({ sub }: { sub: Subscription }) {
  const { color, initial } = getBrandVisual(sub.brand_key, sub.name, sub.color)
  const website = sub.brand_key ? `${sub.brand_key}.com` : null

  return (
    <View
      className="bg-white rounded-2xl mx-6 p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
    >
      {/* Top: logo + name + tags */}
      <View className="flex-row">
        <View className="w-[64px] h-[64px] rounded-xl items-center justify-center mr-4" style={{ backgroundColor: color }}>
          <Text className="text-white text-[26px] font-bold">{initial}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-[22px] font-bold text-[#111827]" numberOfLines={1}>{sub.name}</Text>
            <View className={`flex-row items-center rounded-full px-2 py-1 ${sub.is_active ? 'bg-[#E2F8E4]' : 'bg-[#F3F4F6]'}`}>
              <View className={`w-1.5 h-1.5 rounded-full mr-1 ${sub.is_active ? 'bg-[#08A70E]' : 'bg-[#9CA3AF]'}`} />
              <Text className={`text-[12px] font-medium ${sub.is_active ? 'text-[#08A70E]' : 'text-[#6B7280]'}`}>
                {sub.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          {sub.category ? (
            <View className="self-start bg-[#F6F2FD] rounded-full px-3 py-1 mt-1.5">
              <Text className="text-[13px] font-semibold text-[#7C4DFF]">{sub.category}</Text>
            </View>
          ) : null}
          {website ? (
            <View className="flex-row items-center mt-1.5">
              <Text className="text-[13px] text-[#9CA3AF] mr-1">{website}</Text>
              <Ionicons name="open-outline" size={13} color="#9CA3AF" />
            </View>
          ) : null}
        </View>
      </View>

      <View className="h-px bg-[#E5E7EB] my-4" />

      {/* Stats: total paid | next payment */}
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-[13px] text-[#667085] mb-1">Total Paid</Text>
          <Text className="text-[26px] font-bold text-[#7C4DFF]">
            {sub.currency === 'EUR' ? '€' : ''}{computeTotalPaid(sub).toFixed(2)}
          </Text>
        </View>
        <View className="w-px h-12 bg-[#E5E7EB] mx-4" />
        <View className="flex-1">
          <Text className="text-[13px] text-[#667085] mb-1">Next payment</Text>
          <Text className="text-[18px] font-bold text-[#111827]">{formatLongDate(sub.next_renewal_date)}</Text>
        </View>
      </View>
    </View>
  )
}

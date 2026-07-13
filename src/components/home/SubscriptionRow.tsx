import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export interface SubscriptionItem {
  id: string
  name: string
  category: string
  price: string
  period: string
  color: string
  initial: string
}

interface Props {
  item: SubscriptionItem
  isLast: boolean
}

export default function SubscriptionRow({ item, isLast }: Props) {
  return (
    <>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3"
        activeOpacity={0.7}
        onPress={() => router.push(`/subscription/${item.id}` as any)}
      >
        {/* Brand logo placeholder */}
        <View
          className="rounded-xl w-[42px] h-[42px] items-center justify-center mr-4"
          style={{ backgroundColor: item.color }}
        >
          <Text className="text-white text-[16px] font-bold">{item.initial}</Text>
        </View>

        {/* Name + category */}
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-[#1A1A2E]">{item.name}</Text>
          <Text className="text-[13px] text-[#6B7280]">{item.category}</Text>
        </View>

        {/* Price + chevron */}
        <View className="flex-row items-center gap-x-1">
          <View className="items-end">
            <Text className="text-[15px] font-semibold text-[#1A1A2E]">{item.price}</Text>
            <Text className="text-[11px] text-[#667085]">/ {item.period}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
      {!isLast && <View className="h-px bg-[#E5E7EB] mx-4" />}
    </>
  )
}

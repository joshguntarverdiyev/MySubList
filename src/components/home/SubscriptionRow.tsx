import { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import BrandLogo from '@/components/subscription/BrandLogo'

export interface SubscriptionItem {
  id: string
  name: string
  category: string
  price: string
  period: string
  color: string
  brandKey: string | null
}

interface Props {
  item: SubscriptionItem
  isLast: boolean
}

function SubscriptionRow({ item, isLast }: Props) {
  return (
    <>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3"
        activeOpacity={0.7}
        onPress={() => router.push(`/subscription/${item.id}`)}
      >
        {/* Brand logo (falls back to colored initial) */}
        <View className="mr-4">
          <BrandLogo brandKey={item.brandKey} name={item.name} color={item.color} size={42} radius={12} />
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

export default memo(SubscriptionRow)

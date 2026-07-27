import { memo } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import type { UpcomingItem } from '@/utils/homeDisplay'
import BrandLogo from '@/components/subscription/BrandLogo'

const UpcomingCard = memo(function UpcomingCard({ item }: { item: UpcomingItem }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/subscription/${item.id}`)}
      className="bg-white rounded-xl mr-3"
      style={{ minWidth: 140, shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
    >
      {/* Logo + name/days */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <View className="mr-3">
          <BrandLogo brandKey={item.brandKey} name={item.name} color={item.color} size={42} radius={12} />
        </View>
        <View>
          <Text className="text-sm font-semibold text-[#1A1A2E]">{item.name}</Text>
          <Text className="text-xs text-[#7C4DFF]">{item.daysLabel}</Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-[#E5E7EB] mx-3" />

      {/* Price */}
      <View className="px-4 py-3">
        <Text className="text-[17px] font-semibold text-[#1A1A2E]">{item.price}</Text>
      </View>
    </TouchableOpacity>
  )
})

export default function UpcomingPayments({ items }: { items: UpcomingItem[] }) {
  if (items.length === 0) return null
  return (
    <View>
      <Text className="text-[20px] font-bold text-[#1A1A2E] mb-4 px-6">Upcoming Payments</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {items.map(item => <UpcomingCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  )
}

import { View, Text, ScrollView } from 'react-native'

interface UpcomingItem {
  id: string
  name: string
  daysLabel: string
  price: string
  color: string
  initial: string
}

const UPCOMING: UpcomingItem[] = [
  { id: '1', name: 'Figma',         daysLabel: 'Today',  price: '€ 14.99', color: '#7C4DFF', initial: 'F' },
  { id: '2', name: 'Netflix',       daysLabel: '3 Days', price: '€ 6.99',  color: '#E50914', initial: 'N' },
  { id: '3', name: 'Amazon Prime',  daysLabel: '7 Days', price: '€ 20.00', color: '#00A8E0', initial: 'A' },
]

function UpcomingCard({ item }: { item: UpcomingItem }) {
  return (
    <View
      className="bg-white rounded-xl mr-3"
      style={{ minWidth: 140, shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
    >
      {/* Logo + name/days */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <View
          className="rounded-xl w-[42px] h-[42px] items-center justify-center mr-3"
          style={{ backgroundColor: item.color }}
        >
          <Text className="text-white text-[18px] font-bold">{item.initial}</Text>
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
    </View>
  )
}

export default function UpcomingPayments() {
  return (
    <View>
      <Text className="text-[20px] font-bold text-[#1A1A2E] mb-4 px-6">Upcoming Payments</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {UPCOMING.map(item => <UpcomingCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  )
}

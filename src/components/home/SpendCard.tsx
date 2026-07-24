import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SpendCardProps {
  totalPaid: string
  monthlySpend: string
  activeCount: number
  note?: string | null
}

export default function SpendCard({ totalPaid, monthlySpend, activeCount, note }: SpendCardProps) {
  return (
    <View
      className="bg-white rounded-[24px] mx-6 px-6 pt-5 pb-4"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 32, elevation: 6 }}
    >
      {/* Top row: label + chart thumbnail */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm text-[#6B7280] mb-1">Total Paid</Text>
          <Text className="text-[32px] font-bold text-[#1A1A2E] tracking-tight">{totalPaid}</Text>
        </View>
        <View className="items-end">
          <View className="bg-[#F6F1FD] rounded-xl w-[68px] h-[64px] items-center justify-center">
            <Ionicons name="trending-up-outline" size={28} color="#7C4DFF" />
          </View>
          {note ? <Text className="text-[10px] text-[#9CA3AF] mt-1 text-right" numberOfLines={1}>{note}</Text> : null}
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-[#E5E7EB] mt-1 mb-4" />

      {/* Bottom row: monthly spend | active subs */}
      <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Spent This Month</Text>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#1A1A2E' }}>{monthlySpend}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }} numberOfLines={1}>
              Active Subscriptions
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#1A1A2E' }}>{activeCount}</Text>
          </View>
        </View>
        {/* Divider overlaid at the card's true horizontal center */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ width: 1, height: 36, backgroundColor: '#E5E7EB' }} />
        </View>
      </View>
    </View>
  )
}

import { View, Text } from 'react-native'
import { MotiView } from 'moti'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@/utils/currency'
import type { Insights } from '@/utils/analytics'

interface Props {
  insights: Insights
  currency: string
}

type Card = { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; value: string }

function InsightCard({ icon, color, label, value }: Card) {
  return (
    <View className="flex-1 rounded-xl bg-white p-4" style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 2 }}>
      <Ionicons name={icon} size={20} color={color} />
      <Text className="mt-2 text-[12px] text-[#6B7280]">{label}</Text>
      <Text className="mt-0.5 text-[15px] font-bold text-[#1A1A2E]" numberOfLines={1}>{value}</Text>
    </View>
  )
}

export default function InsightsGrid({ insights, currency }: Props) {
  const cards: Card[] = [
    { icon: 'wallet-outline', color: '#6C47D9', label: 'Most Expensive Category', value: insights.mostExpensiveCategory },
    { icon: 'calendar-outline', color: '#6C47D9', label: 'Yearly Projection', value: formatCurrency(insights.yearlyProjection, currency) },
    { icon: 'flame-outline', color: '#EF4444', label: 'Cheapest Month', value: insights.cheapestMonth },
    { icon: 'star-outline', color: '#F59E0B', label: 'Most Expensive Sub', value: insights.mostExpensiveSub },
  ]

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 320 }}
      className="mx-6 mt-4 gap-y-3"
    >
      <View className="flex-row gap-x-3">
        <InsightCard {...cards[0]} />
        <InsightCard {...cards[1]} />
      </View>
      <View className="flex-row gap-x-3">
        <InsightCard {...cards[2]} />
        <InsightCard {...cards[3]} />
      </View>
    </MotiView>
  )
}

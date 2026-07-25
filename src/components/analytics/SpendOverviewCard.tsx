import { View, Text } from 'react-native'
import { MotiView } from 'moti'
import { Ionicons } from '@expo/vector-icons'
import { formatCurrency } from '@/utils/currency'
import type { Period } from '@/utils/analytics'

const PERIOD_WORD: Record<Period, string> = { weekly: 'week', monthly: 'month', yearly: 'year' }

interface Props {
  total: number
  currency: string
  period: Period
  changePct: number | null
}

export default function SpendOverviewCard({ total, currency, period, changePct }: Props) {
  const up = (changePct ?? 0) > 0
  const color = up ? '#EF4444' : '#10B981'

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350 }}
      className="mx-6 rounded-2xl bg-white p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[13px] text-[#6B7280]">Total Spend</Text>
          <Text className="mt-1 text-[32px] font-bold text-[#1A1A2E]">{formatCurrency(total, currency)}</Text>
          <Text className="mt-0.5 text-[13px] text-[#6B7280]">so far this {PERIOD_WORD[period]}</Text>
        </View>
        {changePct !== null ? (
          <View className="flex-row items-center gap-x-1 rounded-full px-2 py-1" style={{ backgroundColor: `${color}1A` }}>
            <Ionicons name={up ? 'trending-up-outline' : 'trending-down-outline'} size={16} color={color} />
            <Text className="text-[13px] font-bold" style={{ color }}>{Math.abs(changePct).toFixed(0)}%</Text>
          </View>
        ) : null}
      </View>
    </MotiView>
  )
}

import { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'
import { useRatesStore } from '@/store/ratesStore'
import {
  calculateSpendByPeriod, getSpendTrend, getCategoryBreakdown,
  getTopSpenders, getInsights, type Period,
} from '@/utils/analytics'
import FilterPills from '@/components/analytics/FilterPills'
import SpendOverviewCard from '@/components/analytics/SpendOverviewCard'
import SpendTrendChart from '@/components/analytics/SpendTrendChart'
import CategoryDonut from '@/components/analytics/CategoryDonut'
import TopSpenders from '@/components/analytics/TopSpenders'
import InsightsGrid from '@/components/analytics/InsightsGrid'

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets()
  const subs = useSubscriptionStore((s) => s.subscriptions)
  const currency = useProfileStore((s) => s.currency)
  const rates = useRatesStore((s) => s.rates)
  const [range, setRange] = useState<Period>('monthly')

  const total = calculateSpendByPeriod(subs, range, currency, rates)
  const monthlyTotal = calculateSpendByPeriod(subs, 'monthly', currency, rates)
  const trend = getSpendTrend(subs, range, currency, rates)
  const prev = trend[trend.length - 2]?.value ?? 0
  const cur = trend[trend.length - 1]?.value ?? 0
  const changePct = prev > 0 ? ((cur - prev) / prev) * 100 : null
  const breakdown = getCategoryBreakdown(subs, currency, rates)
  const top = getTopSpenders(subs, currency, rates, 3)
  const insights = getInsights(subs, currency, rates)

  return (
    <View className="flex-1 bg-[#F0EBFF]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pb-2 pt-2">
        <View className="mb-3 flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center">
            <Ionicons name="chevron-back-outline" size={26} color="#1A1A2E" />
          </Pressable>
          <Text className="flex-1 text-center text-[20px] font-bold text-[#1A1A2E]">Analytics</Text>
          <View className="w-9" />
        </View>
        <View className="items-end">
          <FilterPills value={range} onChange={setRange} />
        </View>
      </View>

      {subs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="stats-chart-outline" size={40} color="#9CA3AF" />
          <Text className="mt-3 text-center text-[15px] text-[#6B7280]">
            Add subscriptions to see your spending analytics.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 24 }}>
          <SpendOverviewCard total={total} currency={currency} period={range} changePct={changePct} />
          <SpendTrendChart data={trend} />
          <CategoryDonut data={breakdown} total={monthlyTotal} currency={currency} />
          <TopSpenders subs={top} currency={currency} rates={rates} />
          <InsightsGrid insights={insights} currency={currency} />
        </ScrollView>
      )}
    </View>
  )
}

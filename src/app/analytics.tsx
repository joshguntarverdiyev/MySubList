import { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'
import { useRatesStore } from '@/store/ratesStore'
import {
  calculateSpendByPeriod, getSpendChange, getSpendTrend, getCategoryBreakdown,
  getTopSpenders, getInsights, type Period,
} from '@/utils/analytics'
import OptionSheet, { type SheetOption } from '@/components/profile/OptionSheet'
import SpendOverviewCard from '@/components/analytics/SpendOverviewCard'
import SpendTrendChart from '@/components/analytics/SpendTrendChart'
import CategoryDonut from '@/components/analytics/CategoryDonut'
import TopSpenders from '@/components/analytics/TopSpenders'
import InsightsGrid from '@/components/analytics/InsightsGrid'

const PERIOD_OPTIONS: SheetOption<Period>[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets()
  const subs = useSubscriptionStore((s) => s.subscriptions)
  const currency = useProfileStore((s) => s.currency)
  const rates = useRatesStore((s) => s.rates)
  const [range, setRange] = useState<Period>('monthly')
  const [filterOpen, setFilterOpen] = useState(false)
  const rangeLabel = PERIOD_OPTIONS.find((o) => o.value === range)?.label ?? ''

  const total = calculateSpendByPeriod(subs, range, currency, rates)
  const changePct = getSpendChange(subs, range, currency, rates)
  const trend = getSpendTrend(subs, range, currency, rates)
  const breakdown = getCategoryBreakdown(subs, range, currency, rates)
  const top = getTopSpenders(subs, currency, rates, 3)
  const insights = getInsights(subs, range, currency, rates)

  return (
    <View className="flex-1 bg-[#F0EBFF]" style={{ paddingTop: insets.top }}>
      {/* Header: back · title (centered) · filter pill */}
      <View className="flex-row items-center px-6 pb-2 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons name="chevron-back" size={20} color="#7C4DFF" />
        </Pressable>
        <View className="flex-1" />
        <Pressable
          onPress={() => setFilterOpen(true)}
          hitSlop={8}
          className="h-9 flex-row items-center gap-x-1.5 rounded-full bg-white px-3"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 2 }}
        >
          <Ionicons name="options-outline" size={18} color="#6C47D9" />
          <Text className="text-[13px] font-semibold text-[#6C47D9]">{rangeLabel}</Text>
        </Pressable>
        <Text
          pointerEvents="none"
          className="absolute left-0 right-0 text-center text-[20px] font-bold text-[#1A1A2E]"
        >
          Analytics
        </Text>
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
          <SpendTrendChart data={trend} currency={currency} />
          <CategoryDonut data={breakdown} total={total} currency={currency} />
          <TopSpenders subs={top} currency={currency} rates={rates} />
          <InsightsGrid insights={insights} currency={currency} />
        </ScrollView>
      )}

      <OptionSheet
        visible={filterOpen}
        title="Time range"
        options={PERIOD_OPTIONS}
        selected={range}
        onSelect={(v) => { setRange(v); setFilterOpen(false) }}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  )
}

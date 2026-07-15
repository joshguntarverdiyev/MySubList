import { useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { addMonths, differenceInCalendarDays, parseISO } from 'date-fns'
import { useUserId } from '@/hooks/useUserId'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'
import { useRatesStore } from '@/store/ratesStore'
import { makeConverter } from '@/utils/convert'
import { formatCurrency } from '@/utils/currency'
import { getMonthRenewalMap, daysAwayLabel, nextRenewalIso } from '@/utils/renewalDates'
import SummaryCard from '@/components/calendar/SummaryCard'
import MonthHeader from '@/components/calendar/MonthHeader'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import LegendRow from '@/components/calendar/LegendRow'
import FilterModal, { type CalendarFilter } from '@/components/calendar/FilterModal'

export default function CalendarScreen() {
  const insets = useSafeAreaInsets()
  const userId = useUserId()
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)
  const fetchSubscriptions = useSubscriptionStore((s) => s.fetchSubscriptions)
  const currency = useProfileStore((s) => s.currency)
  const firstDayOfWeek = useProfileStore((s) => s.first_day_of_week)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const rates = useRatesStore((s) => s.rates)
  const fetchRates = useRatesStore((s) => s.fetchRates)

  const [viewMonth, setViewMonth] = useState(new Date())
  const [filter, setFilter] = useState<CalendarFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchSubscriptions(userId)
        fetchProfile(userId)
        fetchRates()
      }
    }, [userId, fetchSubscriptions, fetchProfile, fetchRates])
  )

  const convert = useMemo(() => makeConverter(rates, currency), [rates, currency])

  const renewalMap = useMemo(
    () => getMonthRenewalMap(subscriptions, viewMonth.getFullYear(), viewMonth.getMonth()),
    [subscriptions, viewMonth]
  )

  // Month total = sum of every renewal occurrence this month (converted).
  const { monthTotal, paymentsCount } = useMemo(() => {
    let total = 0
    let count = 0
    for (const subs of renewalMap.values()) {
      for (const sub of subs) {
        total += convert(sub.price, sub.currency)
        count += 1
      }
    }
    return { monthTotal: formatCurrency(total, currency), paymentsCount: count }
  }, [renewalMap, convert, currency])

  // Next payment = soonest future renewal across all active subs (computed).
  const next = useMemo(() => {
    const today = new Date()
    const upcoming = subscriptions
      .map((s) => ({ sub: s, next: nextRenewalIso(s, today) }))
      .filter(({ next }) => next && differenceInCalendarDays(parseISO(next), today) >= 0)
      .sort((a, b) => parseISO(a.next!).getTime() - parseISO(b.next!).getTime())
    return upcoming[0] ?? null
  }, [subscriptions])

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-5">
          <Text className="text-[28px] font-bold text-[#1A1A2E]">Calendar</Text>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}
            activeOpacity={0.85}
          >
            <Ionicons name="funnel-outline" size={20} color="#7C4DFF" />
          </TouchableOpacity>
        </View>

        <SummaryCard
          monthTotal={monthTotal}
          paymentsCount={paymentsCount}
          nextName={next?.sub.name ?? null}
          nextDaysLabel={next?.next ? daysAwayLabel(next.next) : null}
        />

        {/* Calendar card */}
        <View
          className="bg-white rounded-2xl mx-6 mt-4 p-4"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
        >
          <MonthHeader
            month={viewMonth}
            onPrev={() => setViewMonth((m) => addMonths(m, -1))}
            onNext={() => setViewMonth((m) => addMonths(m, 1))}
          />
          <CalendarGrid
            month={viewMonth}
            firstDayOfWeek={firstDayOfWeek}
            renewalMap={renewalMap}
            filter={filter}
          />
          <LegendRow />
        </View>
      </ScrollView>

      <FilterModal
        visible={filterOpen}
        active={filter}
        onSelect={setFilter}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  )
}

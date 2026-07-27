import { useCallback, useMemo, useRef, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { useUserId } from '@/hooks/useUserId'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'
import { useRatesStore } from '@/store/ratesStore'
import {
  getUpcomingPayments, calculateTotalPaid,
  calculateMonthToDateSpend, calculatePotentialSavings,
} from '@/services/subscriptions'
import { toRowItem, toUpcomingItem } from '@/utils/homeDisplay'
import { formatCurrency } from '@/utils/currency'
import { makeConverter } from '@/utils/convert'
import HomeHeader from '@/components/home/HomeHeader'
import SpendCard from '@/components/home/SpendCard'
import SavingsCard from '@/components/home/SavingsCard'
import AnalyticsPreview from '@/components/home/AnalyticsPreview'
import SavingsModal from '@/components/home/SavingsModal'
import UpcomingPayments from '@/components/home/UpcomingPayments'
import AllSubscriptions from '@/components/home/AllSubscriptions'
import HomeSkeleton from '@/components/home/HomeSkeleton'
import EmptyState from '@/components/home/EmptyState'
import ErrorState from '@/components/home/ErrorState'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const userId = useUserId()
  const { subscriptions, isLoading, error, fetchSubscriptions } = useSubscriptionStore()
  const currency = useProfileStore((s) => s.currency)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const rates = useRatesStore((s) => s.rates)
  const ratesDate = useRatesStore((s) => s.date)
  const ratesLoaded = useRatesStore((s) => s.loaded)
  const fetchRates = useRatesStore((s) => s.fetchRates)
  const [savingsOpen, setSavingsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const sectionYRef = useRef(0)

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchSubscriptions(userId)
        fetchProfile(userId)
        fetchRates()
      }
    }, [userId, fetchSubscriptions, fetchProfile, fetchRates])
  )

  // Derive every figure + display list in one memo so this only recomputes when
  // the data (subs/rates/currency) actually changes — not on unrelated state
  // like opening the savings modal or toggling "See all". rowItems are stable
  // references so the memoized SubscriptionRow rows don't re-render needlessly.
  const { totalPaid, monthlySpend, savings, upcoming, hasForeignCurrency, rowItems } = useMemo(() => {
    const convert = makeConverter(rates, currency)
    return {
      totalPaid: formatCurrency(calculateTotalPaid(subscriptions, convert), currency),
      monthlySpend: formatCurrency(calculateMonthToDateSpend(subscriptions, convert), currency),
      savings: calculatePotentialSavings(subscriptions, convert),
      upcoming: getUpcomingPayments(subscriptions).map(toUpcomingItem),
      hasForeignCurrency: subscriptions.some((s) => s.currency !== currency),
      rowItems: subscriptions.map(toRowItem),
    }
  }, [subscriptions, rates, currency])

  // Only note conversion when a sub is in a currency other than the profile's.
  const spendNote = hasForeignCurrency ? (ratesLoaded && ratesDate ? `rates as of ${ratesDate}` : 'approx.') : null

  const VISIBLE_LIMIT = 4
  const visible = showAll ? rowItems : rowItems.slice(0, VISIBLE_LIMIT)

  const toggleShowAll = () => {
    const next = !showAll
    setShowAll(next)
    if (next) scrollRef.current?.scrollTo({ y: sectionYRef.current, animated: true })
  }

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }}
      >
        <HomeHeader onAdd={() => router.push('/subscription/add')} />

        {isLoading && subscriptions.length === 0 ? (
          <HomeSkeleton />
        ) : error ? (
          <ErrorState onRetry={() => userId && fetchSubscriptions(userId)} />
        ) : subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SpendCard totalPaid={totalPaid} monthlySpend={monthlySpend} activeCount={subscriptions.length} note={spendNote} />

            <View className="mt-4">
              <SavingsCard
                amount={formatCurrency(savings.amount / 12, currency)}
                opportunities={savings.trialCount + savings.switchCount}
                onPress={() => setSavingsOpen(true)}
              />
            </View>

            <View className="mt-4">
              <AnalyticsPreview />
            </View>

            <View className="mt-6">
              <UpcomingPayments items={upcoming} />
            </View>

            <AllSubscriptions
              items={visible}
              showAll={showAll}
              canToggle={subscriptions.length > VISIBLE_LIMIT}
              onToggle={toggleShowAll}
              onLayout={(e) => { sectionYRef.current = e.nativeEvent.layout.y }}
            />
          </>
        )}
      </ScrollView>

      <SavingsModal
        visible={savingsOpen}
        onClose={() => setSavingsOpen(false)}
        subscriptions={subscriptions}
        currency={currency}
        rates={rates}
      />
    </View>
  )
}

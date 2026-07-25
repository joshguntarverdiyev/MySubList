import { useCallback, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
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
import SpendCard from '@/components/home/SpendCard'
import SavingsCard from '@/components/home/SavingsCard'
import AnalyticsPreview from '@/components/home/AnalyticsPreview'
import SavingsModal from '@/components/home/SavingsModal'
import UpcomingPayments from '@/components/home/UpcomingPayments'
import SubscriptionRow from '@/components/home/SubscriptionRow'
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

  const convert = makeConverter(rates, currency)
  const totalPaid = formatCurrency(calculateTotalPaid(subscriptions, convert), currency)
  const monthlySpend = formatCurrency(calculateMonthToDateSpend(subscriptions, convert), currency)
  const savings = calculatePotentialSavings(subscriptions, convert)

  // Only note conversion when a sub is in a currency other than the profile's.
  const hasForeignCurrency = subscriptions.some((s) => s.currency !== currency)
  const spendNote = hasForeignCurrency ? (ratesLoaded && ratesDate ? `rates as of ${ratesDate}` : 'approx.') : null
  const upcoming = getUpcomingPayments(subscriptions).map(toUpcomingItem)

  const VISIBLE_LIMIT = 4
  const visible = showAll ? subscriptions : subscriptions.slice(0, VISIBLE_LIMIT)

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
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-6">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 40, height: 40, borderRadius: 10, marginRight: 8 }}
              contentFit="cover"
            />
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A2E' }}>
              My<Text style={{ color: '#7C4DFF' }}>SubList</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/subscription/add' as any)}
            className="w-10 h-10 rounded-full bg-[#7C4DFF] items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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

            <View
              className="mt-6 px-6"
              onLayout={(e) => { sectionYRef.current = e.nativeEvent.layout.y }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold text-[#1A1A2E]">All Subscriptions</Text>
                {subscriptions.length > VISIBLE_LIMIT && (
                  <TouchableOpacity onPress={toggleShowAll}>
                    <Text className="text-[15px] font-semibold text-[#7C4DFF]">
                      {showAll ? 'See less' : 'See all'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                className="bg-white rounded-[22px] overflow-hidden"
                style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
              >
                {visible.map((sub, index) => (
                  <SubscriptionRow
                    key={sub.id}
                    item={toRowItem(sub)}
                    isLast={index === visible.length - 1}
                  />
                ))}
              </View>
            </View>
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

import { useCallback, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useUserId } from '@/hooks/useUserId'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import {
  getUpcomingPayments, calculateTotalPaid,
  calculateMonthlySpend, calculatePotentialSavings,
} from '@/services/subscriptions'
import { toRowItem, toUpcomingItem } from '@/utils/homeDisplay'
import { formatCurrency } from '@/utils/currency'
import SpendCard from '@/components/home/SpendCard'
import SavingsCard from '@/components/home/SavingsCard'
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
  const [savingsOpen, setSavingsOpen] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (userId) fetchSubscriptions(userId)
    }, [userId, fetchSubscriptions])
  )

  const currency = subscriptions[0]?.currency ?? 'EUR'
  const totalPaid = formatCurrency(calculateTotalPaid(subscriptions), currency)
  const monthlySpend = formatCurrency(calculateMonthlySpend(subscriptions), currency)
  const savings = calculatePotentialSavings(subscriptions)
  const upcoming = getUpcomingPayments(subscriptions).map(toUpcomingItem)

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
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
            <SpendCard totalPaid={totalPaid} monthlySpend={monthlySpend} activeCount={subscriptions.length} />

            <View className="mt-4">
              <SavingsCard
                amount={formatCurrency(savings.amount / 12, currency)}
                opportunities={savings.trialCount + savings.switchCount}
                onPress={() => setSavingsOpen(true)}
              />
            </View>

            <View className="mt-6">
              <UpcomingPayments items={upcoming} />
            </View>

            <View className="mt-6 px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[20px] font-bold text-[#1A1A2E]">All Subscriptions</Text>
                <TouchableOpacity>
                  <Text className="text-[15px] font-semibold text-[#7C4DFF]">See all</Text>
                </TouchableOpacity>
              </View>
              <View
                className="bg-white rounded-[22px] overflow-hidden"
                style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
              >
                {subscriptions.map((sub, index) => (
                  <SubscriptionRow
                    key={sub.id}
                    item={toRowItem(sub)}
                    isLast={index === subscriptions.length - 1}
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
      />
    </View>
  )
}

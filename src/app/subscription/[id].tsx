import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { isFuture, parseISO } from 'date-fns'
import { useSubscription } from '@/hooks/useSubscription'
import { formatLongDate } from '@/utils/subscriptionStats'
import DetailHeader from '@/components/subscription/DetailHeader'
import ServiceSummaryCard from '@/components/subscription/ServiceSummaryCard'
import DetailRow from '@/components/subscription/DetailRow'

const CAPS: Record<string, string> = {
  weekly: 'Weekly', once: 'Once', monthly: 'Monthly', yearly: 'Yearly',
}

export default function SubscriptionDetails() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { subscription: sub, loading, notFound, deleteSubscription } = useSubscription(id)

  if (loading) {
    return (
      <View className="flex-1 bg-[#F0EBFF] items-center justify-center">
        <ActivityIndicator color="#7C4DFF" />
      </View>
    )
  }

  if (notFound || !sub) {
    return (
      <View className="flex-1 bg-[#F0EBFF] items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] text-[#6B7280] text-center mb-4">
          This subscription could not be found.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#7C4DFF] rounded-full px-6 py-3">
          <Text className="text-white font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // "In trial" = a free trial whose end date is still in the future.
  const inTrial = sub.is_free_trial && !!sub.trial_end_date && isFuture(parseISO(sub.trial_end_date))

  const rows = [
    { icon: 'refresh-outline' as const, label: 'Billing Cycle', value: CAPS[sub.billing_period] },
    { icon: 'calendar-outline' as const, label: 'Started Date', value: formatLongDate(sub.start_date) },
    { icon: 'card-outline' as const, label: 'Payment Method', value: sub.payment_method ?? '—' },
    { icon: 'document-text-outline' as const, label: 'Plan', value: sub.plan_name ?? '—' },
    { icon: 'cash-outline' as const, label: 'Currency', value: sub.currency },
    { icon: 'time-outline' as const, label: 'Free Trial', value: sub.is_free_trial ? 'Yes' : 'No' },
    ...(sub.is_free_trial && sub.trial_end_date
      ? [{ icon: 'hourglass-outline' as const, label: 'Trial Ends', value: formatLongDate(sub.trial_end_date) }]
      : []),
  ]

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      >
        <DetailHeader onDelete={deleteSubscription} onEdit={() => router.push(`/subscription/edit/${id}`)} />
        <ServiceSummaryCard sub={sub} />

        {inTrial ? (
          <View className="flex-row items-center self-start mx-6 mt-4 rounded-full bg-[#FEF3E2] px-3 py-1.5">
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text className="ml-1.5 text-[13px] font-semibold text-[#B45309]">
              In trial · ends {formatLongDate(sub.trial_end_date)}
            </Text>
          </View>
        ) : null}

        <View
          className="bg-white rounded-2xl mx-6 mt-4 py-1"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
        >
          {rows.map((row, i) => (
            <DetailRow key={row.label} {...row} isLast={i === rows.length - 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

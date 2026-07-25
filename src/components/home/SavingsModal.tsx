import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { getTrialsEndingSoon } from '@/services/subscriptions'
import { formatCurrency } from '@/utils/currency'
import { makeConverter } from '@/utils/convert'

interface SavingsModalProps {
  visible: boolean
  onClose: () => void
  subscriptions: Subscription[]
  currency: string
  rates: Record<string, number>
}

const TIPS = [
  "Review subscriptions you haven't used this month",
  'Share family plans to split costs',
  'Set renewal reminders to cancel before charges hit',
]

const SAVINGS_PROMPT = 'How can I save money on my subscriptions? Suggest cheaper alternatives where it makes sense.'

export default function SavingsModal({ visible, onClose, subscriptions, currency, rates }: SavingsModalProps) {
  const { height } = useWindowDimensions()
  const convert = makeConverter(rates, currency)
  const trials = getTrialsEndingSoon(subscriptions)
  const monthly = subscriptions.filter((s) => s.billing_period === 'monthly')
  const topMonthly = [...monthly]
    .sort((a, b) => convert(b.price, b.currency) - convert(a.price, a.currency))
    .slice(0, 3)

  const askAdvisor = () => {
    onClose()
    router.push({ pathname: '/(tabs)/advisor', params: { ask: SAVINGS_PROMPT } } as any)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View className="rounded-t-[24px] bg-white p-6">
          {/* Header */}
          <View className="mb-5 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-[#7C4DFF]">Potential Savings</Text>
              <Text className="mt-1 text-sm text-[#6B7280]">Here's how you can save money</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              className="h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
              style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
            >
              <Ionicons name="close" size={22} color="#7C4DFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: height * 0.7 }} showsVerticalScrollIndicator contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Personalized AI tips CTA */}
            <TouchableOpacity onPress={askAdvisor} activeOpacity={0.9} className="mb-6 flex-row items-center rounded-2xl bg-[#7C4DFF] px-4 py-3.5">
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-white">Get personalized savings tips</Text>
                <Text className="text-[12px] text-white/80">Ask the AI advisor for cheaper alternatives</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Free Trials Ending Soon */}
            {trials.length > 0 && (
              <View className="mb-6">
                <Text className="mb-3 text-[17px] font-bold text-[#1A1A2E]">Free Trials Ending Soon</Text>
                {trials.map((s) => {
                  const days = differenceInCalendarDays(parseISO(s.trial_end_date!), new Date())
                  return (
                    <View key={s.id} className="mb-3 rounded-2xl border border-[#F59E0B]/30 bg-[#FFF7EB] p-4">
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-[15px] font-semibold text-[#1A1A2E]">{s.name}</Text>
                        <View className="rounded-full bg-[#F59E0B] px-3 py-1">
                          <Text className="text-xs font-semibold text-white">
                            {days === 0 ? 'Ends today' : `${days} day${days === 1 ? '' : 's'} left`}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[13px] text-[#6B7280]">
                        Your {s.name} trial ends in {days} day{days === 1 ? '' : 's'}. Decide if you want to keep it or cancel.
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}

            {/* Switch to Yearly — top 3 priciest monthly */}
            {monthly.length > 0 && (
              <View className="mb-6">
                <Text className="mb-2 text-[17px] font-bold text-[#1A1A2E]">Switch to Yearly</Text>
                <Text className="mb-3 text-[13px] text-[#6B7280]">
                  You have {monthly.length} monthly {monthly.length === 1 ? 'subscription' : 'subscriptions'}. Annual plans are often 15–30% cheaper — start with your priciest:
                </Text>
                {topMonthly.map((s) => (
                  <View key={s.id} className="mb-3 rounded-2xl border border-[#E6D9FF] bg-[#F0EBFF] p-4">
                    <Text className="mb-1 text-[15px] font-semibold text-[#1A1A2E]">{s.name}</Text>
                    <Text className="text-[13px] text-[#6B7280]">
                      About {formatCurrency(convert(s.price, s.currency) * 12, currency)}/year at the monthly rate — check for a cheaper annual plan.
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* General Tips */}
            <View className="mb-2">
              <Text className="mb-3 text-[17px] font-bold text-[#1A1A2E]">General Tips</Text>
              {TIPS.map((tip) => (
                <View key={tip} className="mb-3 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8 }} />
                  <Text className="flex-1 text-[14px] text-[#1A1A2E]">{tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

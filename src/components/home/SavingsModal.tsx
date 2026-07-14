import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { getTrialsEndingSoon } from '@/services/subscriptions'
import { formatCurrency } from '@/utils/currency'

interface SavingsModalProps {
  visible: boolean
  onClose: () => void
  subscriptions: Subscription[]
  currency: string
}

const TIPS = [
  "Review subscriptions you haven't used this month",
  'Share family plans to split costs',
  'Set renewal reminders to cancel before charges hit',
  'Annual plans are often 20–30% cheaper',
]

export default function SavingsModal({ visible, onClose, subscriptions, currency }: SavingsModalProps) {
  const trials = getTrialsEndingSoon(subscriptions)
  const monthly = subscriptions.filter((s) => s.billing_period === 'monthly')

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-[24px] p-6"
          style={{ maxHeight: '80%' }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-[#7C4DFF]">Potential Savings</Text>
              <Text className="text-sm text-[#6B7280] mt-1">Here's how you can save money</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#EDE9F8] items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#1A1A2E" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Section A — Free Trials Ending Soon */}
            {trials.length > 0 && (
              <View className="mb-6">
                <Text className="text-[17px] font-bold text-[#1A1A2E] mb-3">Free Trials Ending Soon</Text>
                {trials.map((s) => {
                  const days = differenceInCalendarDays(parseISO(s.trial_end_date!), new Date())
                  return (
                    <View key={s.id} className="bg-[#FFF7EB] border border-[#F59E0B]/30 rounded-2xl p-4 mb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-[15px] font-semibold text-[#1A1A2E]">{s.name}</Text>
                        <View className="bg-[#F59E0B] rounded-full px-3 py-1">
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

            {/* Section B — Switch to Yearly */}
            {monthly.length > 0 && (
              <View className="mb-6">
                <Text className="text-[17px] font-bold text-[#1A1A2E] mb-3">Switch to Yearly</Text>
                {monthly.map((s) => (
                  <View key={s.id} className="bg-[#F0EBFF] border border-[#E6D9FF] rounded-2xl p-4 mb-3">
                    <Text className="text-[15px] font-semibold text-[#1A1A2E] mb-1">{s.name}</Text>
                    <Text className="text-[13px] text-[#6B7280]">
                      Paying {s.name} monthly costs {formatCurrency(s.price * 12, currency)}/year. Check if a yearly plan is cheaper.
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Section C — General Tips */}
            <View className="mb-2">
              <Text className="text-[17px] font-bold text-[#1A1A2E] mb-3">General Tips</Text>
              {TIPS.map((tip) => (
                <View key={tip} className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8 }} />
                  <Text className="flex-1 text-[14px] text-[#1A1A2E]">{tip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

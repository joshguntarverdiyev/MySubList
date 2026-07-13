import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { CURRENCIES, PAYMENT_METHODS } from '@/constants/subscriptionOptions'
import { useSubscriptionForm } from '@/hooks/useSubscriptionForm'
import Dropdown from '@/components/subscription/Dropdown'
import BillingPeriodSelector from '@/components/subscription/BillingPeriodSelector'
import LabeledInput from '@/components/subscription/LabeledInput'
import DateField from '@/components/subscription/DateField'

export default function NewSubscription() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ name?: string; brandKey?: string }>()
  const f = useSubscriptionForm(params.name ?? '', params.brandKey)

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#F0EBFF]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-[18px] bg-white border border-[#EFE9FF] items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
          >
            <Ionicons name="arrow-back" size={22} color="#7C4DFF" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[24px] font-bold text-[#111827] mr-11">Entry Details</Text>
        </View>

        {/* Form card */}
        <View className="bg-white rounded-2xl mx-6 p-5 gap-y-5" style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}>
          {f.apiError ? <Text className="text-[13px] text-[#EF4444]">{f.apiError}</Text> : null}

          <LabeledInput label="Name" value={f.name} onChangeText={f.setName} placeholder="Enter subscription name" error={f.errors.name} />
          <LabeledInput label="Plan (Optional)" value={f.plan} onChangeText={f.setPlan} placeholder="Enter plan name" />

          <DateField value={f.startDate} onChange={f.setStartDate} error={f.errors.date} />

          {/* Price + Currency */}
          <View className="flex-row justify-between">
            <View style={{ width: '52%' }}>
              <Text className="text-[14px] font-semibold text-[#111827] mb-2">Price</Text>
              <View className="flex-row items-center bg-white border border-[#DAD5E8] rounded-2xl h-[54px] px-4">
                <Text className="text-[16px] text-[#667085]">$</Text>
                <TextInput value={f.price} onChangeText={f.setPrice} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" className="flex-1 ml-2 text-[16px] text-[#111827]" />
              </View>
              {f.errors.price ? <Text className="text-[12px] text-[#EF4444] mt-1">{f.errors.price}</Text> : null}
            </View>
            <View style={{ width: '44%' }}>
              <Dropdown label="Currency" value={f.currency} placeholder="EUR" options={CURRENCIES} onSelect={f.setCurrency} />
            </View>
          </View>

          <BillingPeriodSelector value={f.period} onChange={f.setPeriod} />

          <Dropdown label="Payment Method (Optional)" value={f.method} placeholder="Select method" options={PAYMENT_METHODS} onSelect={f.setMethod} />

          {/* Free trial */}
          <View className="flex-row items-center justify-between bg-[#F6F1FD] border border-[#E5E7EB] rounded-2xl px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className="text-[14px] font-semibold text-[#111827]">Free trial mode</Text>
              <Text className="text-[12px] text-[#9CA3AF] mt-0.5">Do not calculate cost until trial ends</Text>
            </View>
            <Switch value={f.freeTrial} onValueChange={f.setFreeTrial} trackColor={{ false: '#E5E7EB', true: '#7C4DFF' }} thumbColor="#FFFFFF" />
          </View>
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="absolute left-0 right-0 bottom-0 px-6 bg-[#F0EBFF]" style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={f.submit}
          disabled={f.loading}
          activeOpacity={0.9}
          className="h-14 rounded-[28px] bg-[#7C4DFF] flex-row items-center justify-center"
          style={{ opacity: f.loading ? 0.7 : 1, shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 }}
        >
          {f.loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text className="text-white text-[18px] font-semibold ml-1">Add Subscription</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

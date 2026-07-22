import { View, Text, TextInput, Switch } from 'react-native'
import { router } from 'expo-router'
import { CURRENCIES, FREE_CURRENCIES, PAYMENT_METHODS, isCurrencyLocked } from '@/constants/subscriptionOptions'
import { useProfileStore } from '@/store/profileStore'
import type { useSubscriptionForm } from '@/hooks/useSubscriptionForm'
import Dropdown from '@/components/subscription/Dropdown'
import BillingPeriodSelector from '@/components/subscription/BillingPeriodSelector'
import LabeledInput from '@/components/subscription/LabeledInput'
import DateField from '@/components/subscription/DateField'

interface SubscriptionFormFieldsProps {
  f: ReturnType<typeof useSubscriptionForm>
}

export default function SubscriptionFormFields({ f }: SubscriptionFormFieldsProps) {
  const isPremium = useProfileStore((s) => s.is_premium)
  const lockedCurrencies = isPremium ? [] : CURRENCIES.filter((c) => !FREE_CURRENCIES.includes(c))
  return (
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
          <Dropdown
            label="Currency"
            value={f.currency}
            placeholder="EUR"
            options={CURRENCIES}
            lockedValues={lockedCurrencies}
            onSelect={(v) => (isCurrencyLocked(v, isPremium) ? router.push('/paywall' as any) : f.setCurrency(v))}
          />
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
  )
}

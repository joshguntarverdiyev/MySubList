import { View, Text, TouchableOpacity } from 'react-native'
import { BILLING_PERIODS, type BillingPeriod } from '@/constants/subscriptionOptions'

interface BillingPeriodSelectorProps {
  value: BillingPeriod
  onChange: (value: BillingPeriod) => void
}

export default function BillingPeriodSelector({ value, onChange }: BillingPeriodSelectorProps) {
  return (
    <View>
      <Text className="text-[14px] font-semibold text-[#111827] mb-2">Billing Period</Text>
      <View className="flex-row justify-between">
        {BILLING_PERIODS.map((period) => {
          const selected = period.value === value
          return (
            <TouchableOpacity
              key={period.value}
              activeOpacity={0.8}
              onPress={() => onChange(period.value)}
              className={`h-[34px] px-3 rounded-xl border items-center justify-center ${
                selected ? 'bg-[#F5F1FD] border-[#7C4DFF]' : 'bg-white border-[#DAD5E8]'
              }`}
            >
              <Text
                className={`text-[12px] font-medium ${selected ? 'text-[#7C4DFF]' : 'text-[#111827]'}`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

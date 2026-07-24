import { View, Text } from 'react-native'
import { MotiView } from 'moti'
import type { Subscription } from '@/types/subscription'
import type { Rates } from '@/utils/analytics'
import { monthlyCost } from '@/utils/analytics'
import { formatCurrency } from '@/utils/currency'
import BrandLogo from '@/components/subscription/BrandLogo'

const RANK_COLORS = ['#FFC107', '#9CA3AF', '#D97706']

interface Props {
  subs: Subscription[]
  currency: string
  rates: Rates
}

export default function TopSpenders({ subs, currency, rates }: Props) {
  if (subs.length === 0) return null
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 240 }}
      className="mx-6 mt-4 rounded-2xl bg-white p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }}
    >
      <Text className="mb-4 text-[16px] font-bold text-[#1A1A2E]">Your Top Spenders</Text>
      <View className="gap-y-3">
        {subs.map((sub, i) => (
          <View key={sub.id} className="flex-row items-center">
            <View
              className="mr-3 h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: RANK_COLORS[i] ?? '#9CA3AF' }}
            >
              <Text className="text-[12px] font-bold text-white">{i + 1}</Text>
            </View>
            <BrandLogo brandKey={sub.brand_key} name={sub.name} color={sub.color} size={38} radius={10} />
            <Text className="ml-3 flex-1 text-[15px] font-semibold text-[#1A1A2E]" numberOfLines={1}>
              {sub.name}
            </Text>
            <Text className="text-[15px] font-bold text-[#1A1A2E]">
              {formatCurrency(monthlyCost(sub, currency, rates), currency)}/mo
            </Text>
          </View>
        ))}
      </View>
    </MotiView>
  )
}

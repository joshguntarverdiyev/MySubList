import { Pressable, View, Text } from 'react-native'
import { MotiView } from 'moti'

interface Props {
  label: string
  priceString: string
  period: string
  selected: boolean
  onPress: () => void
  bestValue?: boolean
  savings?: string
  loading?: boolean
}

/** Selectable plan card (monthly / yearly) with skeleton loading state. */
export default function PlanCard({
  label,
  priceString,
  period,
  selected,
  onPress,
  bestValue,
  savings,
  loading,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`flex-1 rounded-xl px-3 py-4 ${
        selected ? 'border-2 border-[#6C47D9] bg-[#F5F3FF]' : 'border border-[#E5E7EB] bg-white'
      }`}
    >
      {bestValue ? (
        <View className="absolute -top-2 right-2 rounded-full bg-[#6C47D9] px-2 py-0.5">
          <Text className="text-[9px] font-bold uppercase text-white">Best Value</Text>
        </View>
      ) : null}

      <Text className="text-[15px] font-bold text-[#1A1A2E]">{label}</Text>

      {loading ? (
        <MotiView
          from={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ loop: true, type: 'timing', duration: 700 }}
          className="mt-2 h-6 w-16 rounded bg-[#E5E7EB]"
        />
      ) : (
        <Text className="mt-2 text-[20px] font-bold text-[#1A1A2E]">{priceString}</Text>
      )}

      <Text className="mt-0.5 text-[12px] text-[#6B7280]">{period}</Text>
      {savings ? (
        <Text className="mt-1 text-[12px] font-bold text-[#10B981]">{savings}</Text>
      ) : null}
    </Pressable>
  )
}

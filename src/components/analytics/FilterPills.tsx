import { View, Text, Pressable } from 'react-native'
import type { Period } from '@/utils/analytics'

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

interface Props {
  value: Period
  onChange: (p: Period) => void
}

export default function FilterPills({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-x-2">
      {OPTIONS.map((o) => {
        const selected = o.value === value
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className={`rounded-full px-3 py-1.5 ${
              selected ? 'bg-[#6C47D9]' : 'border border-[#E5E7EB] bg-white'
            }`}
          >
            <Text className={`text-[12px] font-semibold ${selected ? 'text-white' : 'text-[#6B7280]'}`}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

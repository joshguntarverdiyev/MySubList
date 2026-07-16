import { View, Text, TouchableOpacity } from 'react-native'

const CHIPS = ['Renewing soon', 'Monthly spend', 'Potential savings'] as const

interface Props {
  onSelect: (label: string) => void
  disabled?: boolean
}

export default function QuickActionChips({ onSelect, disabled }: Props) {
  return (
    <View className="flex-row justify-between px-6 pb-2 pt-1">
      {CHIPS.map((label) => (
        <TouchableOpacity
          key={label}
          disabled={disabled}
          onPress={() => onSelect(label)}
          className="flex-1 items-center justify-center rounded-xl border border-[#E6D9FF] bg-white py-2.5"
          style={{ marginHorizontal: 4 }}
        >
          <Text className="text-[11px] font-semibold text-[#7C4DFF]">{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

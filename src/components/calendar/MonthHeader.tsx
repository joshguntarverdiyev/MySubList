import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'

interface MonthHeaderProps {
  month: Date
  onPrev: () => void
  onNext: () => void
}

export default function MonthHeader({ month, onPrev, onNext }: MonthHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <TouchableOpacity onPress={onPrev} hitSlop={10} activeOpacity={0.6}>
        <Ionicons name="chevron-back-outline" size={22} color="#7C4DFF" />
      </TouchableOpacity>
      <Text className="text-[18px] font-bold text-[#1A1A2E]">
        {format(month, 'MMMM yyyy')}
      </Text>
      <TouchableOpacity onPress={onNext} hitSlop={10} activeOpacity={0.6}>
        <Ionicons name="chevron-forward-outline" size={22} color="#7C4DFF" />
      </TouchableOpacity>
    </View>
  )
}

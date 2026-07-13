import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DetailRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
  isLast?: boolean
}

export default function DetailRow({ icon, label, value, isLast }: DetailRowProps) {
  return (
    <View>
      <View className="flex-row items-center px-4 py-3.5">
        <View className="w-10 h-10 rounded-full bg-[#EDE9F8] items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#7C4DFF" />
        </View>
        <View className="flex-1">
          <Text className="text-[13px] text-[#667085]">{label}</Text>
          <Text className="text-[13px] font-semibold text-[#111827] mt-0.5">{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      </View>
      {!isLast ? <View className="h-px bg-[#F0EBFF] mx-4" /> : null}
    </View>
  )
}

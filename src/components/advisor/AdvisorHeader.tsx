import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BlinkingMascot from './BlinkingMascot'

interface Props {
  onClose: () => void
}

export default function AdvisorHeader({ onClose }: Props) {
  return (
    <View className="flex-row items-center px-6 pb-3 pt-2">
      <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-[#EDE9F8]">
        <BlinkingMascot size={54} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-xl font-bold text-[#1A1A2E]">AI Advisor</Text>
        <View className="mt-0.5 flex-row items-center">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-[#10B981]" />
          <Text className="text-xs font-medium text-[#444952]">
            Your subscription assistant
          </Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        className="h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
        style={{
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 3,
        }}
      >
        <Ionicons name="close" size={22} color="#7C4DFF" />
      </TouchableOpacity>
    </View>
  )
}

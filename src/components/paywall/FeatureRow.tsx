import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  title: string
  subtitle: string
}

/** Single premium feature line: check icon + title over subtitle. */
export default function FeatureRow({ title, subtitle }: Props) {
  return (
    <View className="flex-row items-start">
      <Ionicons name="checkmark-circle" size={22} color="#6C47D9" />
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold text-[#1A1A2E]">{title}</Text>
        <Text className="mt-0.5 text-[13px] text-[#6B7280]">{subtitle}</Text>
      </View>
    </View>
  )
}

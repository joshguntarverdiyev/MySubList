import { TouchableOpacity, View, Text } from 'react-native'
import type { Service } from '@/constants/services'

interface ServiceCardProps {
  service: Service
  onPress: () => void
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-[78px] h-[92px] bg-white rounded-xl border border-[#EFE9FF] items-center justify-center mb-3"
    >
      {/* Colored-initial logo (swap for PNG later) */}
      <View
        className="w-[50px] h-[50px] rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: service.color }}
      >
        <Text className="text-white text-[20px] font-bold">{service.initial}</Text>
      </View>
      <Text className="text-[12px] text-[#111827]" numberOfLines={1}>
        {service.name}
      </Text>
    </TouchableOpacity>
  )
}

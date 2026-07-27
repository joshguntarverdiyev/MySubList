import { memo } from 'react'
import { TouchableOpacity, Text } from 'react-native'
import type { Service } from '@/constants/services'
import BrandLogo from '@/components/subscription/BrandLogo'

interface ServiceCardProps {
  service: Service
  onPress: () => void
}

function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-[78px] h-[92px] bg-white rounded-xl border border-[#EFE9FF] items-center justify-center mb-3"
    >
      <BrandLogo brandKey={service.brandKey} name={service.name} color={service.color} size={50} />
      <Text className="mt-2 text-[12px] text-[#111827]" numberOfLines={1}>
        {service.name}
      </Text>
    </TouchableOpacity>
  )
}

export default memo(ServiceCard)

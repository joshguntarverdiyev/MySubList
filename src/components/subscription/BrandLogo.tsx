import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { getBrandVisual } from '@/utils/brand'

interface Props {
  brandKey: string | null
  name: string
  color?: string | null
  size?: number
  radius?: number
}

/** Brand logo image when available, else a colored badge with the initial. */
export default function BrandLogo({ brandKey, name, color, size = 50, radius }: Props) {
  const v = getBrandVisual(brandKey, name, color)
  const br = radius ?? Math.round(size * 0.28)

  if (v.logo) {
    return (
      <Image
        source={v.logo}
        style={{ width: size, height: size, borderRadius: br, backgroundColor: '#FFFFFF' }}
        contentFit="contain"
        transition={120}
      />
    )
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: br,
        backgroundColor: v.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: Math.round(size * 0.42) }}>
        {v.initial}
      </Text>
    </View>
  )
}

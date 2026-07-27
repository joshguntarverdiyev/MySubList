import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  topInset: number
}

/** Purple gradient hero with sparkles icon and Pro title. */
export default function HeroSection({ topInset }: Props) {
  return (
    <LinearGradient
      colors={['#7C4DFF', '#8B5CF6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ paddingTop: topInset + 56, paddingBottom: 32 }}
    >
      <View className="items-center px-6">
        <Ionicons name="sparkles" size={48} color="#FFFFFF" />
        <Text className="mt-3 text-center text-[28px] font-bold text-white">
          MySubList Pro
        </Text>
        <Text className="mt-1 text-center text-[15px] text-white/85">
          Take full control of your subscriptions
        </Text>
      </View>
    </LinearGradient>
  )
}

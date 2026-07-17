import { View } from 'react-native'
import { Image } from 'expo-image'
import { MotiView } from 'moti'

const mascot = require('../../../assets/ai-screen/ai-mascot-tight.png')

function Dot({ delay }: { delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0.3, translateY: 0 }}
      animate={{ opacity: 1, translateY: -3 }}
      transition={{ type: 'timing', duration: 400, loop: true, delay, repeatReverse: true }}
      className="mx-0.5 h-2 w-2 rounded-full bg-[#7C4DFF]"
    />
  )
}

export default function TypingIndicator() {
  return (
    <View className="mb-4 flex-row items-end px-6">
      <View className="mr-2 h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EDE9F8]">
        <Image source={mascot} style={{ width: 34, height: 34 }} contentFit="contain" />
      </View>
      <View className="flex-row items-center rounded-[20px] bg-[#F5F1FF] px-4 py-4">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  )
}

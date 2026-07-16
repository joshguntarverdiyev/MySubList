import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import type { ChatMessage } from '@/types/message'

const mascot = require('../../../assets/ai-screen/ai-mascot.png')

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const time = safeTime(message.created_at)

  if (isUser) {
    return (
      <View className="mb-4 flex-row items-end justify-end px-6">
        <View className="max-w-[78%] rounded-[20px] bg-[#7C4DFF] px-4 py-3">
          <Text className="text-[15px] leading-5 text-white">{message.content}</Text>
          <View className="mt-1 flex-row items-center justify-end">
            <Text className="text-[11px] text-white/80">{time}</Text>
            {message.status !== 'error' && (
              <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.8)" style={{ marginLeft: 3 }} />
            )}
          </View>
        </View>
        <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-[#EDE9F8]">
          <Ionicons name="person" size={16} color="#7C4DFF" />
        </View>
      </View>
    )
  }

  return (
    <View className="mb-4 flex-row items-end px-6">
      <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-[#EDE9F8]">
        <Image source={mascot} style={{ width: 26, height: 26 }} contentFit="contain" />
      </View>
      <View className="max-w-[78%] rounded-[20px] bg-[#F5F1FF] px-4 py-3">
        <Text className="text-[15px] leading-5 text-[#1A1A2E]">{message.content}</Text>
        <Text className="mt-1 text-[11px] text-[#9CA3AF]">{time}</Text>
      </View>
    </View>
  )
}

function safeTime(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : format(d, 'HH:mm')
}

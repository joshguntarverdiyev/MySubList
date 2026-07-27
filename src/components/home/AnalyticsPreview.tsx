import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

/** One pulsing mini bar. */
function Bar({ delay }: { delay: number }) {
  return (
    <MotiView
      from={{ height: 7 }}
      animate={{ height: 18 }}
      transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 700, delay }}
      style={{ width: 3.5, borderRadius: 2, backgroundColor: '#7C4DFF' }}
    />
  )
}

export default function AnalyticsPreview() {
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPress={() => router.push('/analytics')}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className="mx-6"
    >
      <MotiView animate={{ scale: pressed ? 0.97 : 1 }} transition={{ type: 'spring', damping: 15 }}>
        {/* Animated gradient border: base gradient + cross-fading overlay */}
        <View className="overflow-hidden rounded-2xl p-[1.5px]">
          <LinearGradient
            colors={['#7C4DFF', '#EC4899', '#7C4DFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 2200 }}
            style={StyleSheet.absoluteFill}
          >
            <LinearGradient colors={['#EC4899', '#7C4DFF', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
          </MotiView>

          {/* Inner white card */}
          <View className="flex-row items-center rounded-[15px] bg-white px-4 py-3.5">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9F8]">
              <Ionicons name="stats-chart-outline" size={22} color="#7C4DFF" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-[#1A1A2E]">View Analytics</Text>
              <Text className="text-[11px] text-[#6B7280]">Tap to see your spending insights</Text>
            </View>
            <View className="mr-2 flex-row items-end gap-x-1" style={{ height: 20 }}>
              <Bar delay={0} />
              <Bar delay={140} />
              <Bar delay={280} />
              <Bar delay={420} />
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </View>
        </View>
      </MotiView>
    </Pressable>
  )
}

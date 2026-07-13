import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-10 py-20">
      <View className="w-16 h-16 rounded-full bg-[#EDE9F8] items-center justify-center mb-5">
        <Ionicons name="albums-outline" size={30} color="#7C4DFF" />
      </View>
      <Text className="text-[18px] font-bold text-[#1A1A2E] text-center mb-1">
        No subscriptions yet
      </Text>
      <Text className="text-[15px] text-[#6B7280] text-center mb-6">
        Add your first subscription to start tracking your spending.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/subscription/add' as any)}
        activeOpacity={0.9}
        className="h-12 px-6 rounded-full bg-[#7C4DFF] flex-row items-center justify-center"
        style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 6 }}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text className="text-white text-[15px] font-semibold ml-1">Add your first subscription</Text>
      </TouchableOpacity>
    </View>
  )
}

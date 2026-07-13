import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import SpendCard from '@/components/home/SpendCard'
import SavingsCard from '@/components/home/SavingsCard'
import UpcomingPayments from '@/components/home/UpcomingPayments'
import SubscriptionRow, { SubscriptionItem } from '@/components/home/SubscriptionRow'

const SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: '1', name: 'Google One',    category: 'Storage',   price: '€19.99', period: 'yearly',  color: '#4285F4', initial: 'G' },
  { id: '2', name: 'Amazon Prime',  category: 'Shopping',  price: '€12.00', period: 'month',   color: '#00A8E0', initial: 'A' },
  { id: '3', name: 'Netflix',       category: 'Streaming', price: '€6.99',  period: 'weekly',  color: '#E50914', initial: 'N' },
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-6">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 40, height: 40, borderRadius: 10, marginRight: 8 }}
              contentFit="cover"
            />
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A2E' }}>
              My<Text style={{ color: '#7C4DFF' }}>SubList</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/subscription/add' as any)}
            className="w-10 h-10 rounded-full bg-[#7C4DFF] items-center justify-center"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Total Spend Card */}
        <SpendCard />

        {/* Potential Savings Card */}
        <View className="mt-4">
          <SavingsCard />
        </View>

        {/* Upcoming Payments */}
        <View className="mt-6">
          <UpcomingPayments />
        </View>

        {/* All Subscriptions */}
        <View className="mt-6 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[20px] font-bold text-[#1A1A2E]">All Subscriptions</Text>
            <TouchableOpacity>
              <Text className="text-[15px] font-semibold text-[#7C4DFF]">See all</Text>
            </TouchableOpacity>
          </View>
          <View
            className="bg-white rounded-[22px] overflow-hidden"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
          >
            {SUBSCRIPTIONS.map((item, index) => (
              <SubscriptionRow
                key={item.id}
                item={item}
                isLast={index === SUBSCRIPTIONS.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

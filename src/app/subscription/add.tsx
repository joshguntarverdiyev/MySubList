import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { POPULAR_SERVICES, type Service } from '@/constants/services'
import ServiceCard from '@/components/subscription/ServiceCard'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'

const FREE_SUB_LIMIT = 5

export default function AddSubscription() {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  // Free tier caps active subscriptions; over the limit we send the user to the
  // paywall instead of the add form. Enforced server-side too — this is UX only.
  const isPremium = useProfileStore((s) => s.is_premium)
  const activeCount = useSubscriptionStore((s) => s.subscriptions.length)
  const blocked = !isPremium && activeCount >= FREE_SUB_LIMIT

  useEffect(() => {
    if (blocked) router.replace('/paywall' as any)
  }, [blocked])

  if (blocked) return null

  const q = query.trim().toLowerCase()
  const filtered = POPULAR_SERVICES.filter((s) => s.name.toLowerCase().includes(q))
  const categories = Array.from(new Set(POPULAR_SERVICES.map((s) => s.category)))

  const openNew = (service?: Service) => {
    if (service) {
      router.push({
        pathname: '/subscription/new',
        params: { name: service.name, brandKey: service.brandKey },
      } as any)
    } else {
      router.push('/subscription/new' as any)
    }
  }

  return (
    <View className="flex-1 bg-[#F0EBFF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between px-6 mb-5">
          <View className="flex-1 pr-4">
            <Text className="text-[32px] font-bold text-[#111827] tracking-tight">
              Add Subscription
            </Text>
            <Text className="text-[15px] text-[#6B7280] mt-1">
              Search a service or add it manually.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="w-11 h-11 rounded-[18px] bg-white border border-[#EFE9FF] items-center justify-center mt-1"
            style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          className="flex-row items-center bg-white rounded-[18px] mx-6 px-4 h-[58px] mb-7"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
        >
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search service"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-[16px] text-[#111827]"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {/* Search results: flat grid. Otherwise: grouped by category. */}
        {q ? (
          filtered.length > 0 ? (
            <>
              <Text className="px-6 mb-4 text-[22px] font-bold text-[#111827]">Results</Text>
              <View className="flex-row flex-wrap px-6 gap-x-3">
                {filtered.map((service) => (
                  <ServiceCard key={service.brandKey} service={service} onPress={() => openNew(service)} />
                ))}
              </View>
            </>
          ) : (
            <View className="items-center py-10">
              <Text className="text-[15px] text-[#9CA3AF]">No services found</Text>
            </View>
          )
        ) : (
          categories.map((cat) => (
            <View key={cat} className="mb-2">
              <Text className="px-6 mb-3 text-[18px] font-bold text-[#111827]">{cat}</Text>
              <View className="flex-row flex-wrap px-6 gap-x-3 mb-2">
                {POPULAR_SERVICES.filter((s) => s.category === cat).map((service) => (
                  <ServiceCard key={service.brandKey} service={service} onPress={() => openNew(service)} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add manually button */}
      <View
        className="absolute left-0 right-0 bottom-0 px-6 bg-[#F0EBFF]"
        style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}
      >
        <TouchableOpacity
          onPress={() => openNew()}
          activeOpacity={0.9}
          className="h-14 rounded-[28px] bg-[#7C4DFF] flex-row items-center justify-center"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text className="text-white text-[18px] font-semibold ml-1">Add manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

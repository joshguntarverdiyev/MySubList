import { useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { POPULAR_SERVICES, type Service } from '@/constants/services'
import ServiceCard from '@/components/subscription/ServiceCard'

export default function AddSubscription() {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  const filtered = POPULAR_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  )

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

        {/* Popular services header */}
        <View className="flex-row items-center justify-between px-6 mb-4">
          <Text className="text-[22px] font-bold text-[#111827]">Popular services</Text>
          <TouchableOpacity>
            <Text className="text-[15px] font-semibold text-[#7C4DFF]">See all</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        {filtered.length > 0 ? (
          <View className="flex-row flex-wrap justify-between px-6">
            {filtered.map((service) => (
              <ServiceCard
                key={service.brandKey}
                service={service}
                onPress={() => openNew(service)}
              />
            ))}
          </View>
        ) : (
          <View className="items-center py-10">
            <Text className="text-[15px] text-[#9CA3AF]">No services found</Text>
          </View>
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

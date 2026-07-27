import { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, SectionList, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { POPULAR_SERVICES, type Service } from '@/constants/services'
import ServiceCard from '@/components/subscription/ServiceCard'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useProfileStore } from '@/store/profileStore'

const FREE_SUB_LIMIT = 5
const COLS = 4

// Split a flat service list into fixed-width rows so the SectionList can render
// a grid one virtualized row at a time (only on-screen cards mount/decode).
function chunk(arr: Service[], size: number): Service[][] {
  const rows: Service[][] = []
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size))
  return rows
}

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

  const q = query.trim().toLowerCase()

  // Search results = one flat "Results" section; otherwise one section per
  // category. Grouping/filtering only recomputes when the query changes.
  const sections = useMemo(() => {
    if (q) {
      const filtered = POPULAR_SERVICES.filter((s) => s.name.toLowerCase().includes(q))
      return filtered.length ? [{ title: 'Results', data: chunk(filtered, COLS) }] : []
    }
    const categories = Array.from(new Set(POPULAR_SERVICES.map((s) => s.category)))
    return categories.map((cat) => ({
      title: cat,
      data: chunk(POPULAR_SERVICES.filter((s) => s.category === cat), COLS),
    }))
  }, [q])

  if (blocked) return null

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
      {/* Fixed header: title + close + search (kept out of the list so the
          TextInput never loses focus as results re-render). */}
      <View style={{ paddingTop: insets.top + 12 }}>
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
            <Ionicons name="close" size={22} color="#7C4DFF" />
          </TouchableOpacity>
        </View>

        <View
          className="flex-row items-center bg-white rounded-[18px] mx-6 px-4 h-[58px] mb-4"
          style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 4 }}
        >
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search service"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 h-full text-[16px] text-[#111827]"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(row, i) => row[0]?.brandKey ?? String(i)}
        renderSectionHeader={({ section }) => (
          <Text className="px-6 mb-3 mt-2 text-[18px] font-bold text-[#111827]">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View className="flex-row px-6 gap-x-3">
            {item.map((service) => (
              <ServiceCard key={service.brandKey} service={service} onPress={() => openNew(service)} />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-[15px] text-[#9CA3AF]">No services found</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

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

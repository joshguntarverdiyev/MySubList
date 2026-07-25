import { Modal, View, Text, Pressable, ScrollView, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { InfoEntry } from '@/constants/legal'
import HelpContent from './HelpContent'

interface Props {
  visible: boolean
  entry: InfoEntry | null
  onClose: () => void
}

/** Sheet for Help Center + legal entries: plain body, or summary bullets with a link to the full doc. */
export default function InfoModal({ visible, entry, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[80%] rounded-t-3xl bg-white" style={{ paddingTop: 8 }}>
          <View className="mb-1 items-center">
            <View className="h-1 w-10 rounded-full bg-[#E5E0F5]" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-2">
            <Text className="text-[20px] font-bold text-[#111827]">{entry?.title ?? ''}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
              style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }}
            >
              <Ionicons name="close" size={22} color="#7C4DFF" />
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            {entry?.faqs ? (
              <HelpContent entry={entry} />
            ) : entry?.bullets ? (
              <View className="gap-y-3">
                {entry.bullets.map((b) => (
                  <View key={b} className="flex-row">
                    <Text className="mr-2 text-[15px] leading-6 text-[#7C4DFF]">•</Text>
                    <Text className="flex-1 text-[15px] leading-6 text-[#444952]">{b}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[15px] leading-6 text-[#444952]">{entry?.body ?? ''}</Text>
            )}

            {entry?.fullUrl ? (
              <View className="mt-6">
                <View className="h-px bg-[#ECE7F7]" />
                <Text
                  className="mt-4 text-center text-[15px] font-semibold text-[#7C4DFF] underline"
                  onPress={() => Linking.openURL(entry.fullUrl!)}
                >
                  {entry.fullLabel}
                </Text>
                {entry.lastUpdated ? (
                  <Text className="mt-2 text-center text-xs text-[#9CA3AF]">
                    Last updated: {entry.lastUpdated}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

import { Modal, View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible: boolean
  title: string
  body: string
  onClose: () => void
}

/** Full-height sheet for long-form text: Help Center, Terms, Privacy. */
export default function InfoModal({ visible, title, body, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="max-h-[80%] rounded-t-3xl bg-white"
          style={{ paddingTop: 8 }}
        >
          <View className="mb-1 items-center">
            <View className="h-1 w-10 rounded-full bg-[#E5E0F5]" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-2">
            <Text className="text-[20px] font-bold text-[#111827]">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full bg-[#F0EBFF]">
              <Ionicons name="close" size={18} color="#7C4DFF" />
            </Pressable>
          </View>
          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-[15px] leading-6 text-[#444952]">{body}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

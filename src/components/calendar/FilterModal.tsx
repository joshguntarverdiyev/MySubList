import { View, Text, TouchableOpacity, Pressable, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type CalendarFilter = 'all' | 'weekly' | 'monthly' | 'yearly' | 'trial'

const OPTIONS: { label: string; value: CalendarFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Trial', value: 'trial' },
]

interface FilterModalProps {
  visible: boolean
  active: CalendarFilter
  onSelect: (filter: CalendarFilter) => void
  onClose: () => void
}

export default function FilterModal({ visible, active, onSelect, onClose }: FilterModalProps) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable
          className="mt-auto bg-white rounded-t-[24px] px-6 pt-5"
          style={{ paddingBottom: insets.bottom + 16 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-bold text-[#1A1A2E]">Filter</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {OPTIONS.map((opt) => {
            const isActive = opt.value === active
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.7}
                onPress={() => { onSelect(opt.value); onClose() }}
                className="flex-row items-center justify-between py-3.5"
              >
                <Text
                  className="text-[16px]"
                  style={{ color: isActive ? '#7C4DFF' : '#1A1A2E', fontWeight: isActive ? '700' : '400' }}
                >
                  {opt.label}
                </Text>
                {isActive ? <Ionicons name="checkmark" size={20} color="#7C4DFF" /> : null}
              </TouchableOpacity>
            )
          })}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

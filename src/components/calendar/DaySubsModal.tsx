import { View, Text, TouchableOpacity, Pressable, Modal } from 'react-native'
import { router } from 'expo-router'
import { format, parseISO } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { getBrandVisual } from '@/utils/brand'

interface DaySubsModalProps {
  dateKey: string | null
  subs: Subscription[]
  onClose: () => void
}

export default function DaySubsModal({ dateKey, subs, onClose }: DaySubsModalProps) {
  const visible = dateKey !== null && subs.length > 0

  const open = (id: string) => {
    onClose()
    router.push(`/subscription/${id}` as any)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 items-center justify-center px-10" onPress={onClose}>
        <Pressable className="w-full bg-white rounded-[20px] px-5 py-4" onPress={(e) => e.stopPropagation()}>
          <Text className="text-[15px] font-bold text-[#1A1A2E] mb-1">
            {subs.length} renewals
          </Text>
          {dateKey ? (
            <Text className="text-[12px] text-[#6B7280] mb-3">{format(parseISO(dateKey), 'EEEE, MMM d')}</Text>
          ) : null}
          {subs.map((sub) => {
            const { color, initial } = getBrandVisual(sub.brand_key, sub.name, sub.color)
            return (
              <TouchableOpacity
                key={sub.id}
                activeOpacity={0.7}
                onPress={() => open(sub.id)}
                className="flex-row items-center py-2.5"
              >
                <View
                  className="w-9 h-9 rounded-[10px] items-center justify-center mr-3"
                  style={{ backgroundColor: color }}
                >
                  <Text className="text-white text-[15px] font-bold">{initial}</Text>
                </View>
                <Text className="flex-1 text-[15px] font-semibold text-[#1A1A2E]" numberOfLines={1}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

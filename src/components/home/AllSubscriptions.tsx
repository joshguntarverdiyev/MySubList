import { View, Text, TouchableOpacity, type LayoutChangeEvent } from 'react-native'
import SubscriptionRow, { type SubscriptionItem } from '@/components/home/SubscriptionRow'

interface Props {
  items: SubscriptionItem[]
  showAll: boolean
  canToggle: boolean
  onToggle: () => void
  onLayout: (e: LayoutChangeEvent) => void
}

/** The "All Subscriptions" section: heading with See all/less toggle + row list. */
export default function AllSubscriptions({ items, showAll, canToggle, onToggle, onLayout }: Props) {
  return (
    <View className="mt-6 px-6" onLayout={onLayout}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[20px] font-bold text-[#1A1A2E]">All Subscriptions</Text>
        {canToggle && (
          <TouchableOpacity onPress={onToggle}>
            <Text className="text-[15px] font-semibold text-[#7C4DFF]">
              {showAll ? 'See less' : 'See all'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        className="bg-white rounded-[22px] overflow-hidden"
        style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}
      >
        {items.map((item, index) => (
          <SubscriptionRow key={item.id} item={item} isLast={index === items.length - 1} />
        ))}
      </View>
    </View>
  )
}

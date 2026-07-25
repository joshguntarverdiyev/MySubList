import { Modal, View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export interface SheetOption<T> {
  label: string
  value: T
}

interface Props<T> {
  visible: boolean
  title: string
  options: SheetOption<T>[]
  selected: T
  onSelect: (value: T) => void
  onClose: () => void
  /** Values shown with a lock icon (still selectable — parent handles the gate). */
  lockedValues?: T[]
}

/** Themed bottom-sheet modal for single-select settings. */
export default function OptionSheet<T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  lockedValues,
}: Props<T>) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-white px-5 pt-2"
          style={{ paddingBottom: insets.bottom + 12 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-[#E5E0F5]" />
          </View>
          <Text className="mb-2 mt-1 text-center text-[16px] font-bold text-[#111827]">
            {title}
          </Text>

          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const active = opt.value === selected
              return (
                <Pressable
                  key={String(opt.value)}
                  onPress={() => onSelect(opt.value)}
                  className="flex-row items-center justify-between rounded-2xl px-4 py-4"
                  style={({ pressed }) => ({
                    backgroundColor: active ? '#F0EBFF' : pressed ? '#F7F3FD' : 'transparent',
                  })}
                >
                  <Text
                    className="text-[16px]"
                    style={{
                      color: active ? '#7C4DFF' : '#1A1A2E',
                      fontWeight: active ? '600' : '400',
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={20} color="#7C4DFF" />
                  ) : lockedValues?.includes(opt.value) ? (
                    <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                  ) : null}
                </Pressable>
              )
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

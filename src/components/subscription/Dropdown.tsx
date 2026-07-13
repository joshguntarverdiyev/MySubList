import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DropdownProps {
  label: string
  value: string | null
  placeholder: string
  options: readonly string[]
  onSelect: (value: string) => void
}

export default function Dropdown({ label, value, placeholder, options, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <View>
      <Text className="text-[14px] font-semibold text-[#111827] mb-2">{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between bg-white border border-[#DAD5E8] rounded-2xl h-[54px] px-4"
      >
        <Text className={value ? 'text-[16px] text-[#111827]' : 'text-[16px] text-[#9CA3AF]'}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/30 justify-center px-8"
        >
          <View className="bg-white rounded-2xl overflow-hidden">
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(opt)
                  setOpen(false)
                }}
                className={`px-5 py-4 ${i > 0 ? 'border-t border-[#F0EBFF]' : ''}`}
              >
                <Text className={opt === value ? 'text-[16px] font-semibold text-[#7C4DFF]' : 'text-[16px] text-[#111827]'}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

import { useState } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { formatDisplayDate } from '@/utils/renewal'

interface DateFieldProps {
  value: Date | null
  onChange: (date: Date) => void
  error?: string
}

export default function DateField({ value, onChange, error }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <View>
      <Text className="text-[14px] font-semibold text-[#111827] mb-2">Started Date</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowPicker(true)}
        className="flex-row items-center bg-white border border-[#DAD5E8] rounded-2xl h-[54px] px-4"
      >
        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
        <Text className={value ? 'ml-3 text-[16px] text-[#111827]' : 'ml-3 text-[16px] text-[#9CA3AF]'}>
          {value ? formatDisplayDate(value) : 'Select start date'}
        </Text>
      </TouchableOpacity>
      {error ? <Text className="text-[12px] text-[#EF4444] mt-1">{error}</Text> : null}
      {showPicker && (
        <View>
          <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              if (Platform.OS !== 'ios') setShowPicker(false)
              if (d) onChange(d)
            }}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={() => setShowPicker(false)} className="self-end px-2 py-1">
              <Text className="text-[15px] font-semibold text-[#7C4DFF]">Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

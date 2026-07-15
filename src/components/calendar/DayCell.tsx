import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { isSameDay, isBefore, startOfDay } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { getBrandVisual } from '@/utils/brand'
import { renewalKind, KIND_COLOR } from '@/utils/renewalDates'

interface DayCellProps {
  date: Date
  dateKey: string
  inMonth: boolean
  width: number
  subs: Subscription[]
}

const today = startOfDay(new Date())

export default function DayCell({ date, dateKey, inMonth, width, subs }: DayCellProps) {
  if (!inMonth) return <View style={{ width, minHeight: 58 }} />

  const isToday = isSameDay(date, today)
  const isPast = isBefore(date, today)
  const dow = date.getDay()
  const isWeekend = dow === 0 || dow === 6

  const numberColor = isPast ? '#9CA3AF' : isWeekend ? '#6B7280' : '#1A1A2E'
  const icons = subs.slice(0, 2)
  const extra = subs.length - icons.length
  const dots = subs.slice(0, 4)

  return (
    <View style={{ width, minHeight: 58 }} className="items-center pt-1">
      {isToday ? (
        <View className="w-9 h-9 rounded-full bg-[#7C4DFF] items-center justify-center">
          <Text className="text-white text-[13px] font-bold">{date.getDate()}</Text>
        </View>
      ) : (
        <Text className="text-[13px] font-medium h-9 leading-9" style={{ color: numberColor }}>
          {date.getDate()}
        </Text>
      )}

      {icons.length > 0 && (
        <View className="flex-row items-center mt-0.5">
          {icons.map((sub) => {
            const { color, initial } = getBrandVisual(sub.brand_key, sub.name, sub.color)
            return (
              <TouchableOpacity
                key={sub.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/subscription/${sub.id}` as any)}
                className="rounded-md items-center justify-center mx-[1px]"
                style={{ width: 16, height: 16, backgroundColor: color }}
              >
                <Text className="text-white text-[9px] font-bold">{initial}</Text>
              </TouchableOpacity>
            )
          })}
          {extra > 0 && (
            <View className="rounded-full bg-[#EDE9F8] px-1 mx-[1px] justify-center" style={{ height: 16 }}>
              <Text className="text-[9px] font-bold text-[#7C4DFF]">+{extra}</Text>
            </View>
          )}
        </View>
      )}

      {dots.length > 0 && (
        <View className="flex-row items-center mt-1">
          {dots.map((sub, i) => (
            <View
              key={`${sub.id}-${i}`}
              className="rounded-full mx-[1px]"
              style={{ width: 7, height: 7, backgroundColor: KIND_COLOR[renewalKind(sub, dateKey)] }}
            />
          ))}
        </View>
      )}
    </View>
  )
}

import { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { isSameDay, isBefore, startOfDay } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { renewalKind, KIND_COLOR } from '@/utils/renewalDates'
import BrandLogo from '@/components/subscription/BrandLogo'

interface DayCellProps {
  date: Date
  dateKey: string
  inMonth: boolean
  width: number
  subs: Subscription[]
  onShowDay: (dateKey: string, subs: Subscription[]) => void
}

const today = startOfDay(new Date())

function DayCell({ date, dateKey, inMonth, width, subs, onShowDay }: DayCellProps) {
  if (!inMonth) return <View style={{ width, minHeight: 58 }} />

  const isToday = isSameDay(date, today)
  const isPast = isBefore(date, today)
  const dow = date.getDay()
  const isWeekend = dow === 0 || dow === 6

  const numberColor = isPast ? '#9CA3AF' : isWeekend ? '#6B7280' : '#1A1A2E'
  const single = subs.length === 1 ? subs[0] : null
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

      {single ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/subscription/${single.id}`)}
          className="mt-0.5"
        >
          <BrandLogo brandKey={single.brand_key} name={single.name} color={single.color} size={20} radius={5} />
        </TouchableOpacity>
      ) : subs.length > 1 ? (
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={6}
          onPress={() => onShowDay(dateKey, subs)}
          className="rounded-full bg-[#EDE9F8] px-1.5 justify-center mt-0.5"
          style={{ height: 16 }}
        >
          <Text className="text-[9px] font-bold text-[#7C4DFF]">+{subs.length}</Text>
        </TouchableOpacity>
      ) : null}

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

export default memo(DayCell)

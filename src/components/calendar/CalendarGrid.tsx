import { useState } from 'react'
import { View, Text } from 'react-native'
import { addDays, format, getDay, startOfMonth, subDays } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import type { CalendarFilter } from './FilterModal'
import DayCell from './DayCell'

interface CalendarGridProps {
  month: Date
  firstDayOfWeek: number
  renewalMap: Map<string, Subscription[]>
  filter: CalendarFilter
  onShowDay: (dateKey: string, subs: Subscription[]) => void
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function matchesFilter(sub: Subscription, filter: CalendarFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'trial') return sub.is_free_trial
  return sub.billing_period === filter
}

export default function CalendarGrid({ month, firstDayOfWeek, renewalMap, filter, onShowDay }: CalendarGridProps) {
  const [gridWidth, setGridWidth] = useState(0)
  const cellWidth = gridWidth > 0 ? gridWidth / 7 : 0

  const monthStart = startOfMonth(month)
  const offset = (getDay(monthStart) - firstDayOfWeek + 7) % 7
  const gridStart = subDays(monthStart, offset)
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const labels = Array.from({ length: 7 }, (_, i) => DAY_LABELS[(firstDayOfWeek + i) % 7])
  // Only keep week rows that contain at least one day of the current month —
  // drops fully out-of-month trailing/leading weeks so the card isn't padded
  // with a blank row before the legend.
  const rows = Array.from({ length: 6 }, (_, r) => days.slice(r * 7, r * 7 + 7)).filter((week) =>
    week.some((d) => d.getMonth() === monthStart.getMonth())
  )

  return (
    <View onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
      {/* Day labels */}
      <View className="flex-row mb-1">
        {labels.map((label) => (
          <Text
            key={label}
            className="text-[11px] font-semibold text-[#6B7280] text-center"
            style={{ width: cellWidth }}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {cellWidth > 0 &&
        rows.map((week, ri) => (
          <View key={ri} className="flex-row">
            {week.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const inMonth = day.getMonth() === monthStart.getMonth()
              const subs = (renewalMap.get(key) ?? []).filter((s) => matchesFilter(s, filter))
              return (
                <DayCell
                  key={key}
                  date={day}
                  dateKey={key}
                  inMonth={inMonth}
                  width={cellWidth}
                  subs={subs}
                  onShowDay={onShowDay}
                />
              )
            })}
          </View>
        ))}
    </View>
  )
}

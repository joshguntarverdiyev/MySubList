import { View, Text, useWindowDimensions } from 'react-native'
import { MotiView } from 'moti'
import Svg, { Rect } from 'react-native-svg'
import type { TrendPoint } from '@/utils/analytics'

interface Props {
  data: TrendPoint[]
  color?: string
}

const CHART_H = 150

export default function SpendTrendChart({ data, color = '#6C47D9' }: Props) {
  const { width } = useWindowDimensions()
  const innerW = width - 88 // screen - mx-6 (48) - card p-5 (40)
  const max = Math.max(...data.map((d) => d.value), 0)
  const slot = data.length ? innerW / data.length : innerW
  const barW = Math.min(slot * 0.5, 28)

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 80 }}
      className="mx-6 mt-4 rounded-2xl bg-white p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }}
    >
      <Text className="mb-4 text-[16px] font-bold text-[#1A1A2E]">Spending Trend</Text>

      <Svg width={innerW} height={CHART_H}>
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * (CHART_H - 8) : 0
          const x = i * slot + (slot - barW) / 2
          return (
            <Rect
              key={i}
              x={x}
              y={CHART_H - h}
              width={barW}
              height={Math.max(h, 2)}
              rx={4}
              fill={d.value > 0 ? color : '#EDE9F8'}
            />
          )
        })}
      </Svg>

      <View className="mt-2 flex-row">
        {data.map((d, i) => (
          <Text key={i} className="flex-1 text-center text-[10px] text-[#9CA3AF]">
            {d.label}
          </Text>
        ))}
      </View>
    </MotiView>
  )
}

import { Text, useWindowDimensions } from 'react-native'
import { MotiView } from 'moti'
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg'
import { currencySymbol } from '@/utils/currency'
import type { TrendPoint } from '@/utils/analytics'

interface Props {
  data: TrendPoint[]
  currency: string
  color?: string
}

const CHART_H = 150
const LABEL_H = 22
const AXIS_W = 42

export default function SpendTrendChart({ data, currency, color = '#6C47D9' }: Props) {
  const { width } = useWindowDimensions()
  const innerW = width - 88 // screen - mx-6 (48) - card p-5 (40)
  const plotW = innerW - AXIS_W
  const max = Math.max(...data.map((d) => d.value), 0)
  const slot = data.length ? plotW / data.length : plotW
  const barW = Math.min(slot * 0.5, 28)
  const sym = currencySymbol(currency)
  const gridRows = [{ y: 0, v: max }, { y: CHART_H / 2, v: max / 2 }, { y: CHART_H, v: 0 }]

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 80 }}
      className="mx-6 mt-4 rounded-2xl bg-white p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }}
    >
      <Text className="mb-4 text-[16px] font-bold text-[#1A1A2E]">Spending Trend</Text>

      <Svg width={innerW} height={CHART_H + LABEL_H}>
        {/* Y-axis gridlines + amount labels */}
        {gridRows.flatMap((r, i) => [
          <Line key={`g${i}`} x1={AXIS_W} y1={r.y} x2={innerW} y2={r.y} stroke="#F0EBFF" strokeWidth={1} />,
          <SvgText key={`y${i}`} x={AXIS_W - 6} y={r.y + 3} fontSize={9} fill="#9CA3AF" textAnchor="end">
            {`${sym}${Math.round(r.v)}`}
          </SvgText>,
        ])}

        {/* Bars + centered x-axis labels */}
        {data.flatMap((d, i) => {
          const h = max > 0 ? (d.value / max) * (CHART_H - 8) : 0
          const cx = AXIS_W + i * slot + slot / 2
          return [
            <Rect key={`b${i}`} x={cx - barW / 2} y={CHART_H - h} width={barW} height={Math.max(h, 2)} rx={4} fill={d.value > 0 ? color : '#EDE9F8'} />,
            <SvgText key={`x${i}`} x={cx} y={CHART_H + 15} fontSize={10} fill="#9CA3AF" textAnchor="middle">{d.label}</SvgText>,
          ]
        })}
      </Svg>
    </MotiView>
  )
}

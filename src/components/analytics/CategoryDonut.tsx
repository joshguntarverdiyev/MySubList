import { View, Text } from 'react-native'
import { MotiView } from 'moti'
import Svg, { Circle, G } from 'react-native-svg'
import { formatCurrency } from '@/utils/currency'
import type { CategorySlice } from '@/utils/analytics'

interface Props {
  data: CategorySlice[]
  total: number
  currency: string
}

const SIZE = 200
const R = 80
const STROKE = 22
const CIRC = 2 * Math.PI * R

export default function CategoryDonut({ data, total, currency }: Props) {
  let offset = 0

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 160 }}
      className="mx-6 mt-4 rounded-2xl bg-white p-5"
      style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }}
    >
      <Text className="mb-4 text-[16px] font-bold text-[#1A1A2E]">Where Your Money Goes</Text>

      <View className="items-center">
        <View style={{ width: SIZE, height: SIZE }}>
          <Svg width={SIZE} height={SIZE}>
            <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#F0EBFF" strokeWidth={STROKE} fill="none" />
              {data.map((s) => {
                const len = (s.percentage / 100) * CIRC
                const el = (
                  <Circle
                    key={s.category}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    stroke={s.color}
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={`${len} ${CIRC - len}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                )
                offset += len
                return el
              })}
            </G>
          </Svg>
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-[22px] font-bold text-[#1A1A2E]">{formatCurrency(total, currency)}</Text>
            <Text className="text-[12px] text-[#6B7280]">Total</Text>
          </View>
        </View>
      </View>

      <View className="mt-5 gap-y-2.5">
        {data.map((s) => (
          <View key={s.category} className="flex-row items-center">
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <Text className="ml-2 flex-1 text-[14px] text-[#1A1A2E]">{s.category}</Text>
            <Text className="text-[14px] font-semibold text-[#6B7280]">{s.percentage.toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    </MotiView>
  )
}

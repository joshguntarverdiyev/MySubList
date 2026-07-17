import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface Props {
  icon: IconName
  label: string
  /** Grey text under the label (Support rows). */
  subtitle?: string
  /** Grey text on the right, before the chevron (Preference rows). */
  value?: string
  onPress?: () => void
  /** Show a bottom divider (all rows except the last in a card). */
  divider?: boolean
  labelColor?: string
  /** Icon container background (default light purple). */
  iconBg?: string
  /** Icon glyph color (default purple). */
  iconColor?: string
  /** Hide the right-hand chevron (e.g. action rows like Sign Out). */
  hideChevron?: boolean
}

export default function SettingsRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  divider = false,
  labelColor = '#111827',
  iconBg = '#EDE9F8',
  iconColor = '#7C4DFF',
  hideChevron = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-60"
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
    >
      <View className="flex-row items-center px-4 py-3.5">
        <View
          className="h-9 w-9 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-semibold" style={{ color: labelColor }}>
            {label}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-[13px] text-[#667085]">{subtitle}</Text>
          ) : null}
        </View>

        {value ? <Text className="mr-1.5 text-[13px] text-[#667085]">{value}</Text> : null}
        {!hideChevron && <Ionicons name="chevron-forward" size={18} color="#C4C4CF" />}
      </View>

      {divider ? <View className="ml-16 h-px bg-[#F0EBFF]" /> : null}
    </Pressable>
  )
}

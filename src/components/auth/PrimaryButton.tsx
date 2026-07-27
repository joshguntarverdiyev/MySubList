import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  /** Renders at 50% opacity (e.g. when a required checkbox isn't ticked). */
  dimmed?: boolean
  className?: string
}

/** Full-width 56px primary CTA used across the auth screens. */
export default function PrimaryButton({ label, onPress, loading, disabled, dimmed, className }: Props) {
  return (
    <TouchableOpacity
      className={`h-14 rounded-full bg-[#7C4DFF] items-center justify-center ${className ?? ''}`}
      style={{
        opacity: dimmed ? 0.5 : 1,
        shadowColor: '#7C4DFF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 8,
      }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-white text-lg font-semibold tracking-tight">{label}</Text>
      )}
    </TouchableOpacity>
  )
}

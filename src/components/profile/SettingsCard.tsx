import { View, Text } from 'react-native'

interface Props {
  title: string
  children: React.ReactNode
}

/** Section header + white rounded card wrapping a group of SettingsRows. */
export default function SettingsCard({ title, children }: Props) {
  return (
    <View className="mt-6">
      <Text className="mb-2 ml-1 text-[13px] font-semibold tracking-[0.5px] text-[#667085]">
        {title}
      </Text>
      <View
        className="rounded-3xl bg-white py-1"
        style={{
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 28,
          elevation: 4,
        }}
      >
        {children}
      </View>
    </View>
  )
}

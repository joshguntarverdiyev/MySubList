import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import SettingsCard from '@/components/profile/SettingsCard'
import SettingsRow from '@/components/profile/SettingsRow'

const soon = () => Alert.alert('Coming soon', 'This feature is coming in a future update.')

export default function AccountScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-[#F7F3FD]">
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center px-5 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons name="chevron-back" size={20} color="#1A1A2E" />
        </Pressable>
        <Text className="ml-3 text-[20px] font-bold text-[#111827]">Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <SettingsCard title="ACCOUNT">
          <SettingsRow icon="mail-outline" label="Email" divider onPress={soon} />
          <SettingsRow icon="lock-closed-outline" label="Change Password" divider onPress={soon} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy & Security" onPress={soon} />
        </SettingsCard>
      </ScrollView>
    </View>
  )
}

import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ProfileAvatar from './ProfileAvatar'

interface Props {
  fullName: string
  email: string
  avatarUrl: string | null
  isPremium: boolean
  uploading: boolean
  onPressCard: () => void
  onPressCamera: () => void
}

export default function ProfileCard({
  fullName,
  email,
  avatarUrl,
  isPremium,
  uploading,
  onPressCard,
  onPressCamera,
}: Props) {
  return (
    <Pressable
      onPress={onPressCard}
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
    >
      <View
        className="flex-row items-center rounded-3xl bg-white p-4"
        style={{
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 28,
          elevation: 4,
        }}
      >
        <View>
          <ProfileAvatar
            avatarUrl={avatarUrl}
            name={fullName}
            size={64}
            showCamera
            onPressCamera={onPressCamera}
          />
          {uploading && (
            <View className="absolute h-16 w-16 items-center justify-center rounded-full bg-black/30">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-bold text-[#111827]" numberOfLines={1}>
            {fullName || 'Your name'}
          </Text>
          <Text className="mt-0.5 text-[14px] text-[#667085]" numberOfLines={1}>
            {email}
          </Text>
          <View className="mt-2 flex-row">
            <View
              className={`flex-row items-center rounded-full px-2.5 py-1 ${
                isPremium ? 'bg-[#7C4DFF]' : 'bg-[#F0EBFF]'
              }`}
            >
              <Ionicons
                name="star"
                size={11}
                color={isPremium ? '#FFFFFF' : '#7C4DFF'}
              />
              <Text
                className={`ml-1 text-[13px] font-medium ${
                  isPremium ? 'text-white' : 'text-[#7C4DFF]'
                }`}
              >
                {isPremium ? 'Premium' : 'Free Plan'}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#C4C4CF" />
      </View>
    </Pressable>
  )
}

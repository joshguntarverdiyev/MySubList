import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { initials } from '@/utils/initials'

interface Props {
  avatarUrl?: string | null
  name?: string
  /** Diameter of the circle in px. */
  size?: number
  /** Show the purple camera badge on the bottom-right. */
  showCamera?: boolean
  onPressCamera?: () => void
}

/**
 * Circular avatar: shows the uploaded photo, or a purple circle with white
 * initials as a fallback. Reused in the profile card and advisor bubbles.
 */
export default function ProfileAvatar({
  avatarUrl,
  name = '',
  size = 72,
  showCamera = false,
  onPressCamera,
}: Props) {
  const initialsFontSize = Math.round(size * 0.4)
  const badgeSize = Math.round(size * 0.36)

  return (
    <View style={{ width: size, height: size }}>
      {avatarUrl ? (
        <Image
          source={avatarUrl}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View
          className="items-center justify-center bg-[#7C4DFF]"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        >
          <Text
            className="font-bold text-white"
            style={{ fontSize: initialsFontSize }}
          >
            {initials(name)}
          </Text>
        </View>
      )}

      {showCamera && (
        <Pressable
          onPress={onPressCamera}
          hitSlop={8}
          className="absolute items-center justify-center rounded-full border-2 border-white bg-[#7C4DFF]"
          style={{ width: badgeSize, height: badgeSize, right: -2, bottom: -2 }}
        >
          <Ionicons name="camera" size={Math.round(badgeSize * 0.55)} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  )
}

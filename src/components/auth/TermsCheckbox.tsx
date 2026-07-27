import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'

const TERMS_URL = 'https://mysublist.app/terms'
const PRIVACY_URL = 'https://mysublist.app/privacy'

interface Props {
  agreed: boolean
  onToggle: () => void
}

/** "I agree to the Terms / Privacy Policy" checkbox row for Sign Up. */
export default function TermsCheckbox({ agreed, onToggle }: Props) {
  return (
    <View className="flex-row items-center mt-1">
      <TouchableOpacity onPress={onToggle} hitSlop={8} activeOpacity={0.7}>
        {agreed
          ? <Ionicons name="checkbox" size={22} color="#7C4DFF" />
          : <Ionicons name="square-outline" size={22} color="#6B7280" />}
      </TouchableOpacity>
      <Text className="flex-1 ml-2.5 text-xs leading-5 text-[#1A1A2E]">
        I agree to the{' '}
        <Text className="text-[#7C4DFF] underline" onPress={() => Linking.openURL(TERMS_URL)}>
          Terms of Service
        </Text>
        {' '}and{' '}
        <Text className="text-[#7C4DFF] underline" onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  )
}

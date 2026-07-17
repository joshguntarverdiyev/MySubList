import { View, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  disabled?: boolean
}

export default function ChatInput({ value, onChangeText, onSend, disabled }: Props) {
  const canSend = value.trim().length > 0 && !disabled

  return (
    <View className="px-6 pb-2 pt-2">
      <View
        className="flex-row items-center rounded-[18px] border border-[#E6D9FF] bg-white pl-4 pr-1.5"
        style={{
          minHeight: 56,
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 2,
        }}
      >
        <TextInput
          className="flex-1 py-3 text-[15px] text-[#1A1A2E]"
          placeholder="Ask about your subscriptions..."
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => canSend && onSend()}
          editable={!disabled}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={!canSend}
          onPress={onSend}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#7C4DFF]"
          style={{ opacity: canSend ? 1 : 0.5 }}
        >
          {/* Ionicons "send" glyph leans down-left; nudge it to optically center. */}
          <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

import { ComponentProps } from 'react'
import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  label: string
  icon: ComponentProps<typeof Ionicons>['name']
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  error?: string
  secureTextEntry?: boolean
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoCorrect?: boolean
}

/** Labeled auth text field: icon + bordered input + error message. */
export default function AuthInput({
  label, icon, value, onChangeText, placeholder, error,
  secureTextEntry, keyboardType, autoCapitalize, autoCorrect,
}: Props) {
  return (
    <View>
      <Text className="text-sm font-semibold text-[#1A1A2E] mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center bg-white rounded-xl border px-4 h-[54px] ${
          error ? 'border-[#EF4444]' : 'border-[#DAD5E8]'
        }`}
      >
        <Ionicons name={icon} size={18} color="#7C4DFF" />
        <TextInput
          className="flex-1 ml-3 h-full text-[14px] text-[#1A1A2E]"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
      </View>
      {error ? <Text className="text-xs text-[#EF4444] mt-1">{error}</Text> : null}
    </View>
  )
}

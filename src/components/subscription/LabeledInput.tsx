import { View, Text, TextInput, type TextInputProps } from 'react-native'

interface LabeledInputProps extends TextInputProps {
  label: string
  error?: string
}

export default function LabeledInput({ label, error, ...inputProps }: LabeledInputProps) {
  return (
    <View>
      <Text className="text-[14px] font-semibold text-[#111827] mb-2">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className="bg-white border border-[#DAD5E8] rounded-2xl h-[54px] px-4 text-[16px] text-[#111827]"
        {...inputProps}
      />
      {error ? <Text className="text-[12px] text-[#EF4444] mt-1">{error}</Text> : null}
    </View>
  )
}

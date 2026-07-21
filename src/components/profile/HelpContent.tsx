import { useState } from 'react'
import { View, Text, Pressable, Linking } from 'react-native'
import { MotiView } from 'moti'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import type { InfoEntry } from '@/constants/legal'

interface Props {
  entry: InfoEntry
}

/** Help Center body: tappable contact emails + single-open FAQ accordion. */
export default function HelpContent({ entry }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const handleCopy = async (email: string) => {
    await Clipboard.setStringAsync(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <View>
      {/* Contact section */}
      <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Contact Us
      </Text>
      <View className="gap-y-3">
        {entry.contacts?.map((c) => (
          <View key={c.email} className="flex-row items-center">
            <Ionicons name="mail-outline" size={22} color="#7C4DFF" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] text-[#6B7280]">{c.label}</Text>
              <Text
                className="text-[15px] font-medium text-[#7C4DFF] underline"
                onPress={() => Linking.openURL(`mailto:${c.email}`)}
              >
                {c.email}
              </Text>
            </View>
            <Pressable onPress={() => handleCopy(c.email)} hitSlop={8} className="ml-2">
              {copiedEmail === c.email ? (
                <Ionicons name="checkmark-outline" size={18} color="#10B981" />
              ) : (
                <Ionicons name="copy-outline" size={18} color="#6B7280" />
              )}
            </Pressable>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View className="my-6 h-px bg-[#ECE7F7]" />

      {/* FAQ section */}
      <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        FAQ
      </Text>
      <View>
        {entry.faqs?.map((f, i) => {
          const open = openIndex === i
          return (
            <View key={f.q}>
              {i > 0 ? <View className="h-px bg-[#ECE7F7]" /> : null}
              <Pressable
                onPress={() => setOpenIndex(open ? null : i)}
                className="flex-row items-center py-3"
              >
                <Text className="flex-1 pr-3 text-[15px] font-bold text-[#1A1A2E]">
                  {f.q}
                </Text>
                <MotiView animate={{ rotate: open ? '180deg' : '0deg' }}>
                  <Ionicons name="chevron-down-outline" size={18} color="#6B7280" />
                </MotiView>
              </Pressable>
              {open ? (
                <Text className="pb-3 pt-1 text-[14px] leading-5 text-[#6B7280]">
                  {f.a}
                </Text>
              ) : null}
            </View>
          )
        })}
      </View>

      {/* Footer */}
      {entry.lastUpdated ? (
        <Text className="mt-6 text-center text-xs text-[#9CA3AF]">
          Last updated: {entry.lastUpdated}
        </Text>
      ) : null}
    </View>
  )
}

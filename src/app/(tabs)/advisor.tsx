import { useCallback, useEffect, useRef, useState } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useUserId } from '@/hooks/useUserId'
import { useProfileStore } from '@/store/profileStore'
import {
  loadRecentMessages,
  sendAdvisorMessage,
  DailyLimitError,
  ValidationError,
} from '@/services/aiAdvisor'
import type { ChatMessage } from '@/types/message'
import AdvisorHeader from '@/components/advisor/AdvisorHeader'
import MessageBubble from '@/components/advisor/MessageBubble'
import TypingIndicator from '@/components/advisor/TypingIndicator'
import QuickActionChips from '@/components/advisor/QuickActionChips'
import ChatInput from '@/components/advisor/ChatInput'

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your AI advisor. I can help you manage your subscriptions and save money.",
  created_at: new Date().toISOString(),
}

const FREE_LIMIT_MSG =
  "You've reached your 5 message daily limit. Upgrade to Premium for 50 AI messages per day."
const PRO_LIMIT_MSG = "You've reached today's message limit. Please try again tomorrow."
const ERROR_MSG = 'Something went wrong. Try again.'

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets()
  const userId = useUserId()
  const avatarUrl = useProfileStore((s) => s.avatar_url)
  const fullName = useProfileStore((s) => s.full_name)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const isPremium = useProfileStore((s) => s.is_premium)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
  }, [])

  useEffect(() => {
    if (!userId) return
    fetchProfile(userId)
    ;(async () => {
      try {
        const history = await loadRecentMessages(userId)
        // Always lead with the welcome bubble, then history in order.
        setMessages([WELCOME, ...history])
      } catch {
        // Keep the welcome message on load failure.
      } finally {
        scrollToEnd()
      }
    })()
  }, [userId, scrollToEnd, fetchProfile])

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', scrollToEnd)
    return () => sub.remove()
  }, [scrollToEnd])

  const appendAssistant = useCallback((content: string, id: string) => {
    setMessages((prev) => [
      ...prev,
      { id, role: 'assistant', content, created_at: new Date().toISOString() },
    ])
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || typing) return

      const now = Date.now()
      const userMsg: ChatMessage = {
        id: `local-${now}`,
        role: 'user',
        content: trimmed,
        created_at: new Date().toISOString(),
        status: 'sent',
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setTyping(true)
      scrollToEnd()

      try {
        const reply = await sendAdvisorMessage(trimmed)
        appendAssistant(reply, `ai-${now}`)
      } catch (err) {
        const isLimit = err instanceof DailyLimitError
        const content = isLimit
          ? (isPremium ? PRO_LIMIT_MSG : FREE_LIMIT_MSG)
          : err instanceof ValidationError
            ? err.message
            : ERROR_MSG
        appendAssistant(content, `err-${now}`)
        // Free users hitting the daily cap get the paywall (premium never 429s).
        if (isLimit && !isPremium) router.push('/paywall')
      } finally {
        setTyping(false)
        scrollToEnd()
      }
    },
    [typing, scrollToEnd, appendAssistant, isPremium],
  )

  // Auto-ask when opened via the Savings modal's "personalized tips" CTA.
  const { ask } = useLocalSearchParams<{ ask?: string }>()
  const autoAsked = useRef(false)
  useEffect(() => {
    if (ask && !autoAsked.current) {
      autoAsked.current = true
      send(String(ask))
    }
  }, [ask, send])

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FAFAFD]" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <AdvisorHeader onClose={() => router.back()} />
        <View className="h-px bg-[#EFE9FF]" />

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} avatarUrl={avatarUrl} userName={fullName} />
          ))}
          {typing && <TypingIndicator />}
        </ScrollView>

        <QuickActionChips onSelect={send} disabled={typing} />
        <ChatInput value={input} onChangeText={setInput} onSend={() => send(input)} disabled={typing} />
        <View style={{ height: insets.bottom }} />
      </View>
    </KeyboardAvoidingView>
  )
}

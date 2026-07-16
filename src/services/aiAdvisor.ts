import { supabase } from '@/lib/supabase'
import type { ChatMessage } from '@/types/message'

const HISTORY_LIMIT = 30

/** Thrown when the user hits the daily free-tier message limit (HTTP 429). */
export class DailyLimitError extends Error {
  constructor() {
    super('daily-limit')
    this.name = 'DailyLimitError'
  }
}

/** Loads the most recent messages for a user, oldest-first for display. */
export async function loadRecentMessages(userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error) throw error
  return (data ?? []).reverse() as ChatMessage[]
}

/** Sends a message to the ai-advisor Edge Function and returns the reply text. */
export async function sendAdvisorMessage(message: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-advisor', {
    body: { message },
  })

  if (error) {
    // supabase-js surfaces non-2xx as a FunctionsHttpError whose `context`
    // is the raw Response. Read the status so we can detect the daily limit.
    const res = (error as { context?: Response }).context
    const status = res?.status
    console.warn('[ai-advisor] request failed', { status, error })
    if (status === 429) throw new DailyLimitError()
    throw new Error('request-failed')
  }

  const reply = (data as { reply?: string })?.reply?.trim()
  if (!reply) throw new Error('empty-reply')
  return reply
}

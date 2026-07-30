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

/**
 * Thrown for 400 input-validation rejections (too long, empty, blocked
 * content). The message is the server's user-facing text and is safe to show.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
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
  const rows = (data ?? []) as ChatMessage[]
  // Display oldest-first. Tie-break equal timestamps so the user's message always
  // precedes the AI reply (legacy rows were batch-inserted with the same now()).
  // NB: 'assistant' < 'user' alphabetically, so we sort user first explicitly.
  return rows.sort(
    (a, b) =>
      a.created_at.localeCompare(b.created_at) ||
      (a.role === b.role ? 0 : a.role === 'user' ? -1 : 1),
  )
}

/** Sends a message to the ai-advisor Edge Function and returns the reply text. */
export async function sendAdvisorMessage(message: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-advisor', {
    body: { message },
  })

  if (error) {
    // supabase-js surfaces non-2xx as a FunctionsHttpError whose `context`
    // is the raw Response. Read the status (and body for 400s) to decide how
    // to present the failure.
    const res = (error as { context?: Response }).context
    const status = res?.status
    console.warn('[ai-advisor] request failed', { status, error })
    if (status === 429) throw new DailyLimitError()
    if (status === 400) {
      // Surface the server's validation message (safe, user-facing text).
      let serverMessage = ''
      try {
        const raw = await res?.text?.()
        const body = raw ? JSON.parse(raw) : undefined
        serverMessage = (body as { error?: string })?.error ?? ''
      } catch {
        serverMessage = ''
      }
      throw new ValidationError(serverMessage || 'Invalid message')
    }
    throw new Error('request-failed')
  }

  const reply = (data as { reply?: string })?.reply?.trim()
  if (!reply) throw new Error('empty-reply')
  return reply
}

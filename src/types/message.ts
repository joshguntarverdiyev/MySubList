export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  created_at: string
  /** Local-only UI state for optimistic/failed rows. */
  status?: 'sending' | 'sent' | 'error'
}

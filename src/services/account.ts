import { supabase } from '@/lib/supabase'

/**
 * Permanently deletes the current user's account and all their data.
 * The `delete_my_account` Postgres function (SECURITY DEFINER, scoped to
 * auth.uid()) atomically removes subscriptions, AI messages, the profile
 * row, and the auth.users record. Throws on failure.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
}

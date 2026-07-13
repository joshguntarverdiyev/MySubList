import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/** Returns the current authenticated user's id, or null while unknown. */
export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return userId
}

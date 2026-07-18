import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Subscription } from '@/types/subscription'
import { cancelRenewalReminder } from '@/services/notifications'

export function useSubscription(id: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!id) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single()
      if (!active) return
      if (error || !data) {
        setNotFound(true)
      } else {
        setSubscription(data as Subscription)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  const deleteSubscription = async (): Promise<boolean> => {
    if (!id) return false
    // Cancel the scheduled reminder before removing the row so it doesn't fire
    // for a subscription that no longer exists.
    if (subscription?.notification_id) {
      await cancelRenewalReminder(subscription.notification_id)
    }
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    return !error
  }

  return { subscription, loading, notFound, deleteSubscription }
}

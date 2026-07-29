import { useState } from 'react'
import { router } from 'expo-router'
import { endOfDay, format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { BillingPeriod } from '@/constants/subscriptionOptions'
import type { Subscription } from '@/types/subscription'
import { initialRenewalDate } from '@/utils/renewal'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { scheduleNewSubscriptionReminder, rescheduleRenewalReminder } from '@/services/notifications'

interface FormErrors {
  name?: string
  price?: string
  date?: string
  trialDate?: string
}

interface UseSubscriptionFormOptions {
  subscription?: Subscription
  initialName?: string
  initialCurrency?: string
  brandKey?: string
}

export function useSubscriptionForm(options: UseSubscriptionFormOptions = {}) {
  const { subscription, initialName, initialCurrency, brandKey } = options
  const isEdit = !!subscription

  const [name, setName] = useState(subscription?.name ?? initialName ?? '')
  const [plan, setPlan] = useState(subscription?.plan_name ?? '')
  const [startDate, setStartDate] = useState<Date | null>(
    subscription?.start_date ? parseISO(subscription.start_date) : null
  )
  const [price, setPrice] = useState(subscription ? String(subscription.price) : '')
  const [currency, setCurrency] = useState(subscription?.currency ?? initialCurrency ?? 'EUR')
  const [period, setPeriod] = useState<BillingPeriod>(subscription?.billing_period ?? 'monthly')
  const [method, setMethod] = useState<string | null>(subscription?.payment_method ?? null)
  const [freeTrial, setFreeTrial] = useState(subscription?.is_free_trial ?? false)
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(
    subscription?.trial_end_date ? parseISO(subscription.trial_end_date) : null
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  // Toggling the trial off clears its end date so we never persist a stale value.
  const handleFreeTrial = (on: boolean) => {
    setFreeTrial(on)
    if (!on) setTrialEndDate(null)
  }

  const submit = async () => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) next.price = 'Enter a valid price'
    if (!startDate) next.date = 'Start date is required'
    // A start date can't be in the future (end-of-today so "today" always passes).
    else if (startDate > endOfDay(new Date())) next.date = 'Start date cannot be in the future'
    if (freeTrial && !trialEndDate) next.trialDate = 'Please enter your trial end date'
    else if (freeTrial && trialEndDate && startDate && trialEndDate <= startDate)
      next.trialDate = 'Trial end date must be after the start date'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    setApiError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setApiError(`You must be signed in to ${isEdit ? 'edit' : 'add'} a subscription.`)
      setLoading(false)
      return
    }

    const fields = {
      name: name.trim(),
      plan_name: plan.trim() || null,
      price: parseFloat(price),
      currency,
      billing_period: period,
      start_date: format(startDate!, 'yyyy-MM-dd'),
      next_renewal_date: initialRenewalDate(startDate!, period),
      payment_method: method,
      is_free_trial: freeTrial,
      trial_end_date: freeTrial && trialEndDate ? format(trialEndDate, 'yyyy-MM-dd') : null,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', subscription!.id)
        .eq('user_id', user.id)
      if (error) {
        setLoading(false)
        setApiError('Could not save changes. Please try again.')
        return
      }
      // Reschedule the reminder with updated dates/price (carries old id to cancel).
      const notifId = await rescheduleRenewalReminder({ ...subscription!, ...fields })
      if (notifId !== subscription!.notification_id) {
        await supabase.from('subscriptions')
          .update({ notification_id: notifId })
          .eq('id', subscription!.id).eq('user_id', user.id)
      }
      setLoading(false)
      await useSubscriptionStore.getState().refreshSubscriptions(user.id)
      // Replace so the Details screen remounts and reloads with fresh data.
      router.replace(`/subscription/${subscription!.id}`)
      return
    }

    const { data: inserted, error } = await supabase
      .from('subscriptions')
      .insert({ ...fields, user_id: user.id, brand_key: brandKey || null, is_active: true })
      .select('*')
      .single()
    if (error || !inserted) {
      setLoading(false)
      // Server-side free-tier guard rejected the 6th sub — route to the paywall.
      if (error?.message?.includes('free-subscription-limit-reached')) {
        router.push('/paywall')
        return
      }
      setApiError('Could not save subscription. Please try again.')
      return
    }

    const newSub = inserted as Subscription
    const notifId = await scheduleNewSubscriptionReminder(newSub)
    if (notifId) {
      await supabase.from('subscriptions')
        .update({ notification_id: notifId })
        .eq('id', newSub.id).eq('user_id', user.id)
    }
    setLoading(false)
    // Dismiss the modal stack (new + add) back to the Home tab. dismissTo targets
    // tabs specifically so it can't overshoot Home down to a stale root screen
    // (e.g. a leftover sign-up verify-email) the way dismissAll would.
    router.dismissTo('/(tabs)')
  }

  return {
    name, setName, plan, setPlan, startDate, setStartDate,
    price, setPrice, currency, setCurrency, period, setPeriod,
    method, setMethod, freeTrial, setFreeTrial: handleFreeTrial,
    trialEndDate, setTrialEndDate,
    errors, apiError, loading, submit,
  }
}

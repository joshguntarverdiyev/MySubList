import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SignInFieldErrors {
  email?: string
  password?: string
}

/** State + validation + submit for the Sign In screen. */
export function useSignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const clearError = (field: keyof SignInFieldErrors) =>
    setFieldErrors((p) => ({ ...p, [field]: undefined }))

  function validate(): boolean {
    const errors: SignInFieldErrors = {}
    if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignIn() {
    setApiError('')
    if (!validate()) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      // Supabase returns this when the account exists but the email is unconfirmed.
      if (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) {
        setApiError('Please verify your email first. Check your inbox for our verification link.')
        return
      }
      setApiError('Invalid email or password. Please try again.')
      return
    }

    router.replace('/(tabs)')
  }

  return {
    email, setEmail, password, setPassword, fieldErrors, clearError,
    apiError, loading, handleSignIn,
  }
}

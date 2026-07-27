import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SignUpFieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

/** State + validation + submit for the Sign Up screen. */
export function useSignUpForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const clearError = (field: keyof SignUpFieldErrors) =>
    setFieldErrors((p) => ({ ...p, [field]: undefined }))

  function validate(): boolean {
    const errors: SignUpFieldErrors = {}
    if (!fullName.trim()) errors.fullName = 'Full name is required'
    if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignUp() {
    setApiError('')
    if (!validate()) return

    setLoading(true)
    const trimmedEmail = email.trim()
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: 'mysublist://confirmed',
      },
    })
    setLoading(false)

    if (error) {
      setApiError(error.message)
      return
    }

    // With "Confirm email" on, signUp returns no session until the user taps the
    // link — send them to verify. If confirmation is off, a session is present.
    if (data.session) {
      router.replace('/(tabs)')
    } else {
      router.replace({ pathname: '/(auth)/verify-email', params: { email: trimmedEmail } })
    }
  }

  return {
    fullName, setFullName, email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, fieldErrors, clearError,
    apiError, loading, agreed, setAgreed, handleSignUp,
  }
}

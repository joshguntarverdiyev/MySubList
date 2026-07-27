import { useAuthStore } from '@/store/authStore'

/**
 * Returns the current authenticated user's id, or null while unknown. Backed by
 * a single shared session listener (authStore) rather than one per screen.
 */
export function useUserId() {
  return useAuthStore((s) => s.userId)
}

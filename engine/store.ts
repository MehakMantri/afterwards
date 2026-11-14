import { useEffect, useState } from 'react'

// Everything the user types lives in localStorage and nowhere else.
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked: the app still works for this visit */
    }
  }, [key, value])
  return [value, setValue] as const
}

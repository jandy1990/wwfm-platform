import { useState, useEffect } from 'react'

/**
 * Debounce hook for search inputs
 *
 * Delays updating the debounced value until the input has stopped changing
 * for the specified delay period. Commonly used to avoid excessive API calls
 * or expensive computations during typing.
 *
 * @param value - The value to debounce (typically search query string)
 * @param delay - Delay in milliseconds (default: 150ms)
 * @returns The debounced value
 *
 * @example
 * const searchQuery = 'anxiety'
 * const debouncedQuery = useSearchDebounce(searchQuery, 150)
 * // debouncedQuery will update 150ms after user stops typing
 */
export function useSearchDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

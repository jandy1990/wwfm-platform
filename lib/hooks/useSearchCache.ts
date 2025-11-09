import { useRef, useCallback, useEffect } from 'react'

/**
 * Search cache hook with automatic expiry
 *
 * Provides an in-memory cache for search results with automatic cleanup
 * after the specified expiry time. Reduces redundant searches for the
 * same query.
 *
 * @param expiryMs - Cache expiry time in milliseconds (default: 5 minutes)
 * @returns Object with get, set, and clear cache methods
 *
 * @example
 * const cache = useSearchCache(300000) // 5 minute expiry
 * cache.set('anxiety', { suggestions: [...] })
 * const cached = cache.get('anxiety')
 */
export function useSearchCache<T>(expiryMs: number = 300000) {
  const cacheMap = useRef<Map<string, T>>(new Map())
  const timeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const set = useCallback((key: string, data: T) => {
    // Clear existing timeout for this key
    const existingTimeout = timeoutMap.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Store the data
    cacheMap.current.set(key, data)

    // Set new expiry timeout
    const timeout = setTimeout(() => {
      cacheMap.current.delete(key)
      timeoutMap.current.delete(key)
    }, expiryMs)

    timeoutMap.current.set(key, timeout)
  }, [expiryMs])

  const get = useCallback((key: string): T | undefined => {
    return cacheMap.current.get(key)
  }, [])

  const clear = useCallback(() => {
    // Clear all timeouts
    timeoutMap.current.forEach(timeout => clearTimeout(timeout))
    cacheMap.current.clear()
    timeoutMap.current.clear()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutMap.current.forEach(timeout => clearTimeout(timeout))
      cacheMap.current.clear()
      timeoutMap.current.clear()
    }
  }, [])

  return { get, set, clear }
}

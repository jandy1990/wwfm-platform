import { useState, useEffect, useRef, useCallback } from 'react'

// Types
export type Goal = {
  id: string
  title: string
  is_approved: boolean
}

export type Category = {
  id: string
  name: string
  slug: string
  goals?: Goal[]
}

export type Arena = {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  categories?: Category[]
}

export type SearchSuggestion = {
  goal: Goal
  category: Category
  arena: Arena
  score: number
}

type SearchCacheEntry = {
  suggestions: SearchSuggestion[]
}

// Debounce hook
function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export interface UseGoalSearchOptions {
  arenas: Arena[]
  maxResults?: number
  debounceMs?: number
  cacheExpiryMs?: number
}

export interface UseGoalSearchReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean
  showDropdown: boolean
  setShowDropdown: (show: boolean) => void
  suggestions: SearchSuggestion[]
  clearSearch: () => void
  searchContainerRef: React.RefObject<HTMLDivElement>
}

export function useGoalSearch({
  arenas,
  maxResults = 10,
  debounceMs = 150,
  cacheExpiryMs = 300000
}: UseGoalSearchOptions): UseGoalSearchReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const debouncedSearch = useDebounce(searchQuery, debounceMs)

  // Search cache to avoid repeated filtering
  const searchCache = useRef<Map<string, SearchCacheEntry>>(new Map())
  const cacheTimeout = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Helper to manage cache with expiry
  const setCacheWithExpiry = useCallback((
    key: string,
    data: SearchCacheEntry,
    expiryMs: number = cacheExpiryMs
  ) => {
    const existingTimeout = cacheTimeout.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    searchCache.current.set(key, data)

    const timeout = setTimeout(() => {
      searchCache.current.delete(key)
      cacheTimeout.current.delete(key)
    }, expiryMs)

    cacheTimeout.current.set(key, timeout)
  }, [cacheExpiryMs])

  // Search goals with smart scoring
  useEffect(() => {
    const trimmedSearch = debouncedSearch.trim()

    if (!trimmedSearch) {
      setIsSearching(false)
      setShowDropdown(false)
      setSuggestions([])
      return
    }

    const cacheKey = trimmedSearch.toLowerCase()
    const cachedResult = searchCache.current.get(cacheKey)
    if (cachedResult) {
      setIsSearching(false)
      setSuggestions(cachedResult.suggestions)
      setShowDropdown(cachedResult.suggestions.length > 0)
      return
    }

    let cancelled = false

    const computeSuggestions = () => {
      const query = trimmedSearch.toLowerCase()
      const goalSuggestions: SearchSuggestion[] = []

      arenas.forEach(arena => {
        arena.categories?.forEach(category => {
          category.goals?.forEach(goal => {
            const titleLower = goal.title.toLowerCase()
            let score = 0

            if (titleLower === query) {
              score = 100
            } else if (titleLower.startsWith(query)) {
              score = 90
            } else if (titleLower.split(' ').some(word => word.startsWith(query))) {
              score = 80
            } else if (titleLower.includes(' ' + query)) {
              score = 70
            } else if (titleLower.includes(query)) {
              score = 60
            }

            const actionVerb = goal.title.split(' ')[0].toLowerCase()
            if (actionVerb === query) {
              score += 20
            }

            if (score > 0) {
              goalSuggestions.push({ goal, category, arena, score })
            }
          })
        })
      })

      goalSuggestions.sort((a, b) => b.score - a.score)
      const topSuggestions = goalSuggestions.slice(0, maxResults)

      if (!cancelled) {
        setSuggestions(topSuggestions)
        setShowDropdown(topSuggestions.length > 0)
        setIsSearching(false)
        setCacheWithExpiry(cacheKey, { suggestions: topSuggestions })
      }
    }

    setIsSearching(true)
    computeSuggestions()

    return () => {
      cancelled = true
    }
  }, [arenas, debouncedSearch, maxResults, searchQuery, setCacheWithExpiry])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setShowDropdown(false)
    setIsSearching(false)
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clean up cache on unmount
  useEffect(() => {
    const cacheMap = searchCache.current
    const timeoutMap = cacheTimeout.current

    return () => {
      timeoutMap.forEach(timeout => clearTimeout(timeout))
      cacheMap.clear()
      timeoutMap.clear()
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    showDropdown,
    setShowDropdown,
    suggestions,
    clearSearch,
    searchContainerRef
  }
}

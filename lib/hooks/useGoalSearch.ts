import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchDebounce } from '@/lib/hooks/useSearchDebounce'
import { useSearchCache } from '@/lib/hooks/useSearchCache'
import { calculateSearchScore } from '@/lib/utils/searchScoring'

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
  const debouncedSearch = useSearchDebounce(searchQuery, debounceMs)

  // Search cache to avoid repeated filtering
  const cache = useSearchCache<SearchCacheEntry>(cacheExpiryMs)
  const searchContainerRef = useRef<HTMLDivElement>(null)

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
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      setIsSearching(false)
      setSuggestions(cachedResult.suggestions)
      setShowDropdown(cachedResult.suggestions.length > 0 || trimmedSearch.length >= 2)
      return
    }

    let cancelled = false

    const computeSuggestions = () => {
      const query = trimmedSearch
      const goalSuggestions: SearchSuggestion[] = []

      arenas.forEach(arena => {
        arena.categories?.forEach(category => {
          category.goals?.forEach(goal => {
            const score = calculateSearchScore(goal.title, query)

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
        // Show dropdown if there are results OR if query is long enough to show "no results" message
        setShowDropdown(topSuggestions.length > 0 || trimmedSearch.length >= 2)
        setIsSearching(false)
        cache.set(cacheKey, { suggestions: topSuggestions })
      }
    }

    setIsSearching(true)
    computeSuggestions()

    return () => {
      cancelled = true
    }
  }, [arenas, debouncedSearch, maxResults, cache.get, cache.set])

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

  // Cache cleanup is handled by useSearchCache hook

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

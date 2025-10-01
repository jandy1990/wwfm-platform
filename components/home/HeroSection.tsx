'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlatformStats } from '@/types/home';
import { searchGoals, type GoalSuggestion } from '@/app/actions/home';

interface HeroSectionProps {
  stats: PlatformStats;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Highlight matching text
function highlightText(text: string, query: string): React.ReactElement {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 150);
  const router = useRouter();

  // Search container ref for click outside handling
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search cache to avoid repeated API calls
  const searchCache = useRef<Map<string, GoalSuggestion[]>>(new Map());
  const cacheTimeout = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Helper to manage cache with expiry
  const setCacheWithExpiry = useCallback((key: string, data: GoalSuggestion[], expiryMs: number = 300000) => {
    if (cacheTimeout.current.has(key)) {
      clearTimeout(cacheTimeout.current.get(key)!);
    }

    searchCache.current.set(key, data);

    const timeout = setTimeout(() => {
      searchCache.current.delete(key);
      cacheTimeout.current.delete(key);
    }, expiryMs);

    cacheTimeout.current.set(key, timeout);
  }, []);

  // Fetch suggestions when search query changes
  useEffect(() => {
    async function fetchSuggestions() {
      const trimmedSearch = debouncedSearch.trim();

      if (!trimmedSearch || trimmedSearch.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      // Check cache first
      const cacheKey = trimmedSearch.toLowerCase();
      if (searchCache.current.has(cacheKey)) {
        const cached = searchCache.current.get(cacheKey)!;
        setSuggestions(cached);
        setShowDropdown(cached.length > 0);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const results = await searchGoals(trimmedSearch);
        setSuggestions(results);
        setShowDropdown(results.length > 0);

        // Cache the results
        setCacheWithExpiry(cacheKey, results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }

    fetchSuggestions();
  }, [debouncedSearch, setCacheWithExpiry]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean up cache on unmount
  useEffect(() => {
    return () => {
      const timeouts = Array.from(cacheTimeout.current.values());
      timeouts.forEach(timeout => clearTimeout(timeout));
      searchCache.current.clear();
      cacheTimeout.current.clear();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to browse page with search query
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Find what works for life's challenges
          </h1>
        </div>

        {/* Large Search Bar with Auto-suggest */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative" ref={searchContainerRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Try 'reduce anxiety' or 'sleep better'"
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />

              {/* Loading Spinner */}
              {isSearching && (
                <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                Search
              </button>

              {/* Dropdown Suggestions */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border
                            border-gray-200 dark:border-gray-700 max-h-96 overflow-auto
                            transition-all duration-200 ease-out">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                          Top {suggestions.length} matching goals
                        </p>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <Link
                          key={`${suggestion.id}-${index}`}
                          href={`/goal/${suggestion.id}`}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                                   transition-colors border-b border-gray-100 dark:border-gray-700
                                   last:border-b-0 focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/20"
                          onClick={() => setShowDropdown(false)}
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {highlightText(suggestion.title, searchQuery)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {suggestion.arenaName} → {suggestion.categoryName}
                          </div>
                        </Link>
                      ))}
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No goals found for "{searchQuery}"
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Try different keywords like "anxiety", "sleep", or "focus"
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Live Stats Ticker */}
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalSolutions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Solutions</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.avgEffectiveness}★
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalGoals.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Life Goals</div>
          </div>

          {stats.activeUsersToday > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.activeUsersToday.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Today</div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full font-medium shadow-md transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
          >
            Browse All Goals
          </button>
          <button
            onClick={() => router.push('/contribute')}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium shadow-md transition-all duration-300 ease-in-out hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
          >
            Share What Worked
          </button>
        </div>
      </div>
    </section>
  );
}
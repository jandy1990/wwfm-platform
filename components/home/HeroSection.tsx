'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlatformStats, GoalSuggestion } from '@/types/home';
import { searchGoals } from '@/app/actions/home';
import { useSearchDebounce } from '@/lib/hooks/useSearchDebounce';
import { useSearchCache } from '@/lib/hooks/useSearchCache';
import GoalRequestForm from '@/components/molecules/GoalRequestForm';
import LoginPromptModal from '@/components/ui/LoginPromptModal';

interface HeroSectionProps {
  stats: PlatformStats;
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
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useSearchDebounce(searchQuery, 150);

  // Goal request feature state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  // Search container ref for click outside handling
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Use shared cache hook
  const cache = useSearchCache<GoalSuggestion[]>(300000);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle request goal button click
  const handleRequestGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowRequestForm(true);
      setShowDropdown(false);
    }
  };

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
      const cachedResults = cache.get(cacheKey);
      if (cachedResults) {
        setSuggestions(cachedResults);
        setShowDropdown(cachedResults.length > 0 || trimmedSearch.length >= 2);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const results = await searchGoals(trimmedSearch);
        setSuggestions(results);
        setShowDropdown(results.length > 0 || trimmedSearch.length >= 2);

        // Cache the results
        cache.set(cacheKey, results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }

    fetchSuggestions();
  }, [debouncedSearch, cache.get, cache.set]);

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

  // Cache cleanup is handled by useSearchCache hook

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to browse page with search query
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-gray-900 dark:bg-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6">
            Stop guessing.<br className="hidden sm:block" />
            Start solving.
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
                  if (searchQuery.trim().length >= 2 || suggestions.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Try 'Reduce anxiety' or 'Sleep better'"
                className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-lg text-gray-900 placeholder-gray-500"
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
                className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 font-semibold"
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        No goals found for "{searchQuery}"
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Try different keywords like "anxiety", "sleep", or "focus"
                      </p>
                      <div className="flex justify-center">
                        <button
                          onClick={handleRequestGoal}
                          className="inline-block w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md text-sm"
                        >
                          💡 Request this goal
                        </button>
                      </div>
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
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.totalSolutions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Solutions</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.avgEffectiveness}★
            </div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.totalGoals.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Life Goals</div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
          >
            Browse All Goals
          </button>
        </div>
      </div>

      {/* Goal Request Form Modal */}
      <GoalRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        searchQuery={searchQuery}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        context="request new goals"
        title="Sign in to request goals"
        benefits={[
          'Request new goals for the platform',
          'Get notified when your request is reviewed',
          'Contribute to helping others',
          'Build your contribution history'
        ]}
      />
    </section>
  );
}

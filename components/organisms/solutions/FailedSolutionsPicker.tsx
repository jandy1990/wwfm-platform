'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, X, Search, Plus } from 'lucide-react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { searchExistingSolutions } from '@/lib/solutions/categorization';

// Custom hook for click outside detection
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string): React.ReactElement => {
  if (!query.trim()) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-inherit font-semibold">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

// Note: Sorting is now handled by the searchExistingSolutions function

interface FailedSolution {
  id?: string;
  name: string;
  rating: number;
}

interface SolutionSuggestion {
  id: string;
  title: string;
  category: string;
  categoryDisplayName: string;
  matchType: 'exact' | 'partial';
  matchScore?: number;
}

interface FailedSolutionsPickerProps {
  goalId: string;
  goalTitle?: string;
  solutionName?: string;
  onSolutionsChange: (solutions: FailedSolution[]) => void;
  existingSolutions?: FailedSolution[];
}

export function FailedSolutionsPicker({
  goalId, // Will be used for future functionality
  goalTitle,
  solutionName,
  onSolutionsChange,
  existingSolutions = []
}: FailedSolutionsPickerProps) {
  // goalId will be used for analytics/tracking in the future
  console.log('FailedSolutionsPicker initialized for goal:', goalId);
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>(existingSolutions);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SolutionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ratingIndex, setRatingIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isDropdownInteracting, setIsDropdownInteracting] = useState(false);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Search cache to avoid repeated API calls
  const searchCache = useRef<Map<string, SolutionSuggestion[]>>(new Map());
  const cacheTimeout = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Helper to manage cache with expiry
  const setCacheWithExpiry = useCallback((key: string, data: SolutionSuggestion[], expiryMs: number = 300000) => {
    const existingTimeout = cacheTimeout.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    searchCache.current.set(key, data);

    const timeout = setTimeout(() => {
      searchCache.current.delete(key);
      cacheTimeout.current.delete(key);
    }, expiryMs);

    cacheTimeout.current.set(key, timeout);
  }, []);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use click outside hook
  useClickOutside(containerRef, () => {
    if (showSuggestions) {
      console.log('Click outside - hiding suggestions');
      setShowSuggestions(false);
      // Also clear any pending focus timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    }
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation
  const { selectedIndex, handleKeyDown, handleMouseEnter } = useKeyboardNavigation({
    itemCount: suggestions.length,
    isOpen: showSuggestions,
    onSelect: (index) => {
      if (suggestions[index]) {
        selectSuggestion(suggestions[index]);
      }
    },
    onClose: () => setShowSuggestions(false),
    onOpen: () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    }
  });

  // Update parent when solutions change
  useEffect(() => {
    onSolutionsChange(failedSolutions);
  }, [failedSolutions, onSolutionsChange]);

  // Search for solutions
  useEffect(() => {
    if (searchTerm.length >= 3) {
      // Check cache first
      const cacheKey = searchTerm.toLowerCase().trim();
      if (searchCache.current.has(cacheKey)) {
        const cachedData = searchCache.current.get(cacheKey)!;
        setSuggestions(cachedData);
        setShowSuggestions(true);
        setIsSearching(false);
        return; // Use cached results, skip API call
      }
      
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      
      // Show loading immediately for perceived performance
      setIsSearching(true);
      setShowSuggestions(true); // Show dropdown with loading state
      
      const timer = setTimeout(async () => {
        try {
          // Use the same sophisticated search logic as Step 0
          const results = await searchExistingSolutions(searchTerm.trim());
          
          if (results && results.length > 0) {
            // Convert SolutionMatch[] to SolutionSuggestion[] format
            const suggestions = results.map(result => ({
              id: result.id,
              title: result.title,
              category: result.category,
              categoryDisplayName: result.categoryDisplayName,
              matchType: result.matchType,
              matchScore: result.matchScore
            }));
            
            setSuggestions(suggestions);
            
            // Cache the results
            setCacheWithExpiry(cacheKey, suggestions);
          } else {
            setSuggestions([]);
            
            // Cache empty results too (avoid repeated failed searches)
            setCacheWithExpiry(cacheKey, [], 60000); // 1 minute for empty results
          }
        } catch (error) {
          console.error('💥 FailedSolutionsPicker: Error searching solutions:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false); // No artificial delay
        }
      }, 150); // Reduced from 300ms
      
      searchTimerRef.current = timer;
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
  }, [searchTerm, isMobile, setCacheWithExpiry]);

  // Show suggestions when results arrive
  useEffect(() => {
    if (suggestions.length > 0 && searchTerm.length >= 3 && !isMobile && inputRef.current === document.activeElement) {
      setShowSuggestions(true);
    }
  }, [suggestions, searchTerm, isMobile]);

  const selectSuggestion = (suggestion: SolutionSuggestion) => {
    const newSolution: FailedSolution = {
      id: suggestion.id,
      name: suggestion.title,
      rating: 1
    };
    
    setFailedSolutions([...failedSolutions, newSolution]);
    setSearchTerm('');
    setShowSuggestions(false);
    setShowMobileSheet(false);
    
    // Set rating index to newly added solution for immediate rating
    setRatingIndex(failedSolutions.length);
    
    // Focus back to input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const addCustomSolution = () => {
    if (searchTerm.trim()) {
      const newSolution: FailedSolution = {
        name: searchTerm.trim(),
        rating: 1
      };
      
      setFailedSolutions([...failedSolutions, newSolution]);
      setSearchTerm('');
      setShowSuggestions(false);
      setShowMobileSheet(false);
      
      // Set rating index for immediate rating
      setRatingIndex(failedSolutions.length);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const updateRating = useCallback((index: number, rating: number) => {
    const updated = [...failedSolutions];
    updated[index].rating = rating;
    setFailedSolutions(updated);
    
    // Clear rating index and refocus input
    setRatingIndex(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [failedSolutions]);

  const removeSolution = (index: number) => {
    setFailedSolutions(failedSolutions.filter((_, i) => i !== index));
  };

  // Handle number key press for quick rating
  const handleNumberKeyPress = useCallback((e: KeyboardEvent) => {
    if (ratingIndex !== null && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      updateRating(ratingIndex, parseInt(e.key));
    }
  }, [ratingIndex, updateRating]);

  useEffect(() => {
    if (ratingIndex === null) {
      return;
    }

    const listener: EventListener = (event) => {
      handleNumberKeyPress(event as unknown as KeyboardEvent);
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [ratingIndex, handleNumberKeyPress]);
  
  // Clean up cache and timeouts on unmount
  useEffect(() => {
    const cacheMap = searchCache.current;
    const timeoutMap = cacheTimeout.current;

    return () => {
      timeoutMap.forEach(timeout => clearTimeout(timeout));
      cacheMap.clear();
      timeoutMap.clear();

      const focusTimeout = focusTimeoutRef.current;
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
    };
  }, []);
  
  // Prefetch common solutions on focus for instant results
  const handleInputFocus = useCallback(async () => {
    // Only prefetch if cache is empty
    if (searchCache.current.size === 0) {
      // Prefetch some common terms in the background
      const commonTerms = ['meditation', 'therapy', 'exercise', 'vitamin'];
      
      commonTerms.forEach((term) => {
        if (searchCache.current.has(term)) {
          return;
        }

        void (async () => {
          try {
            const results = await searchExistingSolutions(term);
            if (!results) return;

            const suggestions = results.map(result => ({
              id: result.id,
              title: result.title,
              category: result.category,
              categoryDisplayName: result.categoryDisplayName,
              matchType: result.matchType,
              matchScore: result.matchScore
            }));
            setCacheWithExpiry(term, suggestions);
          } catch {
            // Silent fail for prefetch
          }
        })();
      });
    }
  }, [setCacheWithExpiry]);

  // Mobile bottom sheet
  const MobileBottomSheet = () => (
    <div 
      className={`fixed inset-0 z-50 ${showMobileSheet ? 'visible' : 'invisible'}`}
      onClick={() => setShowMobileSheet(false)}
    >
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        showMobileSheet ? 'opacity-50' : 'opacity-0'
      }`} />
      
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl 
                   transition-transform duration-300 transform ${
          showMobileSheet ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-3">Search solutions</h3>
          
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white text-base"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
              </div>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto -mx-4 px-4">
            {isSearching ? (
              // Loading state
              <div className="p-4 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Found {suggestions.length} solutions
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left p-4 -mx-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="font-medium">{highlightMatch(suggestion.title, searchTerm)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.categoryDisplayName}
                    </div>
                  </button>
                ))}
              </>
            ) : searchTerm.length >= 3 ? (
              <button
                onClick={addCustomSolution}
                className="w-full text-left p-4 -mx-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="font-medium">Add &quot;{searchTerm}&quot;</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    As custom solution
                  </div>
                </div>
              </button>
            ) : searchTerm.length < 3 && searchTerm.length > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Type at least 3 characters to search
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Search input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                // Clear any pending blur timeout
                if (focusTimeoutRef.current) {
                  clearTimeout(focusTimeoutRef.current);
                  focusTimeoutRef.current = null;
                }
                
                handleInputFocus();
                if (isMobile) {
                  setShowMobileSheet(true);
                } else if (searchTerm.length >= 3 && suggestions.length > 0) {
                  console.log('onFocus - showing suggestions with', suggestions.length, 'results');
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                if (!isMobile) {
                  // Use a longer timeout to allow for dropdown interactions
                  focusTimeoutRef.current = setTimeout(() => {
                    if (!isDropdownInteracting) {
                      console.log('onBlur - hiding suggestions after timeout');
                      setShowSuggestions(false);
                    }
                    focusTimeoutRef.current = null;
                  }, 200);
                }
              }}
              placeholder={isMobile ? "Tap to search solutions..." : "Search for solutions you tried..."}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
            />
            {isSearching && !isMobile && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
              </div>
            )}
            {!isSearching && searchTerm.length >= 3 && !isMobile && (
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            )}
            
            {/* Desktop dropdown with improved UX */}
            {!isMobile && showSuggestions && (
              <div 
                ref={dropdownRef}
                onMouseEnter={() => {
                  console.log('Mouse entered dropdown');
                  setIsDropdownInteracting(true);
                  // Clear any pending blur timeout when mouse enters dropdown
                  if (focusTimeoutRef.current) {
                    clearTimeout(focusTimeoutRef.current);
                    focusTimeoutRef.current = null;
                  }
                }}
                onMouseLeave={() => {
                  console.log('Mouse left dropdown');
                  setIsDropdownInteracting(false);
                }}
                className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto
                         transition-all duration-200 ease-out"
              >
                {isSearching ? (
                  // Loading state
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Searching...</span>
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  // Results
                  <>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-blue-800">
                      <p className="text-xs text-purple-700 dark:text-blue-300 font-medium">
                        {suggestions.length} solution{suggestions.length > 1 ? 's' : ''} found
                      </p>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(suggestion);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all duration-150 ease-out
                                 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                          selectedIndex === index
                            ? 'bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        } focus:outline-none focus:bg-purple-50 dark:focus:bg-purple-900/20`}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {highlightMatch(suggestion.title, searchTerm)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {suggestion.categoryDisplayName}
                        </div>
                      </button>
                    ))}
                  </>
                ) : searchTerm.length >= 3 ? (
                  // No results - allow custom entry
                  <div className="p-4">
                    <button
                      onClick={addCustomSolution}
                      className="w-full py-3 px-4 bg-white dark:bg-gray-800 hover:bg-purple-50 
                               dark:hover:bg-purple-900/20 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-purple-900/30 rounded-full 
                                      flex items-center justify-center group-hover:bg-purple-200 
                                      dark:group-hover:bg-purple-900/50 transition-colors">
                          <span className="text-purple-600 dark:text-purple-400 text-lg">+</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Add "{searchTerm}" as a solution
                        </p>
                      </div>
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          {/* Desktop Add button */}
          {!isMobile && (
            <button
              onClick={addCustomSolution}
              disabled={!searchTerm.trim()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                       dark:hover:bg-gray-600 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Hint text */}
      {!isMobile && searchTerm.length > 0 && searchTerm.length < 3 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Type at least 3 characters to search existing solutions
        </p>
      )}

      {/* Failed solutions list */}
      {failedSolutions.length > 0 && (
        <div className="space-y-2">
          {failedSolutions.map((failed, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg
                       ${ratingIndex === index ? 'ring-2 ring-purple-500' : ''}`}
            >
              <span className="flex-1 font-medium">{failed.name}</span>
              
              {/* Rating stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateRating(index, rating)}
                    className={`p-1 transition-all ${
                      failed.rating >= rating
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    } ${ratingIndex === index ? 'scale-110' : ''}`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => removeSolution(index)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {ratingIndex !== null && (
            <p className="text-xs text-purple-600 dark:text-purple-400 text-center animate-pulse">
              Press 1-5 to rate quickly
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Rate 1-5 stars (these didn&apos;t work as well as {solutionName || 'your solution'} for {goalTitle})
          </p>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && <MobileBottomSheet />}
    </div>
  );
}

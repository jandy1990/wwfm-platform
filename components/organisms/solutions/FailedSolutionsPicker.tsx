'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/database/client';
import { Star, X, Search, Plus } from 'lucide-react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface FailedSolution {
  id?: string;
  name: string;
  rating: number;
}

interface SolutionSuggestion {
  id: string;
  title: string;
  solution_category: string;
  description?: string | null;
  match_score?: number;
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
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const [ratingIndex, setRatingIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isDropdownInteracting, setIsDropdownInteracting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    console.log('Search term changed:', searchTerm, 'Length:', searchTerm.length);
    if (searchTerm.length >= 3) {
      console.log('Triggering search for:', searchTerm);
      if (searchTimer) clearTimeout(searchTimer);
      
      const timer = setTimeout(async () => {
        console.log('Executing search after debounce');
        setIsSearching(true);
        try {
          console.log('Making search call with term:', searchTerm);
          
          // Use the fuzzy search RPC function
          const { data, error } = await supabase
            .rpc('search_solutions_fuzzy', {
              search_term: searchTerm.toLowerCase().trim()
            });
          
          console.log('Fuzzy search result:', { data, error });
          
          if (!error && data && data.length > 0) {
            console.log('✅ Search Success - Results:', data);
            setSuggestions(data);
            // Don't set showSuggestions here, let the effect handle it
          } else {
            console.log('No results found for:', searchTerm);
            setSuggestions([]);
            if (error) {
              console.error('Query error:', error);
            }
          }
        } catch (error) {
          console.error('Error searching solutions:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      setSearchTimer(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchTerm, isMobile, searchTimer]);

  // Show suggestions when results arrive
  useEffect(() => {
    if (suggestions.length > 0 && searchTerm.length >= 3 && !isMobile && inputRef.current === document.activeElement) {
      console.log('📍 Showing suggestions because we have results');
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
    if (ratingIndex !== null) {
      window.addEventListener('keydown', handleNumberKeyPress as unknown as EventListener);
      return () => window.removeEventListener('keydown', handleNumberKeyPress as unknown as EventListener);
    }
  }, [ratingIndex, handleNumberKeyPress]);

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
                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white text-base"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              </div>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto -mx-4 px-4">
            {suggestions.length > 0 ? (
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
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.solution_category?.replace(/_/g, ' ')}
                    </div>
                  </button>
                ))}
              </>
            ) : searchTerm.length >= 3 && !isSearching ? (
              <button
                onClick={addCustomSolution}
                className="w-full text-left p-4 -mx-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
    <div className="space-y-4">
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
                if (isMobile) {
                  setShowMobileSheet(true);
                } else if (searchTerm.length >= 3 && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                if (!isMobile && !isDropdownInteracting) {
                  setTimeout(() => {
                    if (!isDropdownInteracting) {
                      console.log('onBlur - hiding suggestions');
                      setShowSuggestions(false);
                    }
                  }, 100);
                }
              }}
              placeholder={isMobile ? "Tap to search solutions..." : "Search for solutions you tried..."}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
            />
            {isSearching && !isMobile && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              </div>
            )}
            {!isSearching && searchTerm.length >= 3 && !isMobile && (
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            )}
            
            {/* Desktop dropdown */}
            {!isMobile && showSuggestions && suggestions.length > 0 && (
              <div 
                ref={dropdownRef}
                onMouseEnter={() => setIsDropdownInteracting(true)}
                onMouseLeave={() => setIsDropdownInteracting(false)}
                className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                style={{ display: 'block' }}
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
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
                    className={`w-full px-4 py-3 text-left transition-colors border-b 
                             border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      selectedIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {suggestion.solution_category?.replace(/_/g, ' ')}
                    </div>
                  </button>
                ))}
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
                       ${ratingIndex === index ? 'ring-2 ring-blue-500' : ''}`}
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
            <p className="text-xs text-blue-600 dark:text-blue-400 text-center animate-pulse">
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
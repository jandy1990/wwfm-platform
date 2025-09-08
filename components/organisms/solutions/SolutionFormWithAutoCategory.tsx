// components/solutions/SolutionFormWithAutoCategory.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { SolutionMatch, DetectionResult } from '@/lib/solutions/categorization';
import { CategoryPicker } from '@/components/organisms/solutions/CategoryPicker';
import { DosageForm } from '@/components/organisms/solutions/forms/DosageForm';
import { AppForm } from '@/components/organisms/solutions/forms/AppForm';
import { HobbyForm } from '@/components/organisms/solutions/forms/HobbyForm';
import { SessionForm } from '@/components/organisms/solutions/forms/SessionForm';
import { PracticeForm } from '@/components/organisms/solutions/forms/PracticeForm';
import { PurchaseForm } from '@/components/organisms/solutions/forms/PurchaseForm';
import { CommunityForm } from '@/components/organisms/solutions/forms/CommunityForm';
import { LifestyleForm } from '@/components/organisms/solutions/forms/LifestyleForm';
import { FinancialForm } from '@/components/organisms/solutions/forms/FinancialForm';
// Removed Users import as we don't have user data yet

interface SolutionFormWithAutoCategoryProps {
  goalId: string;
  goalTitle?: string;
  userId: string;
  onCancel?: () => void;
}

// Form state interface to persist data
interface FormState {
  step: 'search' | 'category-picker' | 'form';
  solutionName: string;
  selectedCategory: string | null;
  selectedSolution: SolutionMatch | null;
}

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

// Smart ranking for search results
const sortSuggestions = (results: any[], query: string): any[] => {
  const queryLower = query.toLowerCase();
  
  return results.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    
    // Exact matches first
    if (aTitle === queryLower) return -1;
    if (bTitle === queryLower) return 1;
    
    // Starts with query second
    const aStartsWith = aTitle.startsWith(queryLower);
    const bStartsWith = bTitle.startsWith(queryLower);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Word boundary matches third
    const aWordBoundary = aTitle.includes(' ' + queryLower) || aTitle.includes('-' + queryLower);
    const bWordBoundary = bTitle.includes(' ' + queryLower) || bTitle.includes('-' + queryLower);
    if (aWordBoundary && !bWordBoundary) return -1;
    if (!aWordBoundary && bWordBoundary) return 1;
    
    // By match score if available
    if (a.matchScore && b.matchScore) {
      return b.matchScore - a.matchScore;
    }
    
    // Alphabetical as fallback
    return aTitle.localeCompare(bTitle);
  });
};

export default function SolutionFormWithAutoCategory({
  goalId,
  goalTitle,
  userId,
  onCancel
}: SolutionFormWithAutoCategoryProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    step: 'search',
    solutionName: '',
    selectedCategory: null,
    selectedSolution: null
  });
  const [fetchedGoalTitle, setFetchedGoalTitle] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Search cache to avoid repeated API calls
  const searchCache = useRef<Map<string, DetectionResult>>(new Map());
  const cacheTimeout = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Helper to manage cache with expiry
  const setCacheWithExpiry = useCallback((key: string, data: DetectionResult, expiryMs: number = 300000) => {
    // Clear any existing timeout for this key
    if (cacheTimeout.current.has(key)) {
      clearTimeout(cacheTimeout.current.get(key)!);
    }
    
    // Set the cache
    searchCache.current.set(key, data);
    
    // Set expiry (5 minutes default)
    const timeout = setTimeout(() => {
      searchCache.current.delete(key);
      cacheTimeout.current.delete(key);
    }, expiryMs);
    
    cacheTimeout.current.set(key, timeout);
  }, []);
  
  // Refs for click outside detection and focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use click outside hook with improved timeout handling
  useClickOutside(dropdownContainerRef, () => {
    if (showDropdown) {
      console.log('🖱️ Step0: Click outside - hiding dropdown');
      setShowDropdown(false);
      // Also clear any pending focus timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    }
  });
  
  // Create a custom version of useAutoCategorization with optimizations
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Optimized search function with solution-first approach (like Step 3)
  const searchSolutions = useCallback(async (term: string) => {
    if (term.length < 2) {
      setDetectionResult(null);
      setShowDropdown(false);
      return;
    }

    // Check cache first
    const cacheKey = term.toLowerCase().trim();
    if (searchCache.current.has(cacheKey)) {
      const cachedData = searchCache.current.get(cacheKey)!;
      console.log('📦 Step0: Cache hit for:', term, 'Solutions:', cachedData.solutions?.length || 0);
      setDetectionResult(cachedData);
      setShowDropdown(true);
      setIsLoading(false);
      return; // Use cached results immediately
    }

    // Show loading immediately
    setIsLoading(true);
    setShowDropdown(true);
    console.log('🚀 Step0: Starting solution-focused search for:', term);
    
    try {
      // PHASE 1: Get solutions first (fast response like Step 3)
      const { searchExistingSolutions } = await import('@/lib/solutions/categorization');
      const solutionsResults = await searchExistingSolutions(term);
      
      console.log('✅ Step0: Got', solutionsResults.length, 'solutions immediately');
      
      // Show solutions immediately for fast perceived performance
      const quickResult: DetectionResult = {
        solutions: solutionsResults,
        categories: [],
        searchTerm: term,
        keywordMatches: []
      };
      
      setDetectionResult(quickResult);
      setIsLoading(false);
      
      // PHASE 2: Get categories in background for comprehensive results
      const { detectCategoriesFromKeywords, searchKeywordSuggestions } = await import('@/lib/solutions/categorization');
      const categoriesPromise = detectCategoriesFromKeywords(term);
      const keywordMatchesPromise = searchKeywordSuggestions(term);
      
      const [categories, keywordMatches] = await Promise.all([categoriesPromise, keywordMatchesPromise]);
      
      // Update with complete results
      const completeResult: DetectionResult = {
        solutions: solutionsResults,
        categories,
        searchTerm: term,
        keywordMatches
      };
      
      setDetectionResult(completeResult);
      
      // Cache the complete results
      setCacheWithExpiry(cacheKey, completeResult);
      console.log('💾 Step0: Cached complete results for:', term);
      
    } catch (error) {
      console.error('💥 Step0: Error searching solutions:', error);
      setError(error instanceof Error ? error.message : 'Failed to detect category');
      setDetectionResult(null);
      setIsLoading(false);
    }
  }, [setCacheWithExpiry]);
  
  const clearResults = useCallback(() => {
    setDetectionResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Fetch goal title if not provided
  useEffect(() => {
    const fetchGoalTitle = async () => {
      if (!goalTitle && goalId) {
        const { data, error } = await supabase
          .from('goals')
          .select('title')
          .eq('id', goalId)
          .single();
        
        if (data && !error) {
          setFetchedGoalTitle(data.title);
        }
      }
    };
    
    fetchGoalTitle();
  }, [goalId, goalTitle]);

  // Use provided goalTitle or fetched one
  const actualGoalTitle = goalTitle || fetchedGoalTitle;
  
  // Clean up cache and timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all cache timeouts on unmount
      const timeouts = cacheTimeout.current;
      const cache = searchCache.current;
      timeouts.forEach(timeout => clearTimeout(timeout));
      cache.clear();
      timeouts.clear();
      
      // Clear focus timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);
  
  // Prefetch common solutions on focus for instant results (shared with Step 3)
  const handleInputFocus = useCallback(async () => {
    // Only prefetch if cache is empty
    if (searchCache.current.size === 0) {
      // Prefetch some common terms in the background
      const commonTerms = ['meditation', 'therapy', 'exercise', 'vitamin'];
      
      commonTerms.forEach(async (term) => {
        if (!searchCache.current.has(term)) {
          try {
            // Use the same fast search function as Step 3 for consistency
            const { searchExistingSolutions } = await import('@/lib/solutions/categorization');
            const solutionsResults = await searchExistingSolutions(term);
            
            // Create a minimal DetectionResult for prefetch (solutions only)
            const quickResult: DetectionResult = {
              solutions: solutionsResults,
              categories: [],
              searchTerm: term,
              keywordMatches: []
            };
            
            console.log('🚀 Step0: Prefetched', solutionsResults.length, 'solutions for:', term);
            setCacheWithExpiry(term, quickResult);
          } catch (error) {
            // Silent fail for prefetch
          }
        }
      });
    }
  }, [setCacheWithExpiry]);

  // Add keyboard event handler for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown]);

  // Trigger detection when user types with reduced debounce
  useEffect(() => {
    // Don't trigger search if we have a selected category (user already selected an option)
    if (formState.selectedCategory) {
      return;
    }
    
    if (formState.solutionName.length >= 2) {
      // Clear existing timeout
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
      
      // Set loading immediately for responsive feel
      setIsLoading(true);
      setShowDropdown(true);
      
      // Debounce the actual search with reduced time (150ms instead of 300ms)
      searchTimer.current = setTimeout(() => {
        searchSolutions(formState.solutionName);
      }, 150); // Faster debounce - still prevents spam
    } else {
      clearResults();
      setShowDropdown(false);
    }
    
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [formState.solutionName, formState.selectedCategory, searchSolutions, clearResults]);

  // Handle selecting any item from dropdown
  const handleSelectItem = useCallback((title: string, category: string, solution?: SolutionMatch) => {
    
    // Clear the search timer to prevent it from reopening dropdown
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    
    setFormState({
      ...formState,
      solutionName: title,
      selectedCategory: category,
      selectedSolution: solution || null
    });
    setShowDropdown(false);
    clearResults();
    // Clear focus from input to ensure dropdown closes
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, [formState, clearResults]);

  // Handle continuing to next step
  const handleContinue = useCallback(() => {
    if (!formState.selectedCategory && detectionResult?.categories.length > 0) {
      // Auto-detect category if not selected
      setFormState({
        ...formState,
        selectedCategory: detectionResult.categories[0].category,
        step: 'form'
      });
    } else if (formState.selectedCategory) {
      // Category already selected
      setFormState({
        ...formState,
        step: 'form'
      });
    } else {
      // No category detected, go to manual picker
      setFormState({
        ...formState,
        step: 'category-picker'
      });
    }
  }, [formState, detectionResult]);

  const handleCategoryPick = useCallback((category: string) => {
    setFormState({
      ...formState,
      selectedCategory: category,
      step: 'form'
    });
  }, [formState]);

  const handleBack = useCallback(() => {
    switch (formState.step) {
      case 'form':
        // Go back to search, preserving the solution name
        setFormState({
          ...formState,
          step: 'search',
          selectedCategory: null,
          selectedSolution: null
        });
        setShowDropdown(false);
        break;
      case 'category-picker':
        // Go back to search
        setFormState({
          ...formState,
          step: 'search'
        });
        break;
      case 'search':
        if (onCancel) {
          onCancel();
        } else {
          router.push(`/goal/${goalId}`);
        }
        break;
    }
  }, [formState, onCancel, router, goalId]);

  // Check if Continue button should be enabled
  const canContinue = formState.solutionName.trim().length >= 2;

  // Render the appropriate form based on category
  const renderForm = () => {
    if (!formState.selectedCategory || formState.step !== 'form') return null;

    const formProps = {
      goalId,
      goalTitle: actualGoalTitle,
      userId,
      solutionName: formState.selectedSolution ? formState.selectedSolution.title : formState.solutionName,
      category: formState.selectedCategory,
      existingSolutionId: formState.selectedSolution?.id,
      onBack: handleBack
    };

    // Use conditional rendering with stable keys to maintain component identity
    // This prevents React from recreating components on every render
    const category = formState.selectedCategory;
    
    // Create a stable key combining category and solution ID
    const formKey = `${category}-${formState.selectedSolution?.id || 'new'}`;

    // Render based on category using conditional logic instead of creating new elements
    switch (category) {
      // Dosage Form (4 categories)
      case 'supplements_vitamins':
      case 'medications':
      case 'natural_remedies':
      case 'beauty_skincare':
        return <DosageForm key={formKey} {...formProps} />;
      
      // App Form (1 category)
      case 'apps_software':
        return <AppForm key={formKey} {...formProps} />;
      
      // Hobby Form (1 category)
      case 'hobbies_activities':
        return <HobbyForm key={formKey} {...formProps} />;
      
      // Practice Form (3 categories)
      case 'exercise_movement':
      case 'meditation_mindfulness':
      case 'habits_routines':
        return <PracticeForm key={formKey} {...formProps} />;

      // Session Form (7 categories)
      case 'therapists_counselors':
      case 'doctors_specialists':
      case 'coaches_mentors':
      case 'alternative_practitioners':
      case 'professional_services':
      case 'medical_procedures':
      case 'crisis_resources':
        return <SessionForm key={formKey} {...formProps} />;

      // Purchase Form (2 categories)
      case 'products_devices':
      case 'books_courses':
        return <PurchaseForm key={formKey} {...formProps} />;

      // Community Form (2 categories)
      case 'support_groups':
      case 'groups_communities':
        return <CommunityForm key={formKey} {...formProps} />;

      // Lifestyle Form (2 categories)
      case 'diet_nutrition':
      case 'sleep':
        return <LifestyleForm key={formKey} {...formProps} />;

      // Financial Form (1 category)
      case 'financial_products':
        return <FinancialForm key={formKey} {...formProps} />;

      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Form for {category} is coming soon!
            </p>
            <button
              onClick={handleBack}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 
                       dark:hover:text-blue-300 font-medium"
            >
              Go back
            </button>
          </div>
        );
    }
  };

  // Render based on current step
  switch (formState.step) {
    case 'category-picker':
      return (
        <CategoryPicker
          onSelectCategory={handleCategoryPick}
          onBack={handleBack}
        />
      );
    
    case 'form':
      return renderForm();
    
    case 'search':
    default:
      // Continue to main search interface below
      break;
  }

  // Combine all results into a single list for the user
  const allResults: any[] = [];
  
  if (detectionResult) {
    // Add existing solutions
    detectionResult.solutions.forEach(solution => {
      allResults.push({
        type: 'existing' as const,
        title: solution.title,
        category: solution.category,
        categoryDisplayName: solution.categoryDisplayName,
        solution
      });
    });
    
    // Add keyword matches that aren't already in solutions
    detectionResult.keywordMatches.forEach(match => {
      const isDuplicate = allResults.some(
        r => r.title.toLowerCase() === match.keyword.toLowerCase()
      );
      if (!isDuplicate) {
        allResults.push({
          type: 'suggestion' as const,
          title: match.keyword,
          category: match.category,
          categoryDisplayName: match.categoryDisplayName,
          matchScore: match.matchScore
        });
      }
    });
  }
  
  // Sort results intelligently
  const sortedResults = sortSuggestions(allResults, formState.solutionName);

  // Main search interface
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
      {/* Show goal context at the top if available */}
      {actualGoalTitle && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sharing what worked for: <strong className="text-gray-900 dark:text-white">{actualGoalTitle}</strong>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative" ref={dropdownContainerRef}>
          <label htmlFor="solution-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What helped you?
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              id="solution-name"
              data-testid="solution-name-input"
              type="text"
              value={formState.solutionName}
              onChange={(e) => {
                setFormState({ ...formState, solutionName: e.target.value });
                if (e.target.value.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              onFocus={() => {
                // Clear any pending blur timeout (like Step 3)
                if (focusTimeoutRef.current) {
                  clearTimeout(focusTimeoutRef.current);
                  focusTimeoutRef.current = null;
                }
                
                console.log('👁️ Step0: Input focused');
                handleInputFocus();
                // Only show dropdown if no category selected yet
                if (formState.solutionName.length >= 2 && detectionResult && !formState.selectedCategory) {
                  console.log('📍 Step0: Showing dropdown on focus with existing results');
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                // Use longer timeout like Step 3 for better UX
                focusTimeoutRef.current = setTimeout(() => {
                  console.log('💤 Step0: Input blur timeout - hiding dropdown');
                  setShowDropdown(false);
                  focusTimeoutRef.current = null;
                }, 200); // Increased from typical 100ms to 200ms like Step 3
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
              placeholder="e.g., Headspace, Vitamin D, Running, Therapy..."
              autoFocus
            />
            
            {/* Category badge when detected */}
            {formState.selectedCategory && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 
                               px-2 py-1 rounded-md font-medium">
                  {detectionResult?.categories.find(c => c.category === formState.selectedCategory)?.displayName || formState.selectedCategory}
                </span>
              </div>
            )}
          </div>
          
          {/* Improved dropdown with loading and no results states */}
          {showDropdown && (
            <div 
              data-testid="solution-dropdown"
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border 
                          border-gray-200 dark:border-gray-700 max-h-60 overflow-auto
                          transition-all duration-200 ease-out"
              style={{ pointerEvents: showDropdown ? 'auto' : 'none' }}>
              {isLoading ? (
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
              ) : sortedResults.length > 0 ? (
                // Results
                <>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {sortedResults.length} solution{sortedResults.length > 1 ? 's' : ''} found
                    </p>
                  </div>
                  {sortedResults.map((result, index) => (
                    <button
                      key={`${result.title}-${index}`}
                      data-testid={`solution-option-${index}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectItem(
                          result.title, 
                          result.category,
                          result.type === 'existing' ? result.solution : undefined
                        );
                        // Force dropdown to close immediately
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                               transition-colors border-b border-gray-100 dark:border-gray-700 
                               last:border-b-0 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {highlightMatch(result.title, formState.solutionName)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {result.categoryDisplayName}
                      </div>
                    </button>
                  ))}
                </>
              ) : formState.solutionName.length >= 2 ? (
                // No results - allow custom entry
                <div className="p-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDropdown(false);
                      handleContinue();
                    }}
                    className="w-full py-3 px-4 bg-white dark:bg-gray-800 hover:bg-blue-50 
                             dark:hover:bg-blue-900/20 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full 
                                    flex items-center justify-center group-hover:bg-blue-200 
                                    dark:group-hover:bg-blue-900/50 transition-colors">
                        <span className="text-blue-600 dark:text-blue-400 text-lg">+</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Add "{formState.solutionName}" as a solution
                      </p>
                    </div>
                  </button>
                </div>
              ) : null}
            </div>
          )}
          
          {/* "Try being more specific" helper */}
          {showDropdown && !isLoading && allResults.length === 0 && formState.solutionName.length >= 2 &&
           ['therapy', 'medication', 'supplement', 'exercise', 'vitamin', 'app', 'treatment', 'counseling', 'workout'].some(term => 
             formState.solutionName.toLowerCase().includes(term)
           ) && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 
                          dark:border-gray-700 rounded-lg shadow-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Try being more specific
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formState.solutionName.toLowerCase().includes('therapy') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;CBT therapy&quot; or &quot;EMDR&quot; or &quot;talk therapy&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('medication') && (
                      <>&quot;{formState.solutionName}&quot; → specific drug name like &quot;Lexapro&quot; or &quot;Tylenol&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('supplement') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;Vitamin D&quot; or &quot;Omega-3&quot; or &quot;Magnesium&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('exercise') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;Running&quot; or &quot;Yoga&quot; or &quot;CrossFit&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('vitamin') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;Vitamin D&quot; or &quot;B12&quot; or &quot;Vitamin C&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('app') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;Headspace&quot; or &quot;MyFitnessPal&quot; or &quot;Calm&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('treatment') && (
                      <>&quot;{formState.solutionName}&quot; → specific treatment like &quot;Acupuncture&quot; or &quot;Physical therapy&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('counseling') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;Marriage counseling&quot; or &quot;Career counseling&quot;</>
                    )}
                    {formState.solutionName.toLowerCase().includes('workout') && (
                      <>&quot;{formState.solutionName}&quot; → &quot;HIIT workout&quot; or &quot;Strength training&quot; or &quot;Pilates&quot;</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                        dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                router.push(`/goal/${goalId}`);
              }
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                     dark:hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            data-testid="continue-button"
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              canContinue
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
// components/solutions/SolutionFormWithAutoCategory.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { useAutoCategorization } from '@/lib/hooks/useAutoCategorization';
import { SolutionMatch } from '@/lib/solutions/categorization';
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
  
  const { detectionResult, isLoading, error, detectFromInput, clearResults } = useAutoCategorization();

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

  // Trigger detection when user types
  useEffect(() => {
    if (formState.solutionName.length >= 2) {
      detectFromInput(formState.solutionName);
      setShowDropdown(true);
    } else {
      clearResults();
      setShowDropdown(false);
    }
  }, [formState.solutionName, detectFromInput, clearResults]);

  // Handle selecting any item from dropdown
  const handleSelectItem = useCallback((title: string, category: string, solution?: SolutionMatch) => {
    setFormState({
      ...formState,
      solutionName: title,
      selectedCategory: category,
      selectedSolution: solution || null
    });
    setShowDropdown(false);
  }, [formState]);

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

    // Map categories to their form templates
    const categoryFormMap: Record<string, React.ReactElement> = {
      // Dosage Form (4 categories)
      'supplements_vitamins': <DosageForm {...formProps} />,
      'medications': <DosageForm {...formProps} />,
      'natural_remedies': <DosageForm {...formProps} />,
      'beauty_skincare': <DosageForm {...formProps} />,
      
      // App Form (1 category)
      'apps_software': <AppForm {...formProps} />,
      
      // Hobby Form (1 category)
      'hobbies_activities': <HobbyForm {...formProps} />,
      
      // Practice Form (3 categories)
      'exercise_movement': <PracticeForm {...formProps} />,
      'meditation_mindfulness': <PracticeForm {...formProps} />,
      'habits_routines': <PracticeForm {...formProps} />,

      // Session Form (7 categories)
      'therapists_counselors': <SessionForm {...formProps} />,
      'doctors_specialists': <SessionForm {...formProps} />,
      'coaches_mentors': <SessionForm {...formProps} />,
      'alternative_practitioners': <SessionForm {...formProps} />,
      'professional_services': <SessionForm {...formProps} />,
      'medical_procedures': <SessionForm {...formProps} />,
      'crisis_resources': <SessionForm {...formProps} />,

      // Purchase Form (2 categories)
      'products_devices': <PurchaseForm {...formProps} />,
      'books_courses': <PurchaseForm {...formProps} />,

      // Community Form (2 categories)
      'support_groups': <CommunityForm {...formProps} />,
      'groups_communities': <CommunityForm {...formProps} />,

      // Lifestyle Form (2 categories)
      'diet_nutrition': <LifestyleForm {...formProps} />,
      'sleep': <LifestyleForm {...formProps} />,

      // Financial Form (1 category)
      'financial_products': <FinancialForm {...formProps} />
    };

    return categoryFormMap[formState.selectedCategory] || (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Form for {formState.selectedCategory} is coming soon!
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
  const allResults = [];
  
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
        <div className="relative">
          <label htmlFor="solution-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What helped you?
          </label>
          <div className="relative">
            <input
              id="solution-name"
              type="text"
              value={formState.solutionName}
              onChange={(e) => setFormState({ ...formState, solutionName: e.target.value })}
              onFocus={() => {
                if (formState.solutionName.length >= 2 && allResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click events on dropdown
                setTimeout(() => setShowDropdown(false), 200);
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
          
          {/* Unified dropdown */}
          {showDropdown && !isLoading && allResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 
                          dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              
              {/* Suggestions header */}
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 
                            border-b border-gray-100 dark:border-gray-700">
                💡 Suggestions
              </div>
              
              {/* All results in one list */}
              {allResults.map((result, index) => (
                <button
                  key={`${result.title}-${index}`}
                  onClick={() => handleSelectItem(
                    result.title, 
                    result.category,
                    result.type === 'existing' ? result.solution : undefined
                  )}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.title}</span>
                      {result.type === 'suggestion' && result.matchScore && result.matchScore < 0.8 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">(similar)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.categoryDisplayName}
                    </div>
                  </div>
                </button>
              ))}
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

        {/* Loading indicator */}
        {isLoading && formState.solutionName.length >= 2 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 
                          border-blue-600 dark:border-blue-400"></div>
            <span>Searching...</span>
          </div>
        )}

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
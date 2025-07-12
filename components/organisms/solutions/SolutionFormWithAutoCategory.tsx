// components/solutions/SolutionFormWithAutoCategory.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { useAutoCategorization } from '@/lib/hooks/useAutoCategorization';
import { SolutionMatch } from '@/lib/solutions/categorization';
import { CategoryConfirmation } from '@/components/organisms/solutions/CategoryConfirmation';
import { CategoryPicker } from '@/components/organisms/solutions/CategoryPicker';
import SolutionSearchResults from '@/components/organisms/solutions/SolutionSearchResults';
import { DosageForm } from '@/components/organisms/solutions/forms/DosageForm';

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
    } else {
      clearResults();
    }
  }, [formState.solutionName, detectFromInput, clearResults]);

  const handleSelectExistingSolution = useCallback((solution: SolutionMatch) => {
    setFormState({
      ...formState,
      selectedSolution: solution,
      solutionName: solution.title,
      selectedCategory: solution.category,
      step: 'form'
    });
  }, [formState]);

  const handleSelectKeywordSuggestion = useCallback((keyword: string, category: string) => {
    setFormState({
      ...formState,
      solutionName: keyword,
      selectedCategory: category
    });
    // Trigger new detection with the complete keyword
    detectFromInput(keyword);
  }, [formState, detectFromInput]);

  const handleCategoryConfirm = useCallback((category: string) => {
    setFormState({
      ...formState,
      selectedCategory: category,
      step: 'form'
    });
  }, [formState]);

  const handleManualCategorySelect = useCallback(() => {
    setFormState({
      ...formState,
      step: 'category-picker'
    });
  }, [formState]);

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
  }, [formState, onCancel]);

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
      
      // Session Form (7 categories) - TODO: Uncomment when SessionForm is built
      // 'therapists_counselors': <SessionForm {...formProps} />,
      // 'doctors_specialists': <SessionForm {...formProps} />,
      // 'coaches_mentors': <SessionForm {...formProps} />,
      // 'alternative_practitioners': <SessionForm {...formProps} />,
      // 'professional_services': <SessionForm {...formProps} />,
      // 'medical_procedures': <SessionForm {...formProps} />,
      // 'crisis_resources': <SessionForm {...formProps} />,
      
      // Practice Form (3 categories)
      // 'exercise_movement': <PracticeForm {...formProps} />,
      // 'meditation_mindfulness': <PracticeForm {...formProps} />,
      // 'habits_routines': <PracticeForm {...formProps} />,
      
      // Other forms...
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

  // Main search interface
  return (
    <div className="space-y-6">
      {/* Show goal context at the top if available */}
      {actualGoalTitle && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sharing what worked for: <strong className="text-gray-900 dark:text-white">{actualGoalTitle}</strong>
          </p>
        </div>
      )}

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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-800 dark:text-white"
            placeholder="e.g., Headspace, Vitamin D, Running, Therapy..."
            autoFocus
          />
          
          {/* Category badge when detected */}
          {detectionResult && detectionResult.categories.length > 0 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 
                             px-2 py-1 rounded-md font-medium">
                {detectionResult.categories[0].displayName || detectionResult.categories[0].category}
              </span>
            </div>
          )}
        </div>
        
        {/* Autocomplete dropdown */}
        {formState.solutionName.length >= 2 && !isLoading && detectionResult && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 
                        dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            
            {/* Existing solutions - with ratings and social proof */}
            {detectionResult.solutions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center gap-1">
                  <span>📊</span> Existing solutions
                </div>
                {detectionResult.solutions.map((solution) => (
                  <button
                    key={solution.id}
                    onClick={() => handleSelectExistingSolution(solution)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                             rounded-md transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium">{solution.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {solution.categoryDisplayName}
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 opacity-0 
                                   group-hover:opacity-100 transition-opacity">
                      Share →
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Keyword suggestions for autocomplete */}
            {detectionResult.keywordMatches && detectionResult.keywordMatches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center gap-1">
                  <span>💡</span> Suggestions
                </div>
                {detectionResult.keywordMatches.map((match, index) => (
                  <button
                    key={`${match.keyword}-${index}`}
                    onClick={() => handleSelectKeywordSuggestion(match.keyword, match.category)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                             rounded-md transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium">{match.keyword}</span>
                      {match.matchScore < 0.8 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(similar)</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {match.categoryDisplayName}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* "Try being more specific" suggestions */}
            {detectionResult.solutions.length === 0 && 
             detectionResult.keywordMatches.length === 0 &&
             ['therapy', 'medication', 'supplement', 'exercise', 'vitamin', 'app', 'treatment', 'counseling', 'workout'].some(term => 
               formState.solutionName.toLowerCase().includes(term)
             ) && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Try being more specific
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formState.solutionName.toLowerCase().includes('therapy') && (
                        <>"{formState.solutionName}" → "CBT therapy" or "EMDR" or "talk therapy"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('medication') && (
                        <>"{formState.solutionName}" → specific drug name like "Lexapro" or "Tylenol"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('supplement') && (
                        <>"{formState.solutionName}" → "Vitamin D" or "Omega-3" or "Magnesium"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('exercise') && (
                        <>"{formState.solutionName}" → "Running" or "Yoga" or "CrossFit"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('vitamin') && (
                        <>"{formState.solutionName}" → "Vitamin D" or "B12" or "Vitamin C"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('app') && (
                        <>"{formState.solutionName}" → "Headspace" or "MyFitnessPal" or "Calm"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('treatment') && (
                        <>"{formState.solutionName}" → specific treatment like "Acupuncture" or "Physical therapy"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('counseling') && (
                        <>"{formState.solutionName}" → "Marriage counseling" or "Career counseling"</>
                      )}
                      {formState.solutionName.toLowerCase().includes('workout') && (
                        <>"{formState.solutionName}" → "HIIT workout" or "Strength training" or "Pilates"</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Category suggestions or continue option */}
            {detectionResult.categories.length > 0 && (
              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    if (detectionResult.categories[0].confidence === 'high') {
                      handleCategoryConfirm(detectionResult.categories[0].category);
                    } else {
                      handleManualCategorySelect();
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                           rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Continue with "{formState.solutionName}"
                      </span>
                      {detectionResult.categories[0].confidence === 'high' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          as new solution
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </div>
            )}
            
            {/* No matches at all */}
            {detectionResult.solutions.length === 0 && 
             detectionResult.categories.length === 0 && 
             detectionResult.keywordMatches.length === 0 && (
              <div className="p-4">
                <button
                  onClick={handleManualCategorySelect}
                  className="w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           px-3 py-2 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>Add "{formState.solutionName}" as new solution</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </div>
            )}
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

      <div className="flex justify-between pt-4">
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
      </div>
    </div>
  );
}
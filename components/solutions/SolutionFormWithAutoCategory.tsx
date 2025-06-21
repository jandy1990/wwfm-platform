// components/solutions/SolutionFormWithAutoCategory.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAutoCategorization } from '@/lib/hooks/useAutoCategorization';
import { SolutionMatch } from '@/lib/services/auto-categorization';
import { CategoryConfirmation } from '@/components/solutions/CategoryConfirmation';
import { CategoryPicker } from '@/components/solutions/CategoryPicker';
import SolutionSearchResults from '@/components/solutions/SolutionSearchResults';
import { DosageForm } from '@/components/solutions/forms/DosageForm';

interface SolutionFormWithAutoCategoryProps {
  goalId: string;
  goalTitle?: string; // Add this prop
  userId: string;
  onCancel: () => void;
}

export default function SolutionFormWithAutoCategory({
  goalId,
  goalTitle,
  userId,
  onCancel
}: SolutionFormWithAutoCategoryProps) {
  const router = useRouter();
  const [solutionName, setSolutionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<SolutionMatch | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    if (solutionName.length >= 2) {
      detectFromInput(solutionName);
    } else {
      clearResults();
    }
  }, [solutionName, detectFromInput, clearResults]);

  const handleSelectExistingSolution = (solution: SolutionMatch) => {
    setSelectedSolution(solution);
    setSolutionName(solution.title);
    setSelectedCategory(solution.category);
    setShowForm(true);
  };

  const handleCategoryConfirm = (category: string) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleManualCategorySelect = () => {
    setShowCategoryPicker(true);
  };

  const handleCategoryPick = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
    setShowForm(true);
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
      setSelectedCategory(null);
      setSelectedSolution(null);
    } else if (showCategoryPicker) {
      setShowCategoryPicker(false);
    } else {
      onCancel();
    }
  };

  // Render the appropriate form based on category
  const renderForm = () => {
    if (!selectedCategory || !showForm) return null;

    const formProps = {
      goalId,
      goalTitle: actualGoalTitle, // Pass the actual goal title
      userId,
      solutionName: selectedSolution ? selectedSolution.title : solutionName,
      category: selectedCategory,
      existingSolutionId: selectedSolution?.id,
      onBack: handleBack
    };

    // Map categories to their form templates
    const categoryFormMap: Record<string, JSX.Element> = {
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

    return categoryFormMap[selectedCategory] || (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Form for {selectedCategory} is coming soon!
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

  // Show category picker
  if (showCategoryPicker) {
    return (
      <CategoryPicker
        onSelectCategory={handleCategoryPick}
        onBack={handleBack}
      />
    );
  }

  // Show the selected form
  if (showForm) {
    return renderForm();
  }

  // Main search interface (rest of the component remains the same)
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
        <input
          id="solution-name"
          type="text"
          value={solutionName}
          onChange={(e) => setSolutionName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-800 dark:text-white"
          placeholder="e.g., Headspace, Vitamin D, Running, Therapy..."
          autoFocus
        />
        
        {/* Rest of the autocomplete dropdown code remains the same... */}
        {solutionName.length >= 2 && !isLoading && detectionResult && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 
                        dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            
            {/* Existing solutions */}
            {detectionResult.solutions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                  Existing solutions
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
            
            {/* "Try being more specific" suggestions */}
            {detectionResult.solutions.length === 0 && 
             ['therapy', 'medication', 'supplement', 'exercise', 'vitamin', 'app', 'treatment', 'counseling', 'workout'].some(term => 
               solutionName.toLowerCase().includes(term)
             ) && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Try being more specific
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {solutionName.toLowerCase().includes('therapy') && (
                        <>"{solutionName}" → "CBT therapy" or "EMDR" or "talk therapy"</>
                      )}
                      {solutionName.toLowerCase().includes('medication') && (
                        <>"{solutionName}" → specific drug name like "Lexapro" or "Tylenol"</>
                      )}
                      {solutionName.toLowerCase().includes('supplement') && (
                        <>"{solutionName}" → "Vitamin D" or "Omega-3" or "Magnesium"</>
                      )}
                      {solutionName.toLowerCase().includes('exercise') && (
                        <>"{solutionName}" → "Running" or "Yoga" or "CrossFit"</>
                      )}
                      {solutionName.toLowerCase().includes('vitamin') && (
                        <>"{solutionName}" → "Vitamin D" or "B12" or "Vitamin C"</>
                      )}
                      {solutionName.toLowerCase().includes('app') && (
                        <>"{solutionName}" → "Headspace" or "MyFitnessPal" or "Calm"</>
                      )}
                      {solutionName.toLowerCase().includes('treatment') && (
                        <>"{solutionName}" → specific treatment like "Acupuncture" or "Physical therapy"</>
                      )}
                      {solutionName.toLowerCase().includes('counseling') && (
                        <>"{solutionName}" → "Marriage counseling" or "Career counseling"</>
                      )}
                      {solutionName.toLowerCase().includes('workout') && (
                        <>"{solutionName}" → "HIIT workout" or "Strength training" or "Pilates"</>
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
                    <span className="text-gray-700 dark:text-gray-300">
                      Continue with "{solutionName}"
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </div>
            )}
            
            {/* No matches at all */}
            {detectionResult.solutions.length === 0 && detectionResult.categories.length === 0 && (
              <div className="p-4">
                <button
                  onClick={handleManualCategorySelect}
                  className="w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           px-3 py-2 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>Add "{solutionName}" as new solution</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && solutionName.length >= 2 && (
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
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                   dark:hover:text-gray-200 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
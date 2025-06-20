// components/solutions/SolutionFormWithAutoCategory.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoCategorization } from '@/lib/hooks/useAutoCategorization';
import { getCategoryDisplayName } from '@/lib/services/auto-categorization';
import { CategoryConfirmation } from './CategoryConfirmation';
import { CategoryPicker } from './CategoryPicker';
import { DosageForm } from './forms/DosageForm';
import type { CategoryMatch } from '@/lib/services/auto-categorization';
// We'll import the other 8 form templates here once built
// import { SessionForm } from './forms/SessionForm';
// import { PracticeForm } from './forms/PracticeForm';
// etc...

interface SolutionFormProps {
  goalId: string;
  goalTitle: string;
  userId: string;
  goalSlug: string;
}

export function SolutionFormWithAutoCategory({ 
  goalId, 
  goalTitle, 
  userId, 
  goalSlug 
}: SolutionFormProps) {
  const router = useRouter();
  const [solutionName, setSolutionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<CategoryMatch | null>(null);
  
  const { matches, isLoading, detectFromInput } = useAutoCategorization();

  // Step 1: User types solution name
  const handleSolutionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSolutionName(value);
    detectFromInput(value);
    setSelectedCategory(null); // Reset category when typing
    setShowConfirmation(false); // Reset confirmation
    setSelectedMatch(null); // Reset selected match
  };

  // Step 2: User confirms detected category
  const handleCategoryConfirm = (category: string) => {
    setSelectedCategory(category);
    setShowConfirmation(false);
    setSelectedMatch(null);
  };

  // Step 3: User wants different category
  const handleChooseDifferent = () => {
    setShowConfirmation(false);
    setShowCategoryPicker(true);
    setSelectedMatch(null);
  };

  // Handle manual category selection
  const handleManualCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  // Render the appropriate form based on selected category
  const renderForm = () => {
    if (!selectedCategory) return null;

    // Common props for all forms
    const formProps = {
      goalId,
      userId,
      solutionName,
      category: selectedCategory,
      onBack: () => setSelectedCategory(null)
    };

    // Map categories to their form templates
    const dosageCategories = ['supplements_vitamins', 'medications', 'natural_remedies', 'beauty_skincare'];
    
    if (dosageCategories.includes(selectedCategory)) {
      return <DosageForm {...formProps} />;
    }

    // Add other form types as we build them
    const sessionCategories = ['therapists_counselors', 'doctors_specialists', 'coaches_mentors', 
                              'alternative_practitioners', 'professional_services', 'medical_procedures', 
                              'crisis_resources'];
    
    if (sessionCategories.includes(selectedCategory)) {
      return <div>Session Form Component (TODO)</div>;
    }

    return <div>Form not implemented yet for {getCategoryDisplayName(selectedCategory)}</div>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share What Worked</h1>
        <p className="text-gray-600">
          for "{goalTitle}"
        </p>
      </div>

      {/* Step 1: Solution Name Input */}
      {!selectedCategory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="block mb-4">
            <span className="text-lg font-medium mb-2 block">
              What worked for you?
            </span>
            <input
              type="text"
              value={solutionName}
              onChange={handleSolutionNameChange}
              placeholder="e.g., Headspace, Vitamin D, my therapist..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </label>

          {/* Loading state */}
          {isLoading && solutionName.length >= 3 && (
            <div className="mt-4 text-gray-500">
              Looking for category match...
            </div>
          )}

          {/* Auto-detected matches */}
          {matches.length > 0 && !showConfirmation && !showCategoryPicker && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">
                Click to select a category:
              </p>
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMatch(match);
                      setShowConfirmation(true);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                      match.confidence === 'high' ? 'border-blue-500 bg-blue-50' :
                      match.confidence === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {getCategoryDisplayName(match.category)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {match.confidence}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowCategoryPicker(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Choose different category →
              </button>
            </div>
          )}

          {/* No matches - show manual picker button */}
          {solutionName.length >= 3 && matches.length === 0 && !isLoading && (
            <div className="mt-6">
              <p className="text-gray-500 mb-3">
                No category detected for "{solutionName}"
              </p>
              <button
                onClick={() => setShowCategoryPicker(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose category manually
              </button>
            </div>
          )}

          {/* Category confirmation */}
          {showConfirmation && selectedMatch && (
            <div className="mt-6">
              <CategoryConfirmation
                matches={[selectedMatch]}
                onConfirm={handleCategoryConfirm}
                onChooseDifferent={handleChooseDifferent}
              />
            </div>
          )}

          {/* Manual category picker */}
          {showCategoryPicker && (
            <div className="mt-6">
              <CategoryPicker
                onSelectCategory={handleManualCategorySelect}
                onBack={() => setShowCategoryPicker(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Show the appropriate form */}
      {selectedCategory && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{solutionName}</h2>
              <p className="text-gray-600">Category: {getCategoryDisplayName(selectedCategory)}</p>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Change
            </button>
          </div>
          
          {renderForm()}
        </div>
      )}
    </div>
  );
}
// components/solutions/AutoCategoryTest.tsx

'use client';

import { useState } from 'react';
import { useAutoCategorization } from '../../lib/hooks/useAutoCategorization';
import { getCategoryDisplayName } from '../../lib/services/auto-categorization';
import { CategoryConfirmation } from './CategoryConfirmation';
import { CategoryPicker } from './CategoryPicker';

export function AutoCategoryTest() {
  const [input, setInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { matches, isLoading, error, detectFromInput } = useAutoCategorization();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    detectFromInput(value);
    setShowConfirmation(false); // Reset confirmation when typing
    setShowCategoryPicker(false); // Reset picker when typing
  };

  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = (category: string) => {
    console.log('User confirmed category:', category);
    // Here we'd navigate to the appropriate form
  };

  const handleChooseDifferent = () => {
    console.log('User wants to choose different category');
    setShowConfirmation(false);
    setShowCategoryPicker(true);
  };

  const handleCategorySelect = (category: string) => {
    console.log('User manually selected category:', category);
    setShowCategoryPicker(false);
    // Here we'd navigate to the appropriate form
  };

  // If showing category picker, show only that
  if (showCategoryPicker) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <CategoryPicker
          onSelectCategory={handleCategorySelect}
          onBack={() => setShowCategoryPicker(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Test Auto-Categorization</h2>
      
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Type a solution name... (e.g., 'Headspace', 'Vitamin D', 'therapist')"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading && (
        <div className="mt-4 text-gray-500">Detecting category...</div>
      )}

      {error && (
        <div className="mt-4 text-red-500">Error: {error}</div>
      )}

      {/* Show confirmation if user clicked to confirm or if high confidence match */}
      {showConfirmation && matches.length > 0 ? (
        <div className="mt-4">
          <CategoryConfirmation
            matches={matches}
            onConfirm={handleConfirm}
            onChooseDifferent={handleChooseDifferent}
          />
        </div>
      ) : (
        <>
          {matches.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Detected Categories:</h3>
              {matches.map((match, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                    match.confidence === 'exact' ? 'border-green-500 bg-green-50' :
                    match.confidence === 'high' ? 'border-blue-500 bg-blue-50' :
                    match.confidence === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-gray-300 bg-gray-50'
                  }`}
                  onClick={handleShowConfirmation}
                >
                  <div className="font-medium">
                    {getCategoryDisplayName(match.category)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Confidence: {match.confidence} | Source: {match.source}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Click to select this category
                  </div>
                </div>
              ))}
            </div>
          )}

          {input.length >= 3 && matches.length === 0 && !isLoading && (
            <div className="mt-4">
              <p className="text-gray-500 mb-3">
                No category detected for "{input}"
              </p>
              <button
                onClick={() => setShowCategoryPicker(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose category manually
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
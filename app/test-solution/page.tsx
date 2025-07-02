// app/test-solution-search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAutoCategorization } from '@/lib/hooks/useAutoCategorization';
import { supabase } from '@/lib/supabase';
import SolutionFormWithAutoCategory from '@/components/solutions/SolutionFormWithAutoCategory';

export default function TestSolutionSearchPage() {
  const [showForm, setShowForm] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [existingSolutions, setExistingSolutions] = useState<any[]>([]);
  const { detectionResult, isLoading, error, detectFromInput } = useAutoCategorization();

  // Load some existing solutions to show what's in the database
  useEffect(() => {
    async function loadSolutions() {
      const { data } = await supabase
        .from('solutions_v2')
        .select('id, title, solution_category, solution_model, parent_concept, is_approved')
        .limit(20)
        .order('created_at', { ascending: false });
      
      if (data) {
        setExistingSolutions(data);
      }
    }
    loadSolutions();
  }, []);

  const handleTestSearch = () => {
    detectFromInput(testInput);
  };

  // Auto-detect as user types (like in the real form)
  useEffect(() => {
    if (testInput.length >= 2) {
      detectFromInput(testInput);
    }
  }, [testInput, detectFromInput]);

  // Test data to try
  const testCases = [
    { input: 'therapy', expected: 'Should NOT show generic therapy types as solutions' },
    { input: 'DBT therapy', expected: 'Should NOT show as solution (generic therapy type)' },
    { input: 'BetterHelp', expected: 'Should show as solution if exists (specific provider)' },
    { input: 'headspace', expected: 'Should find solution if exists, show Apps & Software category' },
    { input: 'vitamin d', expected: 'Should find solution if exists, show Supplements & Vitamins category' },
    { input: 'therapist', expected: 'Should detect Therapists & Counselors category' },
    { input: 'running', expected: 'Should detect Exercise & Movement category' },
    { input: 'xyzabc123', expected: 'Should find no matches and prompt for manual selection' },
  ];

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Testing Solution Form Integration</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <SolutionFormWithAutoCategory
            goalId="test-goal-id"
            userId="test-user-id"
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test Solution-First Search</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing the new flow where we search for existing solutions before suggesting categories
        </p>
      </div>

      {/* Existing Solutions in Database */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Solutions in Database</h2>
        {existingSolutions.length === 0 ? (
          <p className="text-gray-500">No solutions in database yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingSolutions.map(sol => (
              <div key={sol.id} className="text-sm">
                <span className="font-medium">{sol.title}</span>
                <span className="block text-xs text-gray-500">{sol.solution_category}</span>
                <span className={`text-xs ${sol.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                  {sol.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Search</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={testInput}
            onChange={(e) => {
              setTestInput(e.target.value);
              // Trigger detection immediately on change
              if (e.target.value.length >= 2) {
                detectFromInput(e.target.value);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleTestSearch()}
            placeholder="Type a solution name..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleTestSearch}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium 
                     rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        {/* Test Cases */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Quick Test Cases:</h3>
          <div className="flex flex-wrap gap-2">
            {testCases.map((test) => (
              <button
                key={test.input}
                onClick={() => {
                  setTestInput(test.input);
                  detectFromInput(test.input);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 
                         dark:hover:bg-gray-600 rounded-md transition-colors"
                title={test.expected}
              >
                "{test.input}"
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-3 py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                        dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Results */}
        {detectionResult && !isLoading && (
          <div className="space-y-6">
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Search Results for "{detectionResult.searchTerm}"</h3>
              
              {/* Solutions Found */}
              <div className="mb-6">
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                  Existing Solutions ({detectionResult.solutions.length})
                </h4>
                {detectionResult.solutions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No existing solutions found</p>
                ) : (
                  <div className="space-y-2">
                    {detectionResult.solutions.map(sol => (
                      <div key={sol.id} className="p-3 bg-green-50 dark:bg-green-900/20 
                                                  rounded-md border border-green-200 dark:border-green-800">
                        <div className="font-medium">{sol.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {sol.categoryDisplayName} | Match: {sol.matchType}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories Detected */}
              <div>
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                  Categories Detected ({detectionResult.categories.length})
                </h4>
                {detectionResult.categories.length === 0 ? (
                  <p className="text-gray-500 text-sm">No categories detected</p>
                ) : (
                  <div className="space-y-2">
                    {detectionResult.categories.map(cat => (
                      <div key={cat.category} className="p-3 bg-blue-50 dark:bg-blue-900/20 
                                                        rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="font-medium">{cat.displayName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Confidence: {cat.confidence} | {cat.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Raw JSON for debugging */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                View Raw Detection Result (for debugging)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                {JSON.stringify(detectionResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Test Full Form Flow */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Full Form Flow</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Click below to test the complete solution form with the new search functionality
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium 
                   rounded-lg transition-colors"
        >
          Open Solution Form
        </button>
      </div>
    </div>
  );
}
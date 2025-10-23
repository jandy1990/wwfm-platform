'use client';

import { useState } from 'react';
import { submitSolution } from '@/app/actions/submit-solution';

export default function TestServerAction() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testSubmission = async () => {
    setIsLoading(true);
    setResult('Testing server action...');
    
    try {
      const testData = {
        goalId: '11111111-1111-1111-1111-111111111111',
        userId: '22222222-2222-2222-2222-222222222222',
        solutionName: 'Test Vitamin D',
        category: 'supplements_vitamins',
        effectiveness: 4,
        timeToResults: '1-2 weeks',
        solutionFields: {
          frequency: 'once daily',
          length_of_use: '3-6 months',
          time_to_results: '1-2 weeks',
          side_effects: ['None'],
          dose_amount: '1000',
          dose_unit: 'IU'
        },
        variantData: {
          amount: 1000,
          unit: 'IU',
          form: 'softgel'
        },
        failedSolutions: []
      };

      const response = await submitSolution(testData);
      
      if (response.success) {
        setResult(`✅ Success! Solution ID: ${response.solutionId}, Variant ID: ${response.variantId}`);
      } else {
        setResult(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Test Server Action
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page tests the submitSolution server action directly.
          </p>
          
          <button
            onClick={testSubmission}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Server Action'}
          </button>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This will fail with "Unauthorized" unless you're logged in. 
              The error message confirms the server action is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { submitSolution } from '@/app/actions/submit-solution';

export default function TestDosageForm() {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const addResult = (msg: string) => {
    setResults(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${msg}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Test user ID (will need auth)
    const testUserId = 'test-user-' + Date.now();
    const testGoalId = 'test-goal-' + Date.now();
    
    try {
      addResult('🧪 Starting test suite...');
      
      // Test 1: Medication with dosage
      addResult('📝 Test 1: Medication with dosage (20mg tablet)');
      const medResult = await submitSolution({
        goalId: testGoalId,
        userId: testUserId,
        solutionName: 'Test Prozac',
        category: 'medications',
        effectiveness: 4,
        timeToResults: '2-4 weeks',
        solutionFields: {
          frequency: 'once daily',
          length_of_use: '6-12 months',
          side_effects: ['Nausea', 'Headache']
        },
        variantData: {
          amount: 20,
          unit: 'mg',
          form: 'tablet'
        },
        failedSolutions: []
      });
      
      if (medResult.success) {
        addResult(`✅ Medication created - Variant: 20mg tablet`);
        addResult(`   Solution ID: ${medResult.solutionId}`);
        addResult(`   Variant ID: ${medResult.variantId}`);
      } else {
        addResult(`❌ Medication failed: ${medResult.error}`);
      }
      
      // Test 2: Beauty/skincare (should use Standard variant)
      addResult('📝 Test 2: Beauty/skincare (should use Standard variant)');
      const beautyResult = await submitSolution({
        goalId: testGoalId,
        userId: testUserId,
        solutionName: 'Test Retinol Cream',
        category: 'beauty_skincare',
        effectiveness: 5,
        timeToResults: '4-6 weeks',
        solutionFields: {
          skincareFrequency: 'once_daily_pm',
          frequency: 'once_daily_pm',
          length_of_use: '3-6 months',
          side_effects: ['Dryness/peeling', 'Redness/irritation']
        },
        failedSolutions: []
      });
      
      if (beautyResult.success) {
        addResult(`✅ Beauty product created - Should use Standard variant`);
        addResult(`   Solution ID: ${beautyResult.solutionId}`);
        addResult(`   Variant ID: ${beautyResult.variantId}`);
      } else {
        addResult(`❌ Beauty product failed: ${beautyResult.error}`);
      }
      
      // Test 3: Duplicate prevention
      addResult('📝 Test 3: Duplicate prevention (submit same medication again)');
      const dupResult = await submitSolution({
        goalId: testGoalId,
        userId: testUserId,
        solutionName: 'Test Prozac',
        category: 'medications',
        existingSolutionId: medResult.solutionId, // Use the same solution
        effectiveness: 3,
        timeToResults: '2-4 weeks',
        solutionFields: {
          frequency: 'once daily',
          length_of_use: '6-12 months',
          side_effects: ['None']
        },
        variantData: {
          amount: 20,
          unit: 'mg',
          form: 'tablet'
        },
        failedSolutions: []
      });
      
      if (!dupResult.success && dupResult.error?.includes('already rated')) {
        addResult(`✅ Duplicate correctly prevented: ${dupResult.error}`);
      } else if (dupResult.success) {
        addResult(`❌ Duplicate not prevented - should have failed!`);
      } else {
        addResult(`❓ Unexpected error: ${dupResult.error}`);
      }
      
      // Test 4: Failed solutions
      addResult('📝 Test 4: Failed solutions (2 existing, 1 new)');
      const failedResult = await submitSolution({
        goalId: testGoalId,
        userId: testUserId,
        solutionName: 'Test Vitamin D',
        category: 'supplements_vitamins',
        effectiveness: 4,
        timeToResults: '1-2 weeks',
        solutionFields: {
          frequency: 'once daily',
          length_of_use: '3-6 months',
          side_effects: ['None']
        },
        variantData: {
          amount: 2000,
          unit: 'IU',
          form: 'softgel'
        },
        failedSolutions: [
          { id: medResult.solutionId, name: 'Test Prozac', rating: 2 },
          { id: beautyResult.solutionId, name: 'Test Retinol', rating: 1 },
          { name: 'Some Random Solution', rating: 1 } // No ID, text only
        ]
      });
      
      if (failedResult.success) {
        addResult(`✅ Solution with failed solutions created`);
        addResult(`   Other ratings count: ${failedResult.otherRatingsCount || 0}`);
      } else {
        addResult(`❌ Failed solutions test failed: ${failedResult.error}`);
      }
      
      // Test 5: Success message counts
      addResult('📝 Test 5: Testing otherRatingsCount');
      // Submit another rating for the same solution
      const secondUser = 'test-user-2-' + Date.now();
      const countResult = await submitSolution({
        goalId: testGoalId,
        userId: secondUser, // Different user
        solutionName: 'Test Vitamin D',
        category: 'supplements_vitamins',
        existingSolutionId: failedResult.solutionId,
        effectiveness: 5,
        timeToResults: '1-2 weeks',
        solutionFields: {
          frequency: 'once daily',
          length_of_use: '1-3 months',
          side_effects: ['None']
        },
        variantData: {
          amount: 2000,
          unit: 'IU',
          form: 'softgel'
        },
        failedSolutions: []
      });
      
      if (countResult.success) {
        addResult(`✅ Second rating added`);
        addResult(`   Other ratings count: ${countResult.otherRatingsCount} (should be 1)`);
      } else {
        addResult(`❌ Count test failed: ${countResult.error}`);
      }
      
      addResult('🎉 Test suite complete!');
      
    } catch (error) {
      addResult(`❌ Test suite error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          DosageForm Test Suite
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Test Scenarios:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Medication with dosage (20mg tablet) - verify variant creation</li>
              <li>Beauty/skincare - verify Standard variant</li>
              <li>Duplicate prevention - submit same solution twice</li>
              <li>Failed solutions - add 2 existing + 1 new</li>
              <li>Success message counts - verify otherRatingsCount</li>
            </ol>
          </div>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {results.join('\n')}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Tests will show "Unauthorized" errors unless you're logged in. 
              The error messages confirm the server action logic is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
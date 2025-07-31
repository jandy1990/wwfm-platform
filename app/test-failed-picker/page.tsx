'use client';

import { useState } from 'react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';

export default function TestFailedPicker() {
  const [solutions, setSolutions] = useState<any[]>([]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Test Failed Solutions Picker</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Failed Solutions Picker Component</h2>
        
        <FailedSolutionsPicker
          goalId="test-goal-id"
          goalTitle="Test Goal"
          solutionName="Vitamin D"
          onSolutionsChange={(sols) => {
            console.log('Solutions changed:', sols);
            setSolutions(sols);
          }}
          existingSolutions={solutions}
        />
        
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Current Solutions:</h3>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(solutions, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm">
          Try typing: "vitamin", "therapy", "meditation", "running", etc.
        </p>
        <p className="text-sm mt-2">
          Check the browser console for debug logs.
        </p>
      </div>
    </div>
  );
}
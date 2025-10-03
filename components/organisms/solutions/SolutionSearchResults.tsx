// components/solutions/SolutionSearchResults.tsx
'use client';

import { SolutionMatch } from '@/lib/solutions/categorization';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SolutionSearchResultsProps {
  solutions: SolutionMatch[];
  onSelectSolution: (solution: SolutionMatch) => void;
}

export default function SolutionSearchResults({ 
  solutions, 
  onSelectSolution
}: SolutionSearchResultsProps) {
  if (solutions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>Found {solutions.length} existing solution{solutions.length > 1 ? 's' : ''}:</span>
      </div>
      
      <div className="space-y-2">
        {solutions.map((solution) => (
          <button
            key={solution.id}
            onClick={() => onSelectSolution(solution)}
            className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 
                     hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200
                     bg-white dark:bg-gray-800 group hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                  {solution.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {solution.categoryDisplayName}
                </p>
                {solution.matchType === 'exact' && (
                  <span className="inline-flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Exact match
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 
                            group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium hidden sm:inline">
                  Share your experience
                </span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* More prominent "add new" section */}
      <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Not what you're looking for?
          </span>
        </div>
      </div>
    </div>
  );
}

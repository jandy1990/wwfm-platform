// components/goals/RelatedGoalsNavigation.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RelatedGoal } from '@/lib/solutions/related-goals';

interface RelatedGoalsNavigationProps {
  currentGoal: {
    id: string;
    title: string;
  };
  relatedGoals: RelatedGoal[];
  onGoalClick?: (fromGoalId: string, toGoalId: string, position: number) => void;
}

export function RelatedGoalsNavigation({
  currentGoal,
  relatedGoals,
  onGoalClick
}: RelatedGoalsNavigationProps) {
  console.log('RelatedGoalsNavigation props:', { currentGoal, relatedGoals })
  
  const pathname = usePathname();
  
  // Don't show if no related goals
  if (!relatedGoals || relatedGoals.length === 0) {
    return null;
  }

  // Combine current goal with related goals for the tab display
  const allGoals = [
    { ...currentGoal, strength: 1.0, relationship_type: 'current' as const },
    ...relatedGoals.slice(0, 5) // Show max 5 related goals
  ];

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'progression':
        return '→';
      case 'alternative':
        return '↔';
      case 'prerequisite':
        return '←';
      default:
        return '';
    }
  };

  const getRelationshipLabel = (type: string, strength: number) => {
    const percentage = Math.round(strength * 100);
    switch (type) {
      case 'commonly_paired':
        return `${percentage}% also work on this`;
      case 'progression':
        return 'Natural next step';
      case 'alternative':
        return 'Alternative approach';
      case 'prerequisite':
        return 'Consider this first';
      default:
        return `${percentage}% related`;
    }
  };

  return (
    <div className="border-b bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-3">Related challenges you might face:</p>
          
          <div className="flex flex-wrap gap-2">
            {allGoals.map((goal, index) => {
              const isActive = pathname.includes(goal.id);
              const isCurrentGoal = goal.id === currentGoal.id;
              
              return (
                <Link
                  key={goal.id}
                  href={`/goal/${goal.id}`}
                  onClick={() => {
                    if (!isCurrentGoal && onGoalClick) {
                      onGoalClick(currentGoal.id, goal.id, index);
                    }
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-lg transition-all duration-200",
                    "border hover:shadow-md",
                    isActive
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!isCurrentGoal && goal.relationship_type && (
                      <span className="text-xs text-gray-500">
                        {getRelationshipIcon(goal.relationship_type)}
                      </span>
                    )}
                    
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-blue-700" : "text-gray-700"
                    )}>
                      {goal.title}
                    </span>
                    
                    {isCurrentGoal && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  {!isCurrentGoal && goal.strength < 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {getRelationshipLabel(goal.relationship_type || 'commonly_paired', goal.strength)}
                    </div>
                  )}
                </Link>
              );
            })}
            
            {relatedGoals.length > 5 && (
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                + {relatedGoals.length - 5} more related
              </button>
            )}
          </div>
          
          {/* Optional: Show solution overlap */}
          <div className="mt-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              23 solutions work across multiple selected goals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for a more compact mobile view
export function RelatedGoalsNavigationMobile({
  currentGoal,
  relatedGoals,
  onGoalClick
}: RelatedGoalsNavigationProps) {
  if (!relatedGoals || relatedGoals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-b">
      <div className="px-4 py-3">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-sm font-medium text-gray-700">
              Related challenges ({relatedGoals.length})
            </span>
            <svg 
              className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          <div className="mt-3 space-y-2">
            {relatedGoals.map((goal, index) => (
              <Link
                key={goal.id}
                href={`/goal/${goal.id}`}
                onClick={() => onGoalClick?.(currentGoal.id, goal.id, index)}
                className="block px-3 py-2 bg-white rounded-md border border-gray-200 hover:border-gray-300"
              >
                <div className="font-medium text-gray-700">{goal.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(goal.strength * 100)}% of users also work on this
                </div>
              </Link>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
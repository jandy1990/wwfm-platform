// components/solutions/CategoryPicker.tsx

'use client';

import { useState } from 'react';
import { getCategoryDisplayName } from '@/lib/solutions/categorization';

const categoryGroups = {
  'Things you take': [
    'supplements_vitamins',
    'medications', 
    'natural_remedies',
    'beauty_skincare'
  ],
  'People you see': [
    'therapists_counselors',
    'doctors_specialists',
    'coaches_mentors',
    'alternative_practitioners',
    'professional_services',
    'medical_procedures',
    'crisis_resources'
  ],
  'Things you do': [
    'exercise_movement',
    'meditation_mindfulness',
    'habits_routines',
    'hobbies_activities',
    'groups_communities',
    'support_groups'
  ],
  'Things you use': [
    'apps_software',
    'products_devices',
    'books_courses'
  ],
  'Changes you make': [
    'diet_nutrition',
    'sleep'
  ],
  'Financial': [
    'financial_products'
  ]
};

interface CategoryPickerProps {
  onSelectCategory: (category: string) => void;
  onBack?: () => void;
}

export function CategoryPicker({ onSelectCategory, onBack }: CategoryPickerProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (groupName: string) => {
    setExpandedGroup(expandedGroup === groupName ? null : groupName);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose a category</h2>
        <p className="text-gray-600">
          Select the category that best describes what worked for you
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(categoryGroups).map(([groupName, categories]) => (
          <div key={groupName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGroup(groupName)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <span className="font-medium text-lg">{groupName}</span>
              <span className="text-gray-400">
                {expandedGroup === groupName ? '−' : '+'}
              </span>
            </button>
            
            {expandedGroup === groupName && (
              <div className="p-2 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    {getCategoryDisplayName(category)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
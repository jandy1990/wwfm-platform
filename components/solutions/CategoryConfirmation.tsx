// components/solutions/CategoryConfirmation.tsx

'use client';

import { CategoryMatch } from '@/lib/services/auto-categorization';
import { getCategoryDisplayName } from '@/lib/services/auto-categorization';

interface CategoryInfo {
  description: string;
  formFields: string;
  timeEstimate: string;
}

// Our 23 category descriptions
const categoryInfo: Record<string, CategoryInfo> = {
  'supplements_vitamins': {
    description: 'Vitamins, minerals, nutritional supplements',
    formFields: 'dosage, frequency, side effects, brand',
    timeEstimate: '2 minutes'
  },
  'medications': {
    description: 'Prescription drugs, over-the-counter medicines',
    formFields: 'dosage, frequency, side effects',
    timeEstimate: '2 minutes'
  },
  'natural_remedies': {
    description: 'Herbs, plant-based supplements, homeopathic treatments',
    formFields: 'dosage, frequency, side effects',
    timeEstimate: '2 minutes'
  },
  'beauty_skincare': {
    description: 'Skincare products, cosmetics, beauty treatments',
    formFields: 'product type, frequency, side effects, brand',
    timeEstimate: '2 minutes'
  },
  'therapists_counselors': {
    description: 'Mental health professionals, counselors, psychologists',
    formFields: 'session frequency, cost, insurance, format',
    timeEstimate: '2 minutes'
  },
  'doctors_specialists': {
    description: 'Medical doctors, specialists, psychiatrists, chiropractors',
    formFields: 'visit frequency, cost, insurance, wait time',
    timeEstimate: '2 minutes'
  },
  'coaches_mentors': {
    description: 'Life coaches, career coaches, personal mentors',
    formFields: 'session frequency, cost, format',
    timeEstimate: '2 minutes'
  },
  'alternative_practitioners': {
    description: 'Acupuncturists, naturopaths, energy healers',
    formFields: 'session frequency, cost, side effects',
    timeEstimate: '2 minutes'
  },
  'professional_services': {
    description: 'Physical therapists, personal trainers, nutritionists, stylists',
    formFields: 'session frequency, cost, format',
    timeEstimate: '2 minutes'
  },
  'medical_procedures': {
    description: 'Surgeries, laser treatments, injections, medical tests',
    formFields: 'cost, recovery time, risks, effectiveness',
    timeEstimate: '3 minutes'
  },
  'crisis_resources': {
    description: 'Hotlines, emergency support, crisis services',
    formFields: 'availability, cost, format',
    timeEstimate: '1 minute'
  },
  'exercise_movement': {
    description: 'Workouts, sports, physical activities',
    formFields: 'frequency, equipment needed, difficulty, challenges',
    timeEstimate: '2 minutes'
  },
  'meditation_mindfulness': {
    description: 'Meditation practices, breathing exercises, mindfulness',
    formFields: 'frequency, duration, guidance type, challenges',
    timeEstimate: '2 minutes'
  },
  'habits_routines': {
    description: 'Daily habits, morning routines, productivity systems',
    formFields: 'time commitment, difficulty, challenges',
    timeEstimate: '2 minutes'
  },
  'hobbies_activities': {
    description: 'Creative hobbies, recreational activities, crafts',
    formFields: 'time commitment, costs, difficulty, enjoyment',
    timeEstimate: '3 minutes'
  },
  'groups_communities': {
    description: 'Clubs, meetups, social groups, classes',
    formFields: 'meeting frequency, cost, format, size',
    timeEstimate: '2 minutes'
  },
  'support_groups': {
    description: 'AA, grief support, condition-specific groups',
    formFields: 'meeting frequency, cost, format, approach',
    timeEstimate: '2 minutes'
  },
  'apps_software': {
    description: 'Mobile apps, software, digital tools',
    formFields: 'cost, features, platform, usage frequency',
    timeEstimate: '2 minutes'
  },
  'products_devices': {
    description: 'Physical products, gadgets, equipment',
    formFields: 'cost, ease of use, effectiveness',
    timeEstimate: '2 minutes'
  },
  'books_courses': {
    description: 'Self-help books, online courses, educational content',
    formFields: 'cost, format, difficulty, completion',
    timeEstimate: '2 minutes'
  },
  'diet_nutrition': {
    description: 'Eating plans, diets, nutritional changes',
    formFields: 'difficulty, cost impact, challenges, sustainability',
    timeEstimate: '2 minutes'
  },
  'sleep': {
    description: 'Sleep routines, bedtime changes, sleep aids',
    formFields: 'adjustment time, challenges, cost',
    timeEstimate: '2 minutes'
  },
  'financial_products': {
    description: 'Savings accounts, loans, investment tools',
    formFields: 'fees, interest rates, requirements, benefits',
    timeEstimate: '3 minutes'
  }
};

interface CategoryConfirmationProps {
  matches: CategoryMatch[];
  onConfirm: (category: string) => void;
  onChooseDifferent: () => void;
}

export function CategoryConfirmation({ 
  matches, 
  onConfirm, 
  onChooseDifferent 
}: CategoryConfirmationProps) {
  // Single high-confidence match
  if (matches.length === 1 && matches[0].confidence === 'high') {
    const match = matches[0];
    const info = categoryInfo[match.category];
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          Is this a {getCategoryDisplayName(match.category)}?
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <span className="text-lg mr-2">✨</span>
            <div>
              <p className="font-medium">{getCategoryDisplayName(match.category)} includes:</p>
              <p className="text-gray-600">{info.description}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-lg mr-2">📝</span>
            <div>
              <p className="text-gray-600">We'll ask about: {info.formFields}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-lg mr-2">⏱️</span>
            <div>
              <p className="text-gray-600">Takes {info.timeEstimate} to share</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(match.category)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yes, continue
          </button>
          <button
            onClick={onChooseDifferent}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            No, let me choose
          </button>
        </div>
      </div>
    );
  }
  
  // Multiple matches - show options
  if (matches.length > 1) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          Which type is this?
        </h3>
        
        <div className="space-y-3 mb-4">
          {matches.slice(0, 3).map((match) => {
            const info = categoryInfo[match.category];
            return (
              <button
                key={match.category}
                onClick={() => onConfirm(match.category)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium">{getCategoryDisplayName(match.category)}</div>
                <div className="text-sm text-gray-600 mt-1">✨ {info.description}</div>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={onChooseDifferent}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Choose different category
        </button>
      </div>
    );
  }
  
  // No matches - shouldn't happen if we handle this upstream
  return null;
}
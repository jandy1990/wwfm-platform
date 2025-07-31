'use client';

import { useState } from 'react';

// Import all forms
import { DosageForm } from '@/components/organisms/solutions/forms/DosageForm';
import { AppForm } from '@/components/organisms/solutions/forms/AppForm';
import { HobbyForm } from '@/components/organisms/solutions/forms/HobbyForm';
import { PracticeForm } from '@/components/organisms/solutions/forms/PracticeForm';
import { SessionForm } from '@/components/organisms/solutions/forms/SessionForm';
import { PurchaseForm } from '@/components/organisms/solutions/forms/PurchaseForm';
import { CommunityForm } from '@/components/organisms/solutions/forms/CommunityForm';
import { LifestyleForm } from '@/components/organisms/solutions/forms/LifestyleForm';
import { FinancialForm } from '@/components/organisms/solutions/forms/FinancialForm';

// All 23 categories
const CATEGORIES = [
  // Dosage Forms (4 categories)
  { category: 'medications', form: 'DosageForm', icon: '💊', group: 'Dosage Forms' },
  { category: 'supplements_vitamins', form: 'DosageForm', icon: '💊', group: 'Dosage Forms' },
  { category: 'natural_remedies', form: 'DosageForm', icon: '🌿', group: 'Dosage Forms' },
  { category: 'beauty_skincare', form: 'DosageForm', icon: '✨', group: 'Dosage Forms' },
  
  // App Form (1 category)
  { category: 'apps_software', form: 'AppForm', icon: '📱', group: 'App Forms' },
  
  // Hobby Form (1 category)
  { category: 'hobbies_activities', form: 'HobbyForm', icon: '🎨', group: 'Hobby Forms' },
  
  // Practice Forms (3 categories)
  { category: 'exercise_movement', form: 'PracticeForm', icon: '🏃‍♂️', group: 'Practice Forms' },
  { category: 'meditation_mindfulness', form: 'PracticeForm', icon: '🧘‍♀️', group: 'Practice Forms' },
  { category: 'habits_routines', form: 'PracticeForm', icon: '📅', group: 'Practice Forms' },
  
  // Session Forms (7 categories)
  { category: 'therapists_counselors', form: 'SessionForm', icon: '💆‍♀️', group: 'Session Forms' },
  { category: 'doctors_specialists', form: 'SessionForm', icon: '👨‍⚕️', group: 'Session Forms' },
  { category: 'coaches_mentors', form: 'SessionForm', icon: '🎯', group: 'Session Forms' },
  { category: 'alternative_practitioners', form: 'SessionForm', icon: '🌸', group: 'Session Forms' },
  { category: 'professional_services', form: 'SessionForm', icon: '✂️', group: 'Session Forms' },
  { category: 'medical_procedures', form: 'SessionForm', icon: '🏥', group: 'Session Forms' },
  { category: 'crisis_resources', form: 'SessionForm', icon: '🆘', group: 'Session Forms' },
  
  // Purchase Forms (2 categories)
  { category: 'products_devices', form: 'PurchaseForm', icon: '🛒', group: 'Purchase Forms' },
  { category: 'books_courses', form: 'PurchaseForm', icon: '📚', group: 'Purchase Forms' },
  
  // Community Forms (2 categories)
  { category: 'support_groups', form: 'CommunityForm', icon: '👥', group: 'Community Forms' },
  { category: 'groups_communities', form: 'CommunityForm', icon: '🌍', group: 'Community Forms' },
  
  // Lifestyle Forms (2 categories)
  { category: 'diet_nutrition', form: 'LifestyleForm', icon: '🥗', group: 'Lifestyle Forms' },
  { category: 'sleep', form: 'LifestyleForm', icon: '😴', group: 'Lifestyle Forms' },
  
  // Financial Form (1 category)
  { category: 'financial_products', form: 'FinancialForm', icon: '💰', group: 'Financial Forms' },
];

// Test data - REPLACE WITH A REAL GOAL ID FROM YOUR DATABASE
const TEST_GOAL_ID = 'test-goal-uuid'; // TODO: Replace with real goal ID
const TEST_USER_ID = 'test-user-123';

export default function FormsTestPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleBack = () => {
    setSelectedCategory(null);
  };

  // Get the form component for selected category
  const getFormComponent = () => {
    if (!selectedCategory) return null;
    
    const categoryInfo = CATEGORIES.find(c => c.category === selectedCategory);
    if (!categoryInfo) return null;

    const formProps = {
      goalId: TEST_GOAL_ID,
      goalTitle: "Test Goal - Improve Overall Wellbeing",
      userId: TEST_USER_ID,
      solutionName: `Test ${selectedCategory.replace(/_/g, ' ')} Solution`,
      category: selectedCategory,
      onBack: handleBack
    };

    switch (categoryInfo.form) {
      case 'DosageForm':
        return <DosageForm {...formProps} />;
      case 'AppForm':
        return <AppForm {...formProps} />;
      case 'HobbyForm':
        return <HobbyForm {...formProps} />;
      case 'PracticeForm':
        return <PracticeForm {...formProps} />;
      case 'SessionForm':
        return <SessionForm {...formProps} />;
      case 'PurchaseForm':
        return <PurchaseForm {...formProps} />;
      case 'CommunityForm':
        return <CommunityForm {...formProps} />;
      case 'LifestyleForm':
        return <LifestyleForm {...formProps} />;
      case 'FinancialForm':
        return <FinancialForm {...formProps} />;
      default:
        return <div>Form not found</div>;
    }
  };

  // Show form if category selected
  if (selectedCategory) {
    const categoryInfo = CATEGORIES.find(c => c.category === selectedCategory);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                     font-medium flex items-center gap-2"
          >
            ← Back to categories
          </button>
          <div className="mt-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Testing: {selectedCategory.replace(/_/g, ' ')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Form Type: {categoryInfo?.form} • Group: {categoryInfo?.group}
            </p>
          </div>
        </div>
        {getFormComponent()}
      </div>
    );
  }

  // Group categories by form type
  const groupedCategories = CATEGORIES.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = [];
    }
    acc[category.group].push(category);
    return acc;
  }, {} as Record<string, typeof CATEGORIES>);

  // Show category list
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forms Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all 23 solution categories across 9 different form types. 
            Click any category below to test its 3-step wizard.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">9</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Form Types</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Transformed Forms</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Steps Per Form</div>
          </div>
        </div>
        
        {/* Categories grouped by form type */}
        <div className="space-y-8">
          {Object.entries(groupedCategories).map(([groupName, categories]) => (
            <div key={groupName}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {groupName}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({categories.length} categories)
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(({ category, form, icon }) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border 
                             border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400
                             hover:shadow-md transition-all text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{form}</div>
                    </div>
                    <div className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Testing Instructions</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click any category above to test its 3-step wizard form</li>
            <li>• Each form collects effectiveness rating and time-to-results (Step 1)</li>
            <li>• Step 2 varies by form type (side effects, challenges, issues, etc.)</li>
            <li>• Step 3 allows adding failed solutions that didn't work</li>
            <li>• Forms include validation, browser history support, and mobile optimization</li>
            <li>• <strong>Note:</strong> Update TEST_GOAL_ID in the code with a real goal ID from your database</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
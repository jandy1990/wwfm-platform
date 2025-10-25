'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/database/client';
import {
  Smartphone, Pill, Leaf, Sparkles, Users, Heart, Brain,
  TrendingUp, ShoppingBag, BookOpen, DollarSign, Briefcase,
  Activity, Coffee, Moon, Apple, Dumbbell, Target
} from 'lucide-react';

// Category configuration with form mapping
const FORM_CATEGORIES = [
  // AppForm (1)
  { category: 'apps_software', form: 'AppForm', icon: Smartphone, label: 'Apps & Software', color: 'purple' },

  // DosageForm (4)
  { category: 'medications', form: 'DosageForm', icon: Pill, label: 'Medications', color: 'blue' },
  { category: 'supplements_vitamins', form: 'DosageForm', icon: Pill, label: 'Supplements & Vitamins', color: 'green' },
  { category: 'natural_remedies', form: 'DosageForm', icon: Leaf, label: 'Natural Remedies', color: 'emerald' },
  { category: 'beauty_skincare', form: 'DosageForm', icon: Sparkles, label: 'Beauty & Skincare', color: 'pink' },

  // SessionForm (6)
  { category: 'therapists_counselors', form: 'SessionForm', icon: Users, label: 'Therapists & Counselors', color: 'indigo' },
  { category: 'doctors_specialists', form: 'SessionForm', icon: Heart, label: 'Doctors & Specialists', color: 'red' },
  { category: 'coaches_mentors', form: 'SessionForm', icon: TrendingUp, label: 'Coaches & Mentors', color: 'orange' },
  { category: 'alternative_practitioners', form: 'SessionForm', icon: Leaf, label: 'Alternative Practitioners', color: 'teal' },
  { category: 'professional_services', form: 'SessionForm', icon: Briefcase, label: 'Professional Services', color: 'slate' },
  { category: 'crisis_resources', form: 'SessionForm', icon: Heart, label: 'Crisis Resources', color: 'rose' },

  // PracticeForm (3)
  { category: 'meditation_mindfulness', form: 'PracticeForm', icon: Brain, label: 'Meditation & Mindfulness', color: 'violet' },
  { category: 'exercise_movement', form: 'PracticeForm', icon: Dumbbell, label: 'Exercise & Movement', color: 'cyan' },
  { category: 'habits_routines', form: 'PracticeForm', icon: Target, label: 'Habits & Routines', color: 'amber' },

  // HobbyForm (1)
  { category: 'hobbies_activities', form: 'HobbyForm', icon: Activity, label: 'Hobbies & Activities', color: 'lime' },

  // LifestyleForm (2)
  { category: 'diet_nutrition', form: 'LifestyleForm', icon: Apple, label: 'Diet & Nutrition', color: 'green' },
  { category: 'sleep', form: 'LifestyleForm', icon: Moon, label: 'Sleep', color: 'blue' },

  // CommunityForm (2)
  { category: 'support_groups', form: 'CommunityForm', icon: Users, label: 'Support Groups', color: 'purple' },
  { category: 'groups_communities', form: 'CommunityForm', icon: Users, label: 'Groups & Communities', color: 'indigo' },

  // FinancialForm (1)
  { category: 'financial_products', form: 'FinancialForm', icon: DollarSign, label: 'Financial Products', color: 'emerald' },

  // PurchaseForm (3)
  { category: 'products_devices', form: 'PurchaseForm', icon: ShoppingBag, label: 'Products & Devices', color: 'blue' },
  { category: 'books_courses', form: 'PurchaseForm', icon: BookOpen, label: 'Books & Courses', color: 'amber' },
  { category: 'online_services', form: 'PurchaseForm', icon: Briefcase, label: 'Online Services', color: 'cyan' },
];

interface Goal {
  id: string;
  title: string;
}

export default function TestFormsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('id, title')
        .order('title')
        .limit(50);

      if (!error && data) {
        setGoals(data);
        // Load from localStorage or use first goal
        const savedGoalId = localStorage.getItem('testFormsGoalId');
        if (savedGoalId && data.find(g => g.id === savedGoalId)) {
          setSelectedGoalId(savedGoalId);
        } else if (data.length > 0) {
          setSelectedGoalId(data[0].id);
        }
      }
      setLoading(false);
    };

    fetchGoals();
  }, [supabase]);

  const handleGoalChange = (goalId: string) => {
    setSelectedGoalId(goalId);
    localStorage.setItem('testFormsGoalId', goalId);
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Form Testing Playground
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test all 23 solution categories with full validation, toasts, and success screens
          </p>

          {/* Goal Selector */}
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-96"></div>
            </div>
          ) : goals.length > 0 ? (
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Testing with:
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => handleGoalChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400">
              No goals found in database. Please create a goal first.
            </div>
          )}
        </div>

        {/* Category Grid */}
        {selectedGoalId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FORM_CATEGORIES.map(({ category, form, icon: Icon, label, color }) => (
              <Link
                key={category}
                href={`/test-forms/${category}?goalId=${selectedGoalId}&testMode=true`}
                className={`group relative p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-800 hover:shadow-xl transition-all transform hover:scale-105
                          hover:border-${color}-500 dark:hover:border-${color}-400`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/30
                              flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>

                {/* Label */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-${color}-600 dark:group-hover:text-${color}-400 transition-colors">
                  {label}
                </h3>

                {/* Form Type Badge */}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {form}
                </span>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click any category card to test that form</li>
            <li>• Fill out the form with validation working as in production</li>
            <li>• Submit to see toasts and success screens</li>
            <li>• Auto-return to this page after 5 seconds</li>
            <li>• All submissions are real database entries using the selected goal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

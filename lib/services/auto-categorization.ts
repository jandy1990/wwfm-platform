// lib/services/auto-categorization.ts

import { supabase } from '@/lib/supabase';

// Types for our categorization results
export type ConfidenceLevel = 'exact' | 'high' | 'medium' | 'low';
export type MatchSource = 'existing_solution' | 'keyword' | 'pattern' | 'partial';

export interface CategoryMatch {
  category: string;
  confidence: ConfidenceLevel;
  source: MatchSource;
  displayName?: string; // Human-friendly category name
}

// Main function that detects categories
export async function detectCategory(userInput: string): Promise<CategoryMatch[]> {
  // Clean up the input
  const normalizedInput = userInput.toLowerCase().trim();
  
  console.log('Detecting category for:', normalizedInput); // Debug logging
  
  // TEMPORARY: Test if the UI works with hard-coded data
  if (normalizedInput === 'vitamin') {
    return [{
      category: 'supplements_vitamins',
      confidence: 'high' as ConfidenceLevel,
      source: 'keyword' as MatchSource,
      displayName: 'Supplements & Vitamins'
    }];
  }
  
  // Don't search for very short inputs
  if (normalizedInput.length < 3) {
    return [];
  }

  const matches: CategoryMatch[] = [];

  // 1. Check if this exact solution already exists in our database
  try {
    console.log('About to query solutions table...');
    const { data: existingSolution, error: existingError } = await supabase
      .from('solutions')
      .select('solution_category')
      .ilike('title', normalizedInput)
      .single();

    console.log('Existing solution check:', { existingSolution, existingError }); // Debug logging

  if (existingSolution) {
    matches.push({
      category: existingSolution.solution_category,
      confidence: 'exact',
      source: 'existing_solution'
    });
    return matches; // If we found an exact match, we're done!
  }

  } catch (e) {
    console.error('Solutions query failed:', e);
  }

  // 2. Check for keyword matches directly from category_keywords table
  try {
    console.log('About to query category_keywords table...');
    const { data: keywordMatches, error: keywordError } = await supabase
      .from('category_keywords')
      .select('category')
      .contains('keywords', [normalizedInput]);

    console.log('Keyword matches:', { keywordMatches, keywordError }); // Debug logging

    if (keywordError) {
      console.error('category_keywords query error:', keywordError);
    }

    keywordMatches?.forEach((match: any) => {
      matches.push({
        category: match.category,
        confidence: 'high',
        source: 'keyword'
      });
    });
  } catch (e) {
    console.error('category_keywords query failed:', e);
  }

  // 3. Check pattern matches using SQL pattern matching
  if (matches.length === 0) {
    try {
      console.log('About to check patterns...');
      // For patterns, we'll check if any keywords partially match
      const { data: patternMatches, error: patternError } = await supabase
        .from('category_keywords')
        .select('category, keywords')
        .filter('keywords', 'cs', `{"${normalizedInput}"}`);  // Case-sensitive array contains

      console.log('Pattern matches:', { patternMatches, patternError }); // Debug logging

      if (patternError) {
        console.error('Pattern query error:', patternError);
      }

      patternMatches?.forEach((match: any) => {
        matches.push({
          category: match.category,
          confidence: 'medium',
          source: 'pattern'
        });
      });
    } catch (e) {
      console.error('Pattern matching failed:', e);
    }
  }

  // 4. Check partial matches by searching in keywords arrays
  if (matches.length === 0) {
    try {
      console.log('About to check partial matches...');
      // Get all category keywords and check manually for partial matches
      const { data: allCategories, error: partialError } = await supabase
        .from('category_keywords')
        .select('category, keywords')
        .limit(100);

      console.log('Retrieved categories for partial matching:', { count: allCategories?.length, error: partialError });

      if (partialError) {
        console.error('Partial match query error:', partialError);
      }

      // Check each category's keywords for partial matches
      allCategories?.forEach((cat: any) => {
        if (cat.keywords && Array.isArray(cat.keywords)) {
          const hasPartialMatch = cat.keywords.some((keyword: string) => 
            keyword.toLowerCase().includes(normalizedInput) || 
            normalizedInput.includes(keyword.toLowerCase())
          );
          
          if (hasPartialMatch) {
            matches.push({
              category: cat.category,
              confidence: 'low',
              source: 'partial'
            });
          }
        }
      });
    } catch (e) {
      console.error('Partial matching failed:', e);
    }
  }

  // Remove duplicates and add display names
  const uniqueMatches = matches.filter((match, index, self) =>
    index === self.findIndex(m => m.category === match.category)
  );
  
  // Add display names
  const categoryDisplayNames: Record<string, string> = {
    'supplements_vitamins': 'Supplements & Vitamins',
    'financial_products': 'Financial Products',
    'crisis_resources': 'Crisis Resources',
    'professional_services': 'Professional Services',
    'medications': 'Medications',
    'apps_software': 'Apps & Software',
    'therapists_counselors': 'Therapists & Counselors',
    'doctors_specialists': 'Doctors & Specialists',
    // Add more as needed
  };
  
  const matchesWithDisplayNames = uniqueMatches.map(match => ({
    ...match,
    displayName: categoryDisplayNames[match.category] || match.category
  }));

  console.log('Final matches:', matchesWithDisplayNames); // Debug logging

  return matchesWithDisplayNames;
}

// Helper function to get human-friendly category names
export function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    'supplements_vitamins': 'Supplements & Vitamins',
    'medications': 'Medications',
    'natural_remedies': 'Natural Remedies',
    'beauty_skincare': 'Beauty & Skincare',
    'therapists_counselors': 'Therapists & Counselors',
    'doctors_specialists': 'Doctors & Specialists',
    'coaches_mentors': 'Coaches & Mentors',
    'alternative_practitioners': 'Alternative Practitioners',
    'professional_services': 'Professional Services',
    'medical_procedures': 'Medical Procedures',
    'crisis_resources': 'Crisis Resources',
    'exercise_movement': 'Exercise & Movement',
    'meditation_mindfulness': 'Meditation & Mindfulness',
    'habits_routines': 'Habits & Routines',
    'hobbies_activities': 'Hobbies & Activities',
    'groups_communities': 'Groups & Communities',
    'support_groups': 'Support Groups',
    'apps_software': 'Apps & Software',
    'products_devices': 'Products & Devices',
    'books_courses': 'Books & Courses',
    'diet_nutrition': 'Diet & Nutrition',
    'sleep': 'Sleep Solutions',
    'financial_products': 'Financial Products'
  };

  return displayNames[category] || category;
}
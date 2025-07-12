// lib/solutions/categorization.ts
import { supabase } from '@/lib/database/client';

export interface CategoryMatch {
  category: string;
  confidence: 'high' | 'medium' | 'low';
  displayName: string;
  description?: string;
}

export interface SolutionMatch {
  id: string;
  title: string;
  category: string;
  categoryDisplayName: string;
  matchType: 'exact' | 'partial';
  matchScore?: number; // Added for fuzzy search
}

export interface KeywordMatch {
  keyword: string;
  category: string;
  categoryDisplayName: string;
  matchScore: number;
}

export interface DetectionResult {
  solutions: SolutionMatch[];
  categories: CategoryMatch[];
  searchTerm: string;
  keywordMatches: KeywordMatch[]; // Added for fuzzy search
}

// Category display names and descriptions mapping
const categoryInfo: Record<string, { displayName: string; description: string }> = {
  supplements_vitamins: {
    displayName: 'Supplements & Vitamins',
    description: 'Nutritional supplements, vitamins, and minerals'
  },
  medications: {
    displayName: 'Medications',
    description: 'Prescription and over-the-counter medications'
  },
  natural_remedies: {
    displayName: 'Natural Remedies',
    description: 'Herbal supplements, traditional remedies, and natural treatments'
  },
  beauty_skincare: {
    displayName: 'Beauty & Skincare',
    description: 'Skincare products, cosmetics, and beauty treatments'
  },
  therapists_counselors: {
    displayName: 'Therapists & Counselors',
    description: 'Mental health professionals, therapists, and counseling services'
  },
  doctors_specialists: {
    displayName: 'Doctors & Specialists',
    description: 'Medical doctors, specialists, and healthcare providers'
  },
  coaches_mentors: {
    displayName: 'Coaches & Mentors',
    description: 'Life coaches, career mentors, and personal development guides'
  },
  alternative_practitioners: {
    displayName: 'Alternative Practitioners',
    description: 'Acupuncturists, chiropractors, and holistic practitioners'
  },
  professional_services: {
    displayName: 'Professional Services',
    description: 'Personal trainers, nutritionists, and other professional services'
  },
  medical_procedures: {
    displayName: 'Medical Procedures',
    description: 'Medical treatments, surgeries, and therapeutic procedures'
  },
  crisis_resources: {
    displayName: 'Crisis Resources',
    description: 'Crisis hotlines, emergency support, and immediate help resources'
  },
  exercise_movement: {
    displayName: 'Exercise & Movement',
    description: 'Physical activities, sports, and fitness routines'
  },
  meditation_mindfulness: {
    displayName: 'Meditation & Mindfulness',
    description: 'Meditation practices, mindfulness techniques, and relaxation methods'
  },
  habits_routines: {
    displayName: 'Habits & Routines',
    description: 'Daily habits, productivity routines, and lifestyle practices'
  },
  hobbies_activities: {
    displayName: 'Hobbies & Activities',
    description: 'Creative pursuits, recreational activities, and personal interests'
  },
  groups_communities: {
    displayName: 'Groups & Communities',
    description: 'Social groups, clubs, and community organizations'
  },
  support_groups: {
    displayName: 'Support Groups',
    description: 'Peer support groups, recovery groups, and mutual aid communities'
  },
  apps_software: {
    displayName: 'Apps & Software',
    description: 'Mobile apps, software tools, and digital solutions'
  },
  products_devices: {
    displayName: 'Products & Devices',
    description: 'Physical products, devices, and equipment'
  },
  books_courses: {
    displayName: 'Books & Courses',
    description: 'Educational materials, online courses, and self-help resources'
  },
  diet_nutrition: {
    displayName: 'Diet & Nutrition',
    description: 'Dietary approaches, meal plans, and nutritional strategies'
  },
  sleep: {
    displayName: 'Sleep',
    description: 'Sleep improvement techniques, routines, and solutions'
  },
  financial_products: {
    displayName: 'Financial Products',
    description: 'Financial tools, accounts, and money management solutions'
  }
};

/**
 * Search for existing solutions in the database with fuzzy matching
 */
async function searchExistingSolutions(searchTerm: string): Promise<SolutionMatch[]> {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Use fuzzy search function instead of regular search
  const { data: solutions, error } = await supabase
    .rpc('search_solutions_fuzzy', {
      search_term: normalizedSearch
    });

  if (error) {
    console.error('Error searching solutions:', error);
    return [];
  }

  // Same generic terms filter as in searchKeywordsAsSolutions
  const genericTerms = new Set([
    // Generic therapy terms
    'therapy', 'therapist', 'counseling', 'counselor', 'treatment', 
    'psychotherapy', 'therapies', 'therapeutic',
    
    // Specific therapy types that are categories, not solutions
    'cbt', 'dbt', 'emdr', 'art therapy', 'music therapy', 'play therapy',
    'cbt therapy', 'dbt therapy', 'emdr therapy', 'cognitive behavioral therapy',
    'dialectical behavior therapy', 'eye movement desensitization and reprocessing',
    'family therapy', 'group therapy', 'individual therapy', 'couples therapy',
    'marriage counseling', 'grief counseling', 'trauma therapy', 'talk therapy',
    'dance therapy', 'drama therapy', 'nature therapy', 'friendship therapy',
    'pet therapy', 'equine therapy', 'animal assisted therapy', 'expressive therapy',
    'somatic therapy', 'gestalt therapy', 'psychodynamic therapy', 'humanistic therapy',
    'integrative therapy', 'solution focused therapy', 'narrative therapy',
    'acceptance and commitment therapy', 'act', 'interpersonal therapy',
    'psychoanalytic therapy', 'behavioral therapy', 'cognitive therapy',
    
    // Other generic terms
    'medication', 'medicine', 'drug', 'prescription',
    'supplement', 'vitamin', 'mineral', 'herb', 'herbal',
    'exercise', 'workout', 'fitness', 'training', 'activity',
    'program', 'method', 'technique', 'practice', 'approach'
  ]);

  return (solutions || [])
    .filter(solution => {
      const lowerTitle = solution.title.toLowerCase().trim();
      
      // Filter out generic terms
      if (genericTerms.has(lowerTitle)) {
        console.log('Filtered out generic solution:', solution.title);
        return false;
      }
      
      // SPECIAL CASE: If user searches for just "vitamin", don't show any vitamin solutions
      if ((normalizedSearch === 'vitamin' || normalizedSearch === 'vitamins') && 
          (lowerTitle.includes('vitamin') || lowerTitle === 'multivitamins')) {
        console.log('Filtered out vitamin solution for generic search:', solution.title);
        return false;
      }
      
      // Special cases that should be allowed
      const allowedExceptions = [
        /^vitamin\s+[a-z0-9]+$/i,  // Vitamin D, Vitamin B12, etc.
        /^b[0-9]+$/i,              // B12, B6, etc.
        /^omega[-\s]?[0-9]+$/i,    // Omega-3, Omega 3, etc.
      ];
      
      if (allowedExceptions.some(pattern => pattern.test(solution.title))) {
        return true; // Allow these specific solutions
      }
      
      // Filter out category-like names (e.g., "Diabetes Medications")
      const categoryPatterns = [
        /\b(medications?|medicines?|drugs?)$/i,
        /\b(medications?|medicines?|drugs?)\s*\(/i,
        /\bmedicines?\b.*\(/i,  // Any medicine/medicines with parentheses later
        /\bmedications?\b.*\(/i,  // Any medication/medications with parentheses later
        /^\w+\s+medications?\b/i,  // Starts with descriptor + medications (e.g., "Pain Medications")
        /\b(supplements?|vitamins?)$/i,
        /\b(supplementation)$/i,
        /\b(therap(y|ies)|treatments?)$/i,
        /\b(counseling)$/i,
        /^\w+\s+counseling\b/i,  // Starts with descriptor + counseling (e.g., "Career Counseling")
        /\b(exercises?|workouts?|programs?)$/i,
        /\b(remedies|solutions?)$/i,
        /^(general|generic|common|typical|standard)\b/i,
        /\b(strategy|strategies|approach|approaches|method|methods)$/i,
        /\b(protocol|protocols)$/i,
        /\b(serum|serums)$/i,
        /^(anti-|non-)/i,
        /\((non-|anti-)[^)]+\)/i
      ];
      
      if (categoryPatterns.some(pattern => pattern.test(solution.title))) {
        console.log('Filtered out category-like solution:', solution.title);
        return false;
      }
      
      // Additional filtering for therapy-containing terms
      if (lowerTitle.includes('therapy') || lowerTitle.includes('therapist')) {
        // Only allow specific providers/brands (with hyphens, numbers, or brand indicators)
        const hasSpecificIndicators = /[-0-9]/.test(solution.title) || 
                                     /^[A-Z][a-z]+[A-Z]/.test(solution.title) || // CamelCase like BetterHelp
                                     solution.title.includes('®') ||
                                     solution.title.includes('™');
        
        if (!hasSpecificIndicators) {
          console.log('Filtered out generic therapy solution:', solution.title);
          return false;
        }
      }
      
      // Filter out single-word generic terms
      if (!solution.title.includes(' ') && !solution.title.includes('-')) {
        const singleWordGenerics = ['therapy', 'therapist', 'counseling', 'medication', 
                                    'supplement', 'vitamin', 'exercise', 'meditation',
                                    'yoga', 'pilates', 'mindfulness', 'diet'];
        if (singleWordGenerics.includes(lowerTitle)) {
          console.log('Filtered out single-word generic:', solution.title);
          return false;
        }
      }
      
      return true;
    })
    .map(solution => {
      const matchType: 'exact' | 'partial' = solution.match_score >= 1.0 ? 'exact' : 'partial';
      const categoryInfo = getCategoryInfo(solution.solution_category);
      
      return {
        id: solution.id,
        title: solution.title,
        category: solution.solution_category,
        categoryDisplayName: categoryInfo.displayName,
        matchType,
        matchScore: solution.match_score // Include fuzzy match score
      };
    })
    .sort((a, b) => {
      // Sort by match score first (highest first)
      if (a.matchScore && b.matchScore && a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Then exact matches first
      if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
      if (a.matchType !== 'exact' && b.matchType === 'exact') return 1;
      // Then by title length (shorter = more relevant)
      return a.title.length - b.title.length;
    });
}

/**
 * Detect categories from user input using keywords with fuzzy matching
 */
async function detectCategoriesFromKeywords(userInput: string): Promise<CategoryMatch[]> {
  const normalizedInput = userInput.toLowerCase().trim();
  const matches: Map<string, 'high' | 'medium' | 'low'> = new Map();

  // Use fuzzy category detection
  const { data: categoryMatch } = await supabase
    .rpc('check_keyword_match_fuzzy', { search_term: normalizedInput });

  if (categoryMatch && categoryMatch.length > 0) {
    const confidence = categoryMatch[0].match_type === 'exact' ? 'high' : 'medium';
    matches.set(categoryMatch[0].category, confidence);
  }

  // If no fuzzy matches, fall back to exact keyword match
  if (matches.size === 0) {
    const { data: exactMatches } = await supabase
      .rpc('check_keyword_match', { search_term: normalizedInput });

    if (exactMatches && exactMatches.length > 0) {
      exactMatches.forEach((match: { category: string }) => {
        matches.set(match.category, 'high');
      });
    }
  }

  // If still no matches, check pattern matching
  if (matches.size === 0) {
    const { data: patternMatches } = await supabase
      .rpc('match_category_patterns', { input_text: normalizedInput });

    if (patternMatches && patternMatches.length > 0) {
      patternMatches.forEach((match: { category: string }) => {
        if (!matches.has(match.category)) {
          matches.set(match.category, 'medium');
        }
      });
    }
  }

  // Check partial matches if still no matches
  if (matches.size === 0 && normalizedInput.length >= 3) {
    const { data: partialMatches } = await supabase
      .rpc('match_category_partial', { input_text: normalizedInput });

    if (partialMatches && partialMatches.length > 0) {
      partialMatches.forEach((match: { category: string }) => {
        if (!matches.has(match.category)) {
          matches.set(match.category, 'low');
        }
      });
    }
  }

  // Convert matches to CategoryMatch array
  return Array.from(matches.entries()).map(([category, confidence]) => ({
    category,
    confidence,
    ...getCategoryInfo(category)
  }));
}

/**
 * Search for keywords that are likely solution names
 */
async function searchKeywordsAsSolutions(searchTerm: string): Promise<Array<{
  name: string;
  category: string;
  categoryDisplayName: string;
  isLikelySolution: boolean;
}>> {
  const { data, error } = await supabase
    .rpc('search_keywords_as_solutions', { search_term: searchTerm });

  if (error) {
    console.error('Error searching keywords as solutions:', error);
    return [];
  }
  
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Generic terms that should NEVER be shown as solutions
  const genericPatterns = [
    /^therapy$/i,
    /\stherapy$/i,
    /^counseling$/i,
    /\scounseling$/i,
    /^treatment$/i,
    /\streatment$/i,
    /^medication$/i,
    /\smedication$/i,
    /\smedications$/i,
    /^medicine$/i,
    /\smedicine$/i,
    /\smedicines$/i,
    /^supplement$/i,
    /\ssupplement$/i,
    /\ssupplements$/i,
    /^vitamin$/i,
    /\svitamin$/i,
    /\svitamins$/i,
    /^exercise$/i,
    /\sexercise$/i,
    /\sexercises$/i,
    /^workout$/i,
    /\sworkout$/i,
    /\sworkouts$/i,
    /\straining$/i,
    /\sprogram$/i,
    /\sprograms$/i,
    /\smethod$/i,
    /\smethods$/i,
    /\stechnique$/i,
    /\stechniques$/i,
    /\spractice$/i,
    /\spractices$/i,
    /\sapproach$/i,
    /\sapproaches$/i,
    /^therapist$/i,
    /\stherapist$/i,
    /\stherapists$/i,
    /^drug$/i,
    /\sdrug$/i,
    /\sdrugs$/i,
    /^remedy$/i,
    /\sremedy$/i,
    /\sremedies$/i
  ];

  // Expanded list of generic terms that should never appear as solutions
  const genericTerms = new Set([
    // Generic therapy terms
    'therapy', 'therapist', 'counseling', 'counselor', 'treatment', 
    'psychotherapy', 'therapies', 'therapeutic',
    
    // Specific therapy types that are categories, not solutions
    'cbt', 'dbt', 'emdr', 'art therapy', 'music therapy', 'play therapy',
    'cbt therapy', 'dbt therapy', 'emdr therapy', 'cognitive behavioral therapy',
    'dialectical behavior therapy', 'eye movement desensitization and reprocessing',
    'family therapy', 'group therapy', 'individual therapy', 'couples therapy',
    'marriage counseling', 'grief counseling', 'trauma therapy', 'talk therapy',
    'dance therapy', 'drama therapy', 'nature therapy', 'friendship therapy',
    'pet therapy', 'equine therapy', 'animal assisted therapy', 'expressive therapy',
    'somatic therapy', 'gestalt therapy', 'psychodynamic therapy', 'humanistic therapy',
    'integrative therapy', 'solution focused therapy', 'narrative therapy',
    'acceptance and commitment therapy', 'act', 'interpersonal therapy',
    'psychoanalytic therapy', 'behavioral therapy', 'cognitive therapy',
    
    // Other generic terms
    'medication', 'medicine', 'drug', 'prescription',
    'supplement', 'vitamin', 'mineral', 'herb', 'herbal',
    'exercise', 'workout', 'fitness', 'training', 'activity',
    'program', 'method', 'technique', 'practice', 'approach',
    'session', 'appointment', 'consultation', 'meeting'
  ]);

  // Debug logging
  console.log('Keywords found:', data?.map((d: any) => d.solution_name));

  // Filter out generic terms and patterns
  const filtered = (data || []).filter((item: any) => {
    const lowerName = item.solution_name.toLowerCase().trim();
    
    // Check if it's a generic term (exact match)
    if (genericTerms.has(lowerName)) {
      console.log('Filtered out generic term:', item.solution_name);
      return false;
    }
    
    // Check if it matches any generic pattern
    if (genericPatterns.some(pattern => pattern.test(item.solution_name))) {
      console.log('Filtered out by pattern:', item.solution_name);
      return false;
    }
    
    // Special cases that should be allowed as specific solutions
    const allowedExceptions = [
      /^vitamin\s+[a-z0-9]+$/i,  // Vitamin D, Vitamin B12, etc.
      /^b[0-9]+$/i,              // B12, B6, etc.
      /^omega[-\s]?[0-9]+$/i,    // Omega-3, Omega 3, etc.
    ];
    
    // BUT if the search term is just "vitamin", don't show these
    if (normalizedSearch === 'vitamin' || normalizedSearch === 'vitamins') {
      return false;
    }
    
    if (allowedExceptions.some(pattern => pattern.test(item.solution_name))) {
      return true; // Allow these specific solutions
    }
    
    // CRITICAL: Filter out category-like names (e.g., "Diabetes Medications", "Sleep Medications")
    // These patterns indicate category names, not specific solutions
    const categoryPatterns = [
      /\b(medications?|medicines?|drugs?)$/i,  // Ends with medications/medicine/drugs
      /\b(medications?|medicines?|drugs?)\s*\(/i,  // Medications followed by parentheses
      /\bmedicines?\b.*\(/i,    // Any medicine/medicines with parentheses later
      /\bmedications?\b.*\(/i,  // Any medication/medications with parentheses later
      /^\w+\s+medications?\b/i,  // Starts with descriptor + medications (e.g., "Pain Medications")
      /\b(supplements?|vitamins?)$/i,          // Ends with supplements/vitamins
      /\b(supplementation)$/i,                 // Ends with supplementation
      /\b(therap(y|ies)|treatments?)$/i,       // Ends with therapy/therapies/treatments
      /\b(counseling)$/i,                      // Ends with counseling
      /^\w+\s+counseling\b/i,                  // Starts with descriptor + counseling (e.g., "Career Counseling")
      /\b(exercises?|workouts?|programs?)$/i,  // Ends with exercises/workouts/programs
      /\b(remedies|solutions?)$/i,             // Ends with remedies/solutions
      /^(general|generic|common|typical|standard)\b/i,  // Starts with generic descriptors
      /\b(strategy|strategies|approach|approaches|method|methods)$/i,  // Ends with strategy terms
      /\b(protocol|protocols)$/i,              // Ends with protocol
      /\b(serum|serums)$/i,                    // Ends with serum (for Vitamin C Serum)
      /^(anti-|non-)/i,                        // Starts with anti- or non- (category prefixes)
      /\((non-|anti-)[^)]+\)/i                 // Contains (Non-X) or (Anti-X) in parentheses
    ];
    
    if (categoryPatterns.some(pattern => pattern.test(item.solution_name))) {
      console.log('Filtered out category-like name:', item.solution_name);
      return false;
    }
    
    // Additional strict filtering for therapy-related terms
    const therapyKeywords = ['therapy', 'therapist', 'counseling', 'counselor', 'therapeutic'];
    if (therapyKeywords.some(keyword => lowerName.includes(keyword))) {
      // Only allow if it's a specific provider/brand name (contains hyphen, numbers, or proper noun indicators)
      const hasSpecificIndicators = /[-0-9]/.test(item.solution_name) || 
                                   /^[A-Z][a-z]+[A-Z]/.test(item.solution_name) || // CamelCase
                                   item.solution_name.includes('®') ||
                                   item.solution_name.includes('™');
      
      if (!hasSpecificIndicators) {
        console.log('Filtered out generic therapy term:', item.solution_name);
        return false;
      }
    }
    
    // Filter out single-word generic terms
    if (!item.solution_name.includes(' ') && !item.solution_name.includes('-')) {
      const singleWordGenerics = ['therapy', 'therapist', 'counseling', 'medication', 
                                  'supplement', 'vitamin', 'exercise', 'meditation',
                                  'yoga', 'pilates', 'mindfulness', 'diet'];
      if (singleWordGenerics.includes(lowerName)) {
        console.log('Filtered out single-word generic:', item.solution_name);
        return false;
      }
    }
    
    return true;
  });

  console.log('After filtering:', filtered.map((f: any) => f.solution_name));

  // Only return filtered results that are also marked as likely solutions
  return filtered
    .filter((item: any) => item.is_likely_solution)
    .map((item: any) => ({
      name: item.solution_name,
      category: item.category,
      categoryDisplayName: getCategoryInfo(item.category).displayName,
      isLikelySolution: item.is_likely_solution
    }));
}

/**
 * Search for keyword autocomplete suggestions with fuzzy matching
 */
async function searchKeywordSuggestions(searchTerm: string): Promise<KeywordMatch[]> {
  const { data, error } = await supabase
    .rpc('search_keywords_for_autocomplete', {
      search_term: searchTerm
    });

  if (error) {
    console.error('Error searching keyword suggestions:', error);
    return [];
  }

  return (data || [])
    .filter(match => match.match_score > 0.5) // Only show decent matches
    .map((match: any) => ({
      keyword: match.keyword,
      category: match.category,
      categoryDisplayName: getCategoryInfo(match.category).displayName,
      matchScore: match.match_score
    }));
}

/**
 * Main detection function - searches solutions first, then categories
 */
export async function detectFromInput(userInput: string): Promise<DetectionResult> {
  if (!userInput || userInput.trim().length === 0) {
    return { solutions: [], categories: [], searchTerm: userInput, keywordMatches: [] };
  }

  try {
    // Step 1: Search for existing solutions in database with fuzzy matching
    const existingSolutions = await searchExistingSolutions(userInput);
    
    // Step 2: Search keywords that look like solution names
    const keywordSolutions = await searchKeywordsAsSolutions(userInput);
    
    // Step 3: Detect categories from keywords with fuzzy matching
    const categories = await detectCategoriesFromKeywords(userInput);
    
    // Step 4: Search for keyword autocomplete suggestions
    const keywordMatches = await searchKeywordSuggestions(userInput);
    
    // Combine existing solutions with keyword-based solutions (avoiding duplicates)
    const allSolutions = [...existingSolutions];
    
    // Add keyword solutions that aren't already in the database
    keywordSolutions.forEach(kwSolution => {
      const exists = existingSolutions.some(
        existing => existing.title.toLowerCase() === kwSolution.name.toLowerCase()
      );
      
      if (!exists) {
        allSolutions.push({
          id: `keyword-${kwSolution.name}`,
          title: kwSolution.name,
          category: kwSolution.category,
          categoryDisplayName: kwSolution.categoryDisplayName,
          matchType: 'suggested' as 'exact' | 'partial'
        });
      }
    });
    
    return {
      solutions: allSolutions,
      categories,
      searchTerm: userInput,
      keywordMatches // Include keyword suggestions for autocomplete
    };
  } catch (error) {
    console.error('Error in detectFromInput:', error);
    return { solutions: [], categories: [], searchTerm: userInput, keywordMatches: [] };
  }
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: string): { displayName: string; description: string } {
  return categoryInfo[category] || {
    displayName: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: ''
  };
}

/**
 * Get category display name (convenience function)
 */
export function getCategoryDisplayName(category: string): string {
  return getCategoryInfo(category).displayName;
}

/**
 * Get all categories grouped by type
 */
export function getCategoriesByGroup() {
  return {
    'Things you take': [
      { value: 'supplements_vitamins', ...categoryInfo.supplements_vitamins },
      { value: 'medications', ...categoryInfo.medications },
      { value: 'natural_remedies', ...categoryInfo.natural_remedies },
      { value: 'beauty_skincare', ...categoryInfo.beauty_skincare },
    ],
    'People you see': [
      { value: 'therapists_counselors', ...categoryInfo.therapists_counselors },
      { value: 'doctors_specialists', ...categoryInfo.doctors_specialists },
      { value: 'coaches_mentors', ...categoryInfo.coaches_mentors },
      { value: 'alternative_practitioners', ...categoryInfo.alternative_practitioners },
      { value: 'professional_services', ...categoryInfo.professional_services },
      { value: 'medical_procedures', ...categoryInfo.medical_procedures },
      { value: 'crisis_resources', ...categoryInfo.crisis_resources },
    ],
    'Things you do': [
      { value: 'exercise_movement', ...categoryInfo.exercise_movement },
      { value: 'meditation_mindfulness', ...categoryInfo.meditation_mindfulness },
      { value: 'habits_routines', ...categoryInfo.habits_routines },
      { value: 'hobbies_activities', ...categoryInfo.hobbies_activities },
      { value: 'groups_communities', ...categoryInfo.groups_communities },
      { value: 'support_groups', ...categoryInfo.support_groups },
    ],
    'Things you use': [
      { value: 'apps_software', ...categoryInfo.apps_software },
      { value: 'products_devices', ...categoryInfo.products_devices },
      { value: 'books_courses', ...categoryInfo.books_courses },
    ],
    'Changes you make': [
      { value: 'diet_nutrition', ...categoryInfo.diet_nutrition },
      { value: 'sleep', ...categoryInfo.sleep },
    ],
    'Financial solutions': [
      { value: 'financial_products', ...categoryInfo.financial_products },
    ],
  };
}
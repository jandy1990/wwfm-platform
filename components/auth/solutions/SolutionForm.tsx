'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
// import { FormField } from '@/components/auth/FormField'  // Currently unused
// import { Button } from '@/components/auth/Button'  // Currently unused
// import RatingDisplay from '@/components/ui/RatingDisplay'  // Currently unused

interface SolutionFormProps {
  goalId: string
  goalTitle: string
  userId: string
  goalSlug?: string // Add this to determine goal type
}

// Pre-populated solutions by goal type (sample data - expand this)
// const COMMON_SOLUTIONS: Record<string, string[]> = {
//   'acne': [
//     'Salicylic acid wash',
//     'Benzoyl peroxide cream',
//     'Retinol/Tretinoin',
//     'Accutane (isotretinoin)',
//     'Birth control pills',
//     'Zinc supplements',
//     'Dairy-free diet',
//     'Chemical peels',
//     'Niacinamide serum',
//     'Antibiotics (doxycycline)',
//     'Clay masks',
//     'Oil cleansing',
//     'Spironolactone',
//     'LED light therapy',
//     'Hydrocolloid patches'
//   ],
//   'anxiety': [
//     'Meditation (app)',
//     'CBT therapy',
//     'SSRIs (medication)',
//     'Exercise routine',
//     'Breathing exercises',
//     'Journaling',
//     'Yoga practice',
//     'Limiting caffeine',
//     'Sleep hygiene',
//     'Mindfulness practice',
//     'Support groups',
//     'Beta blockers',
//     'Magnesium supplements',
//     'Cold exposure',
//     'Nature walks'
//   ],
//   'weight-loss': [
//     'Calorie counting app',
//     'Keto diet',
//     'Intermittent fasting',
//     'Weight training',
//     'Running program',
//     'Meal prep',
//     'Water tracking',
//     'Sleep optimization',
//     'Protein increase',
//     'Sugar elimination',
//     'Walking 10k steps',
//     'CrossFit',
//     'Nutritionist',
//     'Ozempic/Wegovy',
//     'Portion control'
//   ],
  // Add more mappings based on your goals
// }

// Map goal titles/slugs to solution categories
// const GOAL_TO_CATEGORY: Record<string, string> = {
//   'overcome-anxiety': 'anxiety',
//   'clear-acne': 'acne',
//   'lose-weight': 'weight-loss',
  // Add more mappings
// }

// Benefit categories
const BENEFIT_CATEGORIES = [
  { id: 'energy', label: 'More energetic', icon: '⚡' },
  { id: 'calm', label: 'Calmer', icon: '🧘' },
  { id: 'connected', label: 'More connected', icon: '🤝' },
  { id: 'focused', label: 'More focused', icon: '🎯' },
  { id: 'healthy', label: 'Healthier', icon: '💪' },
  { id: 'confident', label: 'More confident', icon: '✨' },
  { id: 'organized', label: 'More organized', icon: '📋' },
  { id: 'creative', label: 'More creative', icon: '🎨' }
]

// Failure reasons
const FAILURE_REASONS = [
  'No effect at all',
  'Made it worse',
  'Too expensive',
  'Side effects',
  'Too difficult',
  'Took too long',
  'Temporary results only',
  'Other'
]

interface FailedSolution {
  id: string
  name: string
  rating: number
  reason: string
  details?: string
}

export default function SolutionForm({ goalId, goalTitle, userId }: SolutionFormProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSection2, setShowSection2] = useState(false)
  
  // Section 1: What worked
  const [title, setTitle] = useState('')
  const [effectivenessScore, setEffectivenessScore] = useState(0)
  const [description, setDescription] = useState('')
  const [timeToResults, setTimeToResults] = useState('')
  const [timeInvestment, setTimeInvestment] = useState('')
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])
  const [costEstimate, setCostEstimate] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(3)
  
  // Section 2: What didn't work
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  // const [customSolution, setCustomSolution] = useState('')  // Currently unused
  
  // Dynamic solutions from database
  const [suggestedSolutions] = useState<string[]>([  // Removed setSuggestedSolutions as unused
    'Test Solution 1',
    'Test Solution 2',
    'Test Solution 3',
    'Meditation',
    'Exercise',
    'Therapy',
    'Yoga Practice',
    'Better Sleep'
  ])
  const [isLoadingSolutions] = useState(false)  // Removed setIsLoadingSolutions as unused
  
  // Refs for click outside detection
  const mainDropdownRef = useRef<HTMLDivElement>(null)
  const section2DropdownRef = useRef<HTMLDivElement>(null)
  
  // State for main solution dropdown
  const [showMainDropdown, setShowMainDropdown] = useState(false)
  
  // Fetch solutions for this goal when component mounts
  // TEMPORARILY COMMENTED OUT FOR DEBUGGING
  /*useEffect(() => {
    async function fetchSolutionsForGoal() {
      console.log('🔍 Starting to fetch solutions for goal:', goalId)
      console.log('📌 Goal slug:', goalSlug)
      console.log('📌 Goal title:', goalTitle)
      
      // Hardcoded test data as fallback
      const testSolutions = [
        'Exercise regularly',
        'Meditation',
        'Better sleep schedule',
        'Healthy diet',
        'Therapy',
        'Yoga',
        'Walking daily',
        'Journaling',
        'Mindfulness practice',
        'Breathing exercises'
      ]
      
      try {
        // Fetch solutions linked to this goal through the new schema
        const { data, error } = await supabase
          .from('solutions')
          .select(`
            id,
            title,
            solution_implementations!inner (
              id,
              goal_implementation_links!inner (
                goal_id,
                effectiveness_rating
              )
            )
          `)
          .eq('solution_implementations.goal_implementation_links.goal_id', goalId)
          .eq('is_approved', true)

        console.log('📊 Solutions query result:', { data, error })

        if (error) {
          console.error('❌ Query error:', error)
          // Use hardcoded solutions combined with category-specific ones
          const goalType = goalSlug ? GOAL_TO_CATEGORY[goalSlug] : null
          const categorySolutions = (goalType && COMMON_SOLUTIONS[goalType]) || []
          setSuggestedSolutions([...new Set([...categorySolutions, ...testSolutions])])
        } else if (data && data.length > 0) {
          const solutionTitles = data.map(item => item.title).filter(Boolean)
          console.log('✅ Found solutions in database:', solutionTitles)
          console.log('🔢 Number of solutions found:', solutionTitles.length)
          setSuggestedSolutions(solutionTitles)
        } else {
          // No solutions found, combine category-specific and test data
          console.log('ℹ️ No solutions found for this goal, using fallback data')
          const goalType = goalSlug ? GOAL_TO_CATEGORY[goalSlug] : null
          console.log('🏷️ Goal type mapping:', { goalSlug, goalType })
          const categorySolutions = (goalType && COMMON_SOLUTIONS[goalType]) || []
          console.log('📦 Category solutions:', categorySolutions)
          const combinedSolutions = [...new Set([...categorySolutions, ...testSolutions])]
          console.log('🔄 Combined solutions:', combinedSolutions)
          setSuggestedSolutions(combinedSolutions)
        }
      } catch (error) {
        console.error('❌ Error fetching solutions:', error)
        // Fall back to hardcoded data
        const goalType = goalSlug ? GOAL_TO_CATEGORY[goalSlug] : null
        const categorySolutions = (goalType && COMMON_SOLUTIONS[goalType]) || []
        setSuggestedSolutions([...new Set([...categorySolutions, ...testSolutions])])
      } finally {
        setIsLoadingSolutions(false)
      }
    }

    fetchSolutionsForGoal()
  }, [goalId, goalSlug, supabase])*/

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target as Node)) {
        console.log('🔴 Closing main dropdown (click outside)')
        setShowMainDropdown(false)
      }
      if (section2DropdownRef.current && !section2DropdownRef.current.contains(event.target as Node)) {
        console.log('🔴 Closing section 2 dropdown (click outside)')
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Filter suggestions for Section 1 (main solution)
  const filteredMainSuggestions = title.length > 1
    ? suggestedSolutions.filter(s => 
        s.toLowerCase().includes(title.toLowerCase())
      )
    : []
  
  console.log('🔎 Section 1 filtering:', {
    title,
    titleLength: title.length,
    suggestedSolutions: suggestedSolutions.length,
    suggestedSolutionsArray: suggestedSolutions,
    filteredMainSuggestions,
    filteredCount: filteredMainSuggestions.length,
    showMainDropdown
  })
  
  // Log dropdown render conditions
  if (title.length > 1) {
    console.log('🎯 Dropdown render check:', { 
      showMainDropdown, 
      titleLength: title.length, 
      shouldShow: showMainDropdown && title.length > 1,
      filteredCount: filteredMainSuggestions.length
    })
  }
  
  // Filter suggestions for Section 2 (failed solutions)
  const filteredSuggestions = searchQuery.length > 1
    ? suggestedSolutions.filter(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !failedSolutions.some(f => f.name === s)
      )
    : []
  
  console.log('🔎 Section 2 filtering:', {
    searchQuery,
    searchQueryLength: searchQuery.length,
    suggestedSolutions: suggestedSolutions.length,
    suggestedSolutionsArray: suggestedSolutions,
    filteredSuggestions,
    filteredCount: filteredSuggestions.length,
    failedSolutions,
    showDropdown
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate failed solutions have reasons
    const invalidFailures = failedSolutions.filter(sol => !sol.reason)
    if (invalidFailures.length > 0) {
      alert('Please provide reasons for why solutions didn&apos;t work')
      return
    }
    
    setIsSubmitting(true)

    try {
      // Create the main solution (what worked) - without goal_id
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          created_by: userId,
          title,
          description,
          solution_type: 'user_submitted', // Default type for user submissions
          source_type: 'community_contributed', // Mark as human-contributed
          time_investment: timeInvestment,
          cost_estimate: costEstimate || null,
          is_approved: false
        })
        .select()
        .single()

      if (solutionError) throw solutionError

      // Create implementation variant
      const { data: implementation, error: implError } = await supabase
        .from('solution_implementations')
        .insert({
          solution_id: solution.id,
          variant_name: 'Standard',
          description: description,
          implementation_details: {
            time_to_results: timeToResults,
            difficulty_level: effectivenessScore >= 3 ? difficultyLevel : null,
            benefit_categories: effectivenessScore >= 3 ? selectedBenefits : []
          }
        })
        .select()
        .single()

      if (implError) throw implError

      // Link implementation to goal with effectiveness rating
      const { error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          implementation_id: implementation.id,
          goal_id: goalId,
          effectiveness_rating: effectivenessScore,
          context_notes: `Worked for: ${goalTitle}`
        })

      if (linkError) throw linkError

      // Create rating for the main solution
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          solution_id: solution.id,
          user_id: userId,
          effectiveness_score: effectivenessScore,
          time_to_see_results: timeToResults
        })

      if (ratingError) throw ratingError

      // Create failed solutions if any
      if (failedSolutions.length > 0) {
        for (const failed of failedSolutions) {
          // Create solution for failed attempt
          const { data: failedSolution, error: failedSolError } = await supabase
            .from('solutions')
            .insert({
              created_by: userId,
              title: failed.name,
              description: `Failed attempt`,
              solution_type: 'user_submitted',
              source_type: 'community_contributed', // Mark as human-contributed
              is_approved: false
            })
            .select()
            .single()

          if (failedSolError) continue // Skip on error

          // Create implementation
          const { data: failedImpl, error: failedImplError } = await supabase
            .from('solution_implementations')
            .insert({
              solution_id: failedSolution.id,
              variant_name: 'Standard',
              description: `Didn't work: ${failed.reason}${failed.details ? ` - ${failed.details}` : ''}`,
              implementation_details: {
                failure_reason: failed.reason,
                time_to_results: 'never'
              }
            })
            .select()
            .single()

          if (failedImplError) continue

          // Link to goal with low effectiveness
          await supabase
            .from('goal_implementation_links')
            .insert({
              implementation_id: failedImpl.id,
              goal_id: goalId,
              effectiveness_rating: failed.rating,
              context_notes: `Failed: ${failed.reason}`
            })

          // Create rating
          await supabase
            .from('ratings')
            .insert({
              solution_id: failedSolution.id,
              user_id: userId,
              effectiveness_score: failed.rating,
              review_text: failed.reason
            })
        }
      }

      // Create completion tracking
      await supabase
        .from('solution_completion_tracking')
        .insert({
          solution_id: solution.id,
          user_id: userId,
          completion_score: 20,
          next_prompt_type: 'add_details'
        })

      // Schedule enrichment notification (only for 4-5 star ratings)
      if (effectivenessScore >= 4) {
        const scheduledFor = new Date()
        scheduledFor.setDate(scheduledFor.getDate() + 3)
        
        await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            notification_type: 'enrichment_prompt',
            priority: 5,
            payload: {
              solution_id: solution.id,
              prompt_type: 'add_details',
              goal_title: goalTitle,
              solution_title: title
            },
            scheduled_for: scheduledFor.toISOString()
          })
      }

      // Success!
      router.push(`/goal/${goalId}?contribution=success`)
      
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFailedSolution = (solutionName: string) => {
    const newFailed: FailedSolution = {
      id: Date.now().toString(),
      name: solutionName,
      rating: 1, // Default to 1 star as discussed
      reason: 'No effect at all' // Default reason
    }
    setFailedSolutions([...failedSolutions, newFailed])
    setSearchQuery('')
    setShowDropdown(false)
    // setCustomSolution('')  // Function commented out as unused
  }

  const updateFailedSolution = (id: string, updates: Partial<FailedSolution>) => {
    setFailedSolutions(failedSolutions.map(sol => 
      sol.id === id ? { ...sol, ...updates } : sol
    ))
  }

  const removeFailedSolution = (id: string) => {
    setFailedSolutions(failedSolutions.filter(sol => sol.id !== id))
  }

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefitId)
        ? prev.filter(id => id !== benefitId)
        : [...prev, benefitId]
    )
  }

  // Conditional rendering helpers
  const showBenefitCategories = effectivenessScore >= 3
  const isFailure = effectivenessScore > 0 && effectivenessScore <= 2

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: What Worked */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Share Your Experience with: {goalTitle}</h2>
        
        <div className="space-y-6">
          {/* Solution Title with Autocomplete */}
          <div>
            <label htmlFor="solution-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What did you try?
            </label>
            <div className="relative" ref={mainDropdownRef}>
              <input
                id="solution-title"
                type="text"
                value={title}
                onChange={(e) => {
                  console.log('📈 Title input changed:', e.target.value)
                  setTitle(e.target.value)
                  setShowMainDropdown(true)
                  console.log('🔄 Main dropdown should show:', true)
                }}
                onFocus={() => {
                  console.log('🎯 Input focused, showing dropdown')
                  setShowMainDropdown(true)
                }}
                placeholder="Type to search solutions or add your own..."
                aria-describedby="solution-help"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
                maxLength={200}
              />
              <div id="solution-help" className="sr-only">
                Search for existing solutions or type your own. You can select from suggestions or add a custom solution.
              </div>
              
              {/* Dropdown for Section 1 */}
              {showMainDropdown && title.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {isLoadingSolutions ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading suggestions...</div>
                  ) : (
                    <>
                      {filteredMainSuggestions.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                            Common Solutions
                          </div>
                          {filteredMainSuggestions.map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                setTitle(suggestion)
                                setShowMainDropdown(false)
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </>
                      )}
                      
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setShowMainDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium text-blue-600 border-t"
                      >
                        + Use &quot;{title}&quot; as custom solution
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Effectiveness Score */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How well did it work for you?
            </legend>
            <div className="space-y-2" role="radiogroup" aria-required="true">
              {[
                { value: 5, label: 'Worked great', stars: '⭐⭐⭐⭐⭐' },
                { value: 4, label: 'Worked well', stars: '⭐⭐⭐⭐' },
                { value: 3, label: 'Worked okay', stars: '⭐⭐⭐' },
                { value: 2, label: 'Barely worked', stars: '⭐⭐' },
                { value: 1, label: "Didn't work", stars: '⭐' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 min-h-[44px] transition-all duration-200 hover:scale-105">
                  <input
                    type="radio"
                    name="effectiveness"
                    value={option.value}
                    checked={effectivenessScore === option.value}
                    onChange={(e) => setEffectivenessScore(Number(e.target.value))}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-lg sm:text-base">{option.stars}</span>
                  <span className="text-sm sm:text-base">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Description - Dynamic prompt based on effectiveness */}
          <div>
            <label htmlFor="experience-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tell us about your experience
            </label>
            <textarea
              id="experience-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isFailure 
                  ? "What went wrong? Why didn't it work for you?"
                  : "What made this work for you? Any tips for others?"
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>

          {/* Time to Results */}
          <div>
            <label htmlFor="time-to-results" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How long before you saw results?
            </label>
            <select
              id="time-to-results"
              value={timeToResults}
              onChange={(e) => setTimeToResults(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-base min-h-[44px]"
              required
            >
              <option value="">Select timeframe</option>
              <option value="immediately">Immediately</option>
              <option value="days">Within days</option>
              <option value="1week">1 week</option>
              <option value="2-3weeks">2-3 weeks</option>
              <option value="1month">1 month</option>
              <option value="2-3months">2-3 months</option>
              <option value="6months">6+ months</option>
              {isFailure && <option value="never">Never saw results</option>}
            </select>
          </div>

          {/* Time Investment */}
          <div>
            <label htmlFor="time-investment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time commitment
            </label>
            <select
              id="time-investment"
              value={timeInvestment}
              onChange={(e) => setTimeInvestment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-base min-h-[44px]"
              required
            >
              <option value="">Select time commitment</option>
              <option value="few-minutes">Few minutes daily</option>
              <option value="30min-daily">30 minutes daily</option>
              <option value="1hour-daily">1 hour daily</option>
              <option value="few-hours-weekly">Few hours weekly</option>
              <option value="one-time">One-time effort</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Benefit Categories - Only show for 3+ stars */}
          {showBenefitCategories && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How did this solution affect you? (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {BENEFIT_CATEGORIES.map(benefit => (
                  <button
                    key={benefit.id}
                    type="button"
                    onClick={() => toggleBenefit(benefit.id)}
                    aria-pressed={selectedBenefits.includes(benefit.id)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:outline-none
                      ${selectedBenefits.includes(benefit.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    <span className="text-lg" aria-hidden="true">{benefit.icon}</span>
                    <span className="text-sm font-medium">{benefit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Optional Details</h3>
            
            {/* Cost Estimate */}
            <div>
              <label htmlFor="cost-estimate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approximate cost
              </label>
              <select
                id="cost-estimate"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-base min-h-[44px]"
              >
                <option value="">Select cost range</option>
                <option value="free">Free</option>
                <option value="under20">Under $20/month</option>
                <option value="20-100">$20-100/month</option>
                <option value="over100">Over $100/month</option>
                <option value="one-time">One-time purchase</option>
              </select>
            </div>

            {/* Difficulty Level - Only for successes */}
            {!isFailure && (
              <div>
                <label htmlFor="difficulty-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty level
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Easy</span>
                  <input
                    id="difficulty-level"
                    type="range"
                    min="1"
                    max="5"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                    aria-label={`Difficulty level: ${difficultyLevel} out of 5`}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Hard</span>
                  <span className="ml-2 font-medium bg-gray-100 px-2 py-1 rounded">
                    {difficultyLevel}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: What Didn't Work */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">What else did you try that didn&apos;t work?</h3>
          <button
            type="button"
            onClick={() => setShowSection2(!showSection2)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showSection2 ? 'Hide' : 'Add'} ({failedSolutions.length})
          </button>
        </div>

        {showSection2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Help others avoid dead ends - what didn&apos;t work for {goalTitle}?
            </p>


            {/* Search/Add Interface */}
            <div className="relative" ref={section2DropdownRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  console.log('📈 Search query changed:', e.target.value)
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                  console.log('🔄 Section 2 dropdown should show:', true)
                }}
                onFocus={() => {
                  console.log('🎯 Search input focused, showing dropdown')
                  setShowDropdown(true)
                }}
                placeholder="Type to search or add solutions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Dropdown */}
              {showDropdown && searchQuery.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {isLoadingSolutions ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading suggestions...</div>
                  ) : (
                    <>
                      {filteredSuggestions.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                            Suggested Solutions
                          </div>
                          {filteredSuggestions.map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                addFailedSolution(suggestion)
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </>
                      )}
                      
                      {/* Add custom option */}
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          if (searchQuery.trim()) {
                            addFailedSolution(searchQuery.trim())
                          }
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium text-blue-600 border-t"
                      >
                        + Add &quot;{searchQuery}&quot; as new solution
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Failed Solutions List */}
            <div className="space-y-3">
              {failedSolutions.map(sol => (
                <div key={sol.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{sol.name}</h4>
                      
                      {/* Mini rating */}
                      <div className="mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Rating:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1" role="radiogroup" aria-label="Effectiveness rating for failed solution">
                            {[1, 2, 3].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateFailedSolution(sol.id, { rating: star })}
                                aria-label={`Rate ${star} out of 3 stars`}
                                aria-pressed={sol.rating === star}
                                className={`text-lg p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${sol.rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'}`}
                              >
                                <span aria-hidden="true">★</span>
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {sol.rating === 1 && "(didn't work)"}
                            {sol.rating === 2 && "(slight improvement)"}
                            {sol.rating === 3 && "(decent but not enough)"}
                          </span>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-2">
                        <select
                          value={sol.reason}
                          onChange={(e) => updateFailedSolution(sol.id, { reason: e.target.value })}
                          className="w-full text-sm px-3 py-1 border border-gray-200 rounded"
                          required
                        >
                          <option value="">Why didn&apos;t it work?</option>
                          {FAILURE_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFailedSolution(sol.id)}
                      aria-label={`Remove ${sol.name} from failed solutions`}
                      className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {failedSolutions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No failed solutions added yet. Search above to add what didn&apos;t work.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title || !effectivenessScore || !description || !timeToResults || !timeInvestment}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Share Experience'}
        </button>
      </div>
    </form>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SolutionFormProps {
  goalId: string
  goalTitle: string
  userId: string
}

// Pre-populated solutions by goal type (sample data - expand this)
const COMMON_SOLUTIONS: Record<string, string[]> = {
  'acne': [
    'Salicylic acid wash',
    'Benzoyl peroxide cream',
    'Retinol/Tretinoin',
    'Accutane (isotretinoin)',
    'Birth control pills',
    'Zinc supplements',
    'Dairy-free diet',
    'Chemical peels',
    'Niacinamide serum',
    'Antibiotics (doxycycline)',
    'Clay masks',
    'Oil cleansing',
    'Spironolactone',
    'LED light therapy',
    'Hydrocolloid patches'
  ],
  'anxiety': [
    'Meditation (app)',
    'CBT therapy',
    'SSRIs (medication)',
    'Exercise routine',
    'Breathing exercises',
    'Journaling',
    'Yoga practice',
    'Limiting caffeine',
    'Sleep hygiene',
    'Mindfulness practice',
    'Support groups',
    'Beta blockers',
    'Magnesium supplements',
    'Cold exposure',
    'Nature walks'
  ],
  // Add more mappings based on your goals
}

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
  const supabase = createClientComponentClient()
  
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
  const [customSolution, setCustomSolution] = useState('')
  
  // Get relevant solutions for this goal (mock - replace with actual goal mapping)
  const goalType = 'anxiety' // This should come from goal data
  const suggestedSolutions = COMMON_SOLUTIONS[goalType] || []
  
  // Filter suggestions based on search
  const filteredSuggestions = searchQuery.length > 1
    ? suggestedSolutions.filter(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !failedSolutions.some(f => f.name === s)
      )
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create the main solution (what worked)
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          goal_id: goalId,
          created_by: userId,
          title,
          description,
          time_to_results: timeToResults,
          time_investment: timeInvestment,
          cost_estimate: costEstimate || null,
          difficulty_level: effectivenessScore >= 3 ? difficultyLevel : null,
          benefit_categories: effectivenessScore >= 3 ? selectedBenefits : [],
          is_approved: false,
          avg_rating: effectivenessScore,
          rating_count: 1
        })
        .select()
        .single()

      if (solutionError) throw solutionError

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
          // Create solution
          const { data: failedSolution, error: failedSolError } = await supabase
            .from('solutions')
            .insert({
              goal_id: goalId,
              created_by: userId,
              title: failed.name,
              description: `Didn't work: ${failed.reason}`,
              is_approved: false,
              avg_rating: failed.rating,
              rating_count: 1
            })
            .select()
            .single()

          if (failedSolError) continue // Skip on error

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

      // Schedule enrichment notification
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
            goal_title: goalTitle
          },
          scheduled_for: scheduledFor.toISOString()
        })

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
      rating: 1,
      reason: ''
    }
    setFailedSolutions([...failedSolutions, newFailed])
    setSearchQuery('')
    setShowDropdown(false)
    setCustomSolution('')
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">Share Your Experience with: {goalTitle}</h2>
        
        <div className="space-y-6">
          {/* Solution Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you try?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Daily meditation, Therapy, Specific medication"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={200}
            />
          </div>

          {/* Effectiveness Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How well did it work for you?
            </label>
            <div className="space-y-2">
              {[
                { value: 5, label: 'Worked great', stars: '⭐⭐⭐⭐⭐' },
                { value: 4, label: 'Worked well', stars: '⭐⭐⭐⭐' },
                { value: 3, label: 'Worked okay', stars: '⭐⭐⭐' },
                { value: 2, label: 'Barely worked', stars: '⭐⭐' },
                { value: 1, label: "Didn't work", stars: '⭐' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="effectiveness"
                    value={option.value}
                    checked={effectivenessScore === option.value}
                    onChange={(e) => setEffectivenessScore(Number(e.target.value))}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-lg">{option.stars}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description - Dynamic prompt based on effectiveness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your experience
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isFailure 
                  ? "What went wrong? Why didn't it work for you?"
                  : "What made this work for you? Any tips for others?"
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time to Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How long before you saw results?
            </label>
            <select
              value={timeToResults}
              onChange={(e) => setTimeToResults(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time commitment
            </label>
            <select
              value={timeInvestment}
              onChange={(e) => setTimeInvestment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${selectedBenefits.includes(benefit.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-lg">{benefit.icon}</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approximate cost
              </label>
              <select
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty level
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Easy</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">Hard</span>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">What else did you try that didn't work?</h3>
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
              Help others avoid dead ends - what didn't work for {goalTitle}?
            </p>

            {/* Search/Add Interface */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type to search or add solutions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Dropdown */}
              {showDropdown && searchQuery.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addFailedSolution(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))
                  ) : null}
                  
                  {/* Add custom option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        addFailedSolution(searchQuery.trim())
                      }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium text-blue-600 border-t"
                  >
                    + Add "{searchQuery}" as new solution
                  </button>
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
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateFailedSolution(sol.id, { rating: star })}
                              className={`text-lg ${sol.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {sol.rating === 1 && "(didn't work)"}
                          {sol.rating === 2 && "(slight improvement)"}
                          {sol.rating === 3 && "(decent but not enough)"}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="mt-2">
                        <select
                          value={sol.reason}
                          onChange={(e) => updateFailedSolution(sol.id, { reason: e.target.value })}
                          className="w-full text-sm px-3 py-1 border border-gray-200 rounded"
                          required
                        >
                          <option value="">Why didn't it work?</option>
                          {FAILURE_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFailedSolution(sol.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {failedSolutions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No failed solutions added yet. Search above to add what didn't work.
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
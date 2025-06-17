'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import FormField from '../FormField'
import Button from '../Button'


// PRELIMINARY - These will likely change after AI content generation
const SOLUTION_CATEGORIES = {
  'dosage-based': 'Consumable (Supplement/Medication/Topical)',
  'time-based': 'Activity (Exercise/Meditation/Therapy)',
  'protocol-based': 'Technique (Method/Routine/Practice)',
  'resource-based': 'Resource (Product/Tool/Course)',
}

// Dynamic fields for each category
// PRELIMINARY - Expect these to evolve significantly
const CATEGORY_FIELDS: Record<string, any> = {
  'dosage-based': {
    what: { 
      label: 'What are you taking/applying?', 
      placeholder: 'e.g., Vitamin D3, Salicylic Acid', 
      required: true 
    },
    amount: { 
      label: 'Amount/Concentration', 
      placeholder: 'e.g., 2000 IU, 2%, 500mg', 
      required: true 
    },
    frequency: { 
      label: 'How often?', 
      type: 'select', 
      options: ['Once daily', 'Twice daily', 'Three times daily', 'Weekly', 'As needed'], 
      required: true 
    },
    timing: { 
      label: 'When?', 
      type: 'select', 
      options: ['Morning', 'Evening', 'With meals', 'Empty stomach', 'Before bed', 'Anytime'] 
    },
    form: {
      label: 'Form/Type',
      placeholder: 'e.g., Capsule, Liquid, Cream'
    }
  },
  
  'time-based': {
    activity: { 
      label: 'What activity?', 
      placeholder: 'e.g., Running, Yoga, CBT Session', 
      required: true 
    },
    duration: { 
      label: 'How long each time?', 
      placeholder: 'e.g., 30 minutes, 1 hour', 
      required: true 
    },
    frequency: { 
      label: 'How often?', 
      placeholder: 'e.g., 3x per week, Daily', 
      required: true 
    },
    intensity: { 
      label: 'Intensity/Difficulty', 
      type: 'select', 
      options: ['Low', 'Moderate', 'High', 'Variable'] 
    },
    setting: {
      label: 'Where/How?',
      placeholder: 'e.g., Gym, Home, Outside, App-guided'
    }
  },
  
  'protocol-based': {
    technique: { 
      label: 'What technique/method?', 
      placeholder: 'e.g., 4-7-8 Breathing, Pomodoro, SMART Goals', 
      required: true 
    },
    pattern: { 
      label: 'What\'s the pattern/protocol?', 
      placeholder: 'e.g., 4 seconds in, 7 hold, 8 out', 
      required: true 
    },
    frequency: { 
      label: 'When do you use it?', 
      placeholder: 'e.g., When anxious, Every morning, Before meetings', 
      required: true 
    },
    duration: { 
      label: 'How long does it take?', 
      placeholder: 'e.g., 5 minutes, 30 seconds per round' 
    }
  },
  
  'resource-based': {
    resource_name: { 
      label: 'Product/Tool/Resource name', 
      placeholder: 'e.g., Headspace App, "Atomic Habits" book', 
      required: true 
    },
    resource_type: { 
      label: 'Type of resource', 
      type: 'select', 
      options: ['App', 'Book', 'Course', 'Device/Gadget', 'Tool', 'Service', 'Other'], 
      required: true 
    },
    cost: { 
      label: 'Cost', 
      placeholder: 'e.g., $14.99/month, $200 one-time, Free' 
    },
    where_to_get: { 
      label: 'Where to get it', 
      placeholder: 'e.g., App Store, Amazon, therapist.com' 
    },
    usage: {
      label: 'How to use it',
      placeholder: 'e.g., 10 minutes before bed, Complete 1 module weekly'
    }
  }
}

interface SolutionFormProps {
  goalId: string
  goalTitle: string
}

interface FailedSolution {
  title: string
  effectiveness_score: number
}

export default function SolutionForm({ goalId, goalTitle }: SolutionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({})
  
  // Rating fields
  const [effectivenessScore, setEffectivenessScore] = useState<number>(0)
  const [timeInvestment, setTimeInvestment] = useState('')
  const [costEstimate, setCostEstimate] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3)
  const [timeToSeeResults, setTimeToSeeResults] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [reviewText, setReviewText] = useState('')

  // Failed solutions state
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([])
  const [currentFailedTitle, setCurrentFailedTitle] = useState('')
  const [currentFailedScore, setCurrentFailedScore] = useState<number>(0)

  // Pre-population state
  const [existingSolutions, setExistingSolutions] = useState<any[]>([])
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false)

  // Load existing solutions for autocomplete
  useEffect(() => {
    const loadExistingSolutions = async () => {
      setIsLoadingSolutions(true)
      try {
        const supabase = createSupabaseBrowserClient()
        
        // Get solutions that have been used for this goal
        const { data, error } = await supabase
          .from('solutions')
          .select(`
            id,
            title,
            solution_type,
            solution_implementations!inner (
              id,
              name,
              goal_implementation_links!inner (
                goal_id,
                avg_effectiveness,
                rating_count
              )
            )
          `)
          .eq('solution_implementations.goal_implementation_links.goal_id', goalId)
          .order('solution_implementations.goal_implementation_links.avg_effectiveness', { ascending: false })

        if (!error && data) {
          setExistingSolutions(data)
        }
      } catch (err) {
        console.error('Error loading solutions:', err)
      } finally {
        setIsLoadingSolutions(false)
      }
    }

    if (goalId) {
      loadExistingSolutions()
    }
  }, [goalId])

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }))
  }

  const generateImplementationName = () => {
    // Generate a descriptive name based on the category and fields
    if (category === 'dosage-based') {
      return `${dynamicFields.amount || 'Standard'} ${dynamicFields.frequency || 'protocol'}`
    } else if (category === 'time-based') {
      return `${dynamicFields.duration || 'Regular'} ${dynamicFields.frequency || 'routine'}`
    } else if (category === 'protocol-based') {
      return `${dynamicFields.technique || 'Standard'} method`
    } else if (category === 'resource-based') {
      return `Using ${dynamicFields.resource_name || 'resource'}`
    }
    return 'Standard approach'
  }

  const addFailedSolution = () => {
    if (currentFailedTitle && currentFailedScore > 0) {
      setFailedSolutions([...failedSolutions, {
        title: currentFailedTitle,
        effectiveness_score: currentFailedScore
      }])
      setCurrentFailedTitle('')
      setCurrentFailedScore(0)
    }
  }

  const removeFailedSolution = (index: number) => {
    setFailedSolutions(failedSolutions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to submit a solution')
      }

      // Handle the successful solution if effectiveness >= 3
      if (effectivenessScore >= 3) {
        // 1. Check if solution already exists (by title)
        const { data: existingSolution } = await supabase
          .from('solutions')
          .select('id')
          .eq('title', title)
          .single()

        let solutionId: string

        if (existingSolution) {
          solutionId = existingSolution.id
        } else {
          // 2. Create new solution (no description!)
          const { data: newSolution, error: solutionError } = await supabase
            .from('solutions')
            .insert({
              title,
              description: '', // Empty or could be title repeated
              solution_type: category,
              source_type: 'community_contributed',
              created_by: user.id,
              is_approved: false,
              tags: [],
            })
            .select('id')
            .single()

          if (solutionError) throw solutionError
          solutionId = newSolution.id
        }

        // 3. Create implementation with structured data
        const implementationDetails = {
          ...dynamicFields,
          time_investment: timeInvestment,
          cost_estimate: costEstimate,
          difficulty_level: difficultyLevel
        }

        const { data: implementation, error: implError } = await supabase
          .from('solution_implementations')
          .insert({
            solution_id: solutionId,
            name: generateImplementationName(),
            details: implementationDetails,
            created_by: user.id,
            source_type: 'community_contributed'
          })
          .select('id')
          .single()

        if (implError) throw implError

        // 4. Create goal-implementation link
        const { error: linkError } = await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: goalId,
            implementation_id: implementation.id,
            avg_effectiveness: effectivenessScore,
            rating_count: 1
          })

        if (linkError) throw linkError

        // 5. Create rating
        const { error: ratingError } = await supabase
          .from('ratings')
          .insert({
            implementation_id: implementation.id,
            user_id: user.id,
            effectiveness_score: effectivenessScore,
            time_to_see_results: timeToSeeResults,
            would_recommend: wouldRecommend,
            review_text: reviewText,
          })

        if (ratingError) throw ratingError
      }

      // Handle failed solutions
      for (const failed of failedSolutions) {
        // Check if solution exists
        const { data: existingSolution } = await supabase
          .from('solutions')
          .select('id')
          .eq('title', failed.title)
          .single()

        let solutionId: string

        if (existingSolution) {
          solutionId = existingSolution.id
        } else {
          // Create minimal solution entry
          const { data: newSolution, error: solutionError } = await supabase
            .from('solutions')
            .insert({
              title: failed.title,
              description: '', // No description needed
              source_type: 'community_contributed',
              created_by: user.id,
              is_approved: false,
            })
            .select('id')
            .single()

          if (solutionError) continue // Skip this one
          solutionId = newSolution.id
        }

        // Create minimal implementation
        const { data: implementation, error: implError } = await supabase
          .from('solution_implementations')
          .insert({
            solution_id: solutionId,
            name: 'Standard approach',
            details: {},
            created_by: user.id,
            source_type: 'community_contributed'
          })
          .select('id')
          .single()

        if (implError) continue

        // Create goal-implementation link with low effectiveness
        await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: goalId,
            implementation_id: implementation.id,
            avg_effectiveness: failed.effectiveness_score,
            rating_count: 1
          })

        // Create rating
        await supabase
          .from('ratings')
          .insert({
            implementation_id: implementation.id,
            user_id: user.id,
            effectiveness_score: failed.effectiveness_score,
            would_recommend: false,
            review_text: `Did not work for ${goalTitle}`,
          })
      }

      // Success! Redirect to goal page
      router.push(`/goal/${goalId}`)
    } catch (err) {
      console.error('Error submitting solution:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit solution')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render dynamic fields based on category
  const renderDynamicFields = () => {
    if (!category || !CATEGORY_FIELDS[category]) return null

    const fields = CATEGORY_FIELDS[category]
    
    return Object.entries(fields).map(([fieldName, fieldConfig]: [string, any]) => {
      if (fieldConfig.type === 'select') {
        return (
          <FormField key={fieldName} label={fieldConfig.label} required={fieldConfig.required}>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={dynamicFields[fieldName] || ''}
              onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value)}
              required={fieldConfig.required}
            >
              <option value="">Select...</option>
              {fieldConfig.options.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </FormField>
        )
      }

      // Default to text input
      return (
        <FormField key={fieldName} label={fieldConfig.label} required={fieldConfig.required}>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={dynamicFields[fieldName] || ''}
            onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder}
            required={fieldConfig.required}
          />
        </FormField>
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Solution categories are preliminary and will evolve as we learn what works best.
        </p>
      </div>

      {/* Basic Solution Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">What solution worked for you?</h3>
        
        <FormField label="Solution Name" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Vitamin D Supplementation, Morning Walk, Headspace App"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            list="existing-solutions"
          />
          <datalist id="existing-solutions">
            {existingSolutions.map((sol) => (
              <option key={sol.id} value={sol.title} />
            ))}
          </datalist>
        </FormField>

        <FormField label="Solution Category" required>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select category...</option>
            {Object.entries(SOLUTION_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Dynamic Fields Based on Category */}
      {category && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Specific Details</h3>
          {renderDynamicFields()}
        </div>
      )}

      {/* Effectiveness Rating */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How effective was this for {goalTitle}?</h3>
        
        <FormField label="Effectiveness Rating" required>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEffectivenessScore(star)}
                className={`text-3xl ${
                  star <= effectivenessScore ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </FormField>
      </div>

      {/* Additional Info (shown if effectiveness >= 3) */}
      {effectivenessScore >= 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Time Investment" required>
              <input
                type="text"
                value={timeInvestment}
                onChange={(e) => setTimeInvestment(e.target.value)}
                placeholder="e.g., 10 min/day, 2 hrs/week"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </FormField>

            <FormField label="Cost Estimate" required>
              <select
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select...</option>
                <option value="Free">Free</option>
                <option value="$">$ (Under $25/month)</option>
                <option value="$$">$$ ($25-100/month)</option>
                <option value="$$$">$$$ (Over $100/month)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Difficulty Level" required>
            <div className="flex items-center space-x-4">
              <span>Easy</span>
              <input
                type="range"
                min="1"
                max="5"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                className="flex-1"
              />
              <span>Hard</span>
              <span className="ml-2 font-semibold">{difficultyLevel}/5</span>
            </div>
          </FormField>

          <FormField label="Time to See Results">
            <select
              value={timeToSeeResults}
              onChange={(e) => setTimeToSeeResults(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select...</option>
              <option value="Immediate">Immediate</option>
              <option value="Within days">Within days</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="3-4 weeks">3-4 weeks</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3+ months">3+ months</option>
            </select>
          </FormField>

          <FormField label="Would you recommend this?">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recommend"
                  checked={wouldRecommend === true}
                  onChange={() => setWouldRecommend(true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recommend"
                  checked={wouldRecommend === false}
                  onChange={() => setWouldRecommend(false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </FormField>

          <FormField label="Brief Review">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Quick thoughts on your experience (save detailed stories for the forum!)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
            />
          </FormField>
        </div>
      )}

      {/* Failed Solutions Section - Always visible */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">What didn't work? (Optional)</h3>
        <p className="text-sm text-gray-600">
          Quick-add solutions that didn't help. No details needed - just help others avoid wasting time.
        </p>

        <div className="space-y-4">
          {failedSolutions.map((failed, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div>
                <span className="font-medium">{failed.title}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({failed.effectiveness_score}/5 effectiveness)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFailedSolution(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={currentFailedTitle}
              onChange={(e) => setCurrentFailedTitle(e.target.value)}
              placeholder="Solution name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-1">
              {[1, 2].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setCurrentFailedScore(score)}
                  className={`px-3 py-2 rounded ${
                    currentFailedScore === score 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {score}★
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={addFailedSolution}
              disabled={!currentFailedTitle || currentFailedScore === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Share Solution'}
      </Button>
    </form>
  )
}
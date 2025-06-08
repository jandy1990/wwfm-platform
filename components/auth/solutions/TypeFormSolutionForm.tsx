'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface TypeFormSolutionFormProps {
  goalId: string
  goalTitle: string
  userId: string
  goalSlug?: string
}

// Form data interface
interface FormData {
  solutionName: string
  isNewSolution: boolean
  implementationDetails: string
  effectivenessRating: number
  timeToResults: string
  wouldRecommend: boolean
  tips: string
  solutionType: string
}

// Step configuration
interface StepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onNext: () => void
}

interface ReviewStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onSubmit: () => void
  isSubmitting: boolean
}

// Common solutions by goal type
const COMMON_SOLUTIONS: Record<string, string[]> = {
  'acne': [
    'Salicylic acid wash',
    'Benzoyl peroxide cream',
    'Retinol/Tretinoin',
    'Accutane (isotretinoin)',
    'Birth control pills',
    'Zinc supplements',
    'Dairy-free diet'
  ],
  'anxiety': [
    'Meditation app',
    'CBT therapy',
    'SSRIs (medication)',
    'Exercise routine',
    'Breathing exercises',
    'Journaling',
    'Yoga practice'
  ],
  'weight-loss': [
    'Calorie counting app',
    'Keto diet',
    'Intermittent fasting',
    'Weight training',
    'Running program',
    'Meal prep'
  ]
}

const GOAL_TO_CATEGORY: Record<string, string> = {
  'overcome-anxiety': 'anxiety',
  'clear-acne': 'acne',
  'lose-weight': 'weight-loss'
}

const TIME_OPTIONS = [
  { value: 'immediately', label: 'Immediately', icon: '⚡' },
  { value: 'days', label: 'Within days', icon: '📅' },
  { value: '1-2weeks', label: '1-2 weeks', icon: '📆' },
  { value: '1month', label: '1 month', icon: '🗓️' },
  { value: '2-3months', label: '2-3 months', icon: '📊' },
  { value: '3+months', label: '3+ months', icon: '⏳' }
]

const SOLUTION_TYPES = [
  { value: 'supplement', label: 'Supplement', icon: '💊' },
  { value: 'technique', label: 'Technique', icon: '🧘' },
  { value: 'product', label: 'Product', icon: '📦' },
  { value: 'service', label: 'Service', icon: '🔧' },
  { value: 'lifestyle', label: 'Lifestyle Change', icon: '🌱' },
  { value: 'medication', label: 'Medication', icon: '💉' },
  { value: 'other', label: 'Other', icon: '📝' }
]

// Step 1: Solution Name
function SolutionNameStep({ formData, updateFormData, onNext }: StepProps) {
  const [searchQuery, setSearchQuery] = useState(formData.solutionName || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Get suggestions based on goal type
    const goalType = GOAL_TO_CATEGORY['default'] || 'general'
    const categorySolutions = COMMON_SOLUTIONS[goalType] || []
    const filtered = categorySolutions.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSuggestions(filtered)
  }, [searchQuery])

  const handleSolutionSelect = (solution: string, isNew: boolean = false) => {
    updateFormData({
      solutionName: solution,
      isNewSolution: isNew
    })
    setShowDropdown(false)
    setTimeout(() => onNext(), 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSolutionSelect(searchQuery, true)
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        What solution worked for you?
      </h2>
      
      <div className="relative max-w-md mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowDropdown(true)
            updateFormData({ solutionName: e.target.value })
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyPress={handleKeyPress}
          placeholder="Type your solution here..."
          className="w-full text-xl px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-center"
        />
        
        {showDropdown && searchQuery.length > 1 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
            {suggestions.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b">
                  Popular Solutions
                </div>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => handleSolutionSelect(suggestion, false)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </>
            )}
            
            <button
              onClick={() => handleSolutionSelect(searchQuery, true)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 text-blue-600 font-medium border-t"
            >
              + Use &quot;{searchQuery}&quot; as new solution
            </button>
          </div>
        )}
      </div>
      
      <p className="text-gray-500 mt-4">
        Search existing solutions or add your own
      </p>
    </div>
  )
}

// Step 2: Solution Type (only for new solutions)
function SolutionTypeStep({ formData, updateFormData, onNext }: StepProps) {
  const handleTypeSelect = (type: string) => {
    updateFormData({ solutionType: type })
    setTimeout(() => onNext(), 200)
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        What type of solution is this?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {SOLUTION_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => handleTypeSelect(type.value)}
            className={`p-6 border-2 rounded-2xl transition-all duration-200 hover:border-blue-500 hover:shadow-md ${
              formData.solutionType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <div className="font-medium">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 3: Implementation Details
function ImplementationStep({ formData, updateFormData, onNext }: StepProps) {
  const [details, setDetails] = useState(formData.implementationDetails || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleNext = () => {
    updateFormData({ implementationDetails: details })
    onNext()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && details.trim()) {
      handleNext()
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        How did you implement{' '}
        <span className="text-blue-600">{formData.solutionName}</span>?
      </h2>
      
      <div className="max-w-2xl mx-auto">
        <textarea
          ref={textareaRef}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe exactly how you used this solution. What was your routine? Any specific tips?"
          className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-200 min-h-32 resize-none"
          rows={4}
        />
        
        <p className="text-gray-500 mt-4 text-sm">
          Press Ctrl+Enter to continue, or use the button below
        </p>
        
        <button
          onClick={handleNext}
          disabled={!details.trim()}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// Step 4: Effectiveness Rating
function EffectivenessStep({ formData, updateFormData, onNext }: StepProps) {
  const [rating, setRating] = useState(formData.effectivenessRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const ratingLabels = [
    '', // 0 index
    "Didn't work",
    "Slightly helpful",
    "Moderately effective", 
    "Very effective",
    "Life-changing!"
  ]

  const handleRatingSelect = useCallback((selectedRating: number) => {
    setRating(selectedRating)
    updateFormData({ effectivenessRating: selectedRating })
    setTimeout(() => onNext(), 500)
  }, [updateFormData, onNext])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const num = parseInt(e.key)
    if (num >= 1 && num <= 5) {
      handleRatingSelect(num)
    }
  }, [handleRatingSelect])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        How effective was{' '}
        <span className="text-blue-600">{formData.solutionName}</span>?
      </h2>
      
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRatingSelect(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="text-6xl transition-all duration-200 hover:scale-110 focus:outline-none focus:scale-110"
          >
            <span className={`${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}>
              ★
            </span>
          </button>
        ))}
      </div>
      
      <p className="text-xl text-gray-700 min-h-8">
        {ratingLabels[hoveredRating || rating]}
      </p>
      
      <p className="text-gray-500 mt-6 text-sm">
        Click a star or press number keys 1-5
      </p>
    </div>
  )
}

// Step 5: Time to Results
function TimeToResultsStep({ formData, updateFormData, onNext }: StepProps) {
  const handleTimeSelect = (timeValue: string) => {
    updateFormData({ timeToResults: timeValue })
    setTimeout(() => onNext(), 200)
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        How long until you saw results?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {TIME_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => handleTimeSelect(option.value)}
            className={`p-6 border-2 rounded-2xl transition-all duration-200 hover:border-blue-500 hover:shadow-md ${
              formData.timeToResults === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="text-3xl mb-2">{option.icon}</div>
            <div className="font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 6: Recommendation
function RecommendationStep({ formData, updateFormData, onNext }: StepProps) {
  const handleRecommendSelect = (recommend: boolean) => {
    updateFormData({ wouldRecommend: recommend })
    setTimeout(() => onNext(), 200)
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        Would you recommend{' '}
        <span className="text-blue-600">{formData.solutionName}</span>{' '}
        to others?
      </h2>
      
      <div className="flex gap-6 justify-center">
        <button
          onClick={() => handleRecommendSelect(true)}
          className={`px-12 py-8 border-2 rounded-2xl transition-all duration-200 hover:shadow-md ${
            formData.wouldRecommend === true
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-500'
          }`}
        >
          <div className="text-6xl mb-2">👍</div>
          <div className="text-xl font-medium">Yes</div>
        </button>
        
        <button
          onClick={() => handleRecommendSelect(false)}
          className={`px-12 py-8 border-2 rounded-2xl transition-all duration-200 hover:shadow-md ${
            formData.wouldRecommend === false
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-red-500'
          }`}
        >
          <div className="text-6xl mb-2">👎</div>
          <div className="text-xl font-medium">No</div>
        </button>
      </div>
    </div>
  )
}

// Step 7: Tips (Optional)
function TipsStep({ formData, updateFormData, onNext }: StepProps) {
  const [tips, setTips] = useState(formData.tips || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleNext = () => {
    updateFormData({ tips })
    onNext()
  }

  const handleSkip = () => {
    updateFormData({ tips: '' })
    onNext()
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        Any tips for others trying{' '}
        <span className="text-blue-600">{formData.solutionName}</span>?
      </h2>
      
      <div className="max-w-2xl mx-auto">
        <textarea
          ref={textareaRef}
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          placeholder="Share any additional tips, warnings, or advice that might help others succeed..."
          className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-200 min-h-32 resize-none"
          rows={4}
        />
        
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={handleSkip}
            className="px-8 py-3 text-gray-600 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Continue
          </button>
        </div>
      </div>
      
      <p className="text-gray-500 mt-4 text-sm">
        This step is optional but very helpful for others
      </p>
    </div>
  )
}

// Step 8: Review & Submit
function ReviewStep({ formData, onSubmit, isSubmitting }: ReviewStepProps) {
  const ratingLabels = ['', "Didn't work", "Slightly helpful", "Moderately effective", "Very effective", "Life-changing!"]
  const timeLabel = TIME_OPTIONS.find(t => t.value === formData.timeToResults)?.label || formData.timeToResults

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
        Review your experience
      </h2>
      
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-left">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Solution</h3>
            <p className="text-xl">{formData.solutionName}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">How you used it</h3>
            <p className="text-gray-900">{formData.implementationDetails}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Effectiveness</h3>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= formData.effectivenessRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600">({ratingLabels[formData.effectivenessRating]})</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Time to results</h3>
            <p className="text-gray-900">{timeLabel}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Would recommend</h3>
            <p className="text-gray-900">{formData.wouldRecommend ? 'Yes' : 'No'}</p>
          </div>
          
          {formData.tips && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Tips for others</h3>
              <p className="text-gray-900">{formData.tips}</p>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="mt-8 px-12 py-4 bg-blue-600 text-white text-xl rounded-2xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 min-w-48"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Experience'}
      </button>
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Main TypeForm Component
export default function TypeFormSolutionForm({ goalId, goalTitle, userId }: TypeFormSolutionFormProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    solutionName: '',
    isNewSolution: false,
    implementationDetails: '',
    effectivenessRating: 0,
    timeToResults: '',
    wouldRecommend: true,
    tips: '',
    solutionType: ''
  })

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`solution-form-${goalId}`)
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (e) {
        console.error('Error loading saved form data:', e)
      }
    }
  }, [goalId])

  useEffect(() => {
    localStorage.setItem(`solution-form-${goalId}`, JSON.stringify(formData))
  }, [formData, goalId])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, getTotalSteps()))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getTotalSteps = () => {
    return formData.isNewSolution ? 8 : 7 // Skip solution type step for existing solutions
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create the main solution
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          created_by: userId,
          title: formData.solutionName,
          description: formData.implementationDetails,
          solution_type: formData.solutionType || 'user_submitted',
          source_type: 'community_contributed',
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
          description: formData.implementationDetails,
          implementation_details: {
            time_to_results: formData.timeToResults,
            would_recommend: formData.wouldRecommend,
            tips: formData.tips || null
          }
        })
        .select()
        .single()

      if (implError) throw implError

      // Link implementation to goal
      const { error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          implementation_id: implementation.id,
          goal_id: goalId,
          effectiveness_rating: formData.effectivenessRating * 2, // Convert 5-point to 10-point scale
          context_notes: `Worked for: ${goalTitle}`
        })

      if (linkError) throw linkError

      // Create rating
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          solution_id: solution.id,
          user_id: userId,
          effectiveness_score: formData.effectivenessRating * 2, // Convert 5-point to 10-point scale
          time_to_see_results: formData.timeToResults
        })

      if (ratingError) throw ratingError

      // Clear localStorage
      localStorage.removeItem(`solution-form-${goalId}`)

      // Success! Show celebration and redirect
      setCurrentStep(getTotalSteps() + 1) // Show success step
      setTimeout(() => {
        router.push(`/goal/${goalId}?contribution=success`)
      }, 3000)

    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep > 1) {
        prevStep()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentStep])

  // Determine which step to show
  const renderCurrentStep = () => {
    let stepNumber = currentStep
    
    // Adjust step number if skipping solution type step
    if (!formData.isNewSolution && currentStep >= 2) {
      stepNumber = currentStep + 1
    }

    switch (stepNumber) {
      case 1:
        return <SolutionNameStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 2:
        return <SolutionTypeStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 3:
        return <ImplementationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 4:
        return <EffectivenessStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 5:
        return <TimeToResultsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 6:
        return <RecommendationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 7:
        return <TipsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
      case 8:
        return <ReviewStep formData={formData} updateFormData={updateFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      case 9:
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-medium text-gray-900 mb-4">
              Thank you for sharing!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your experience will help others achieve their goals
            </p>
            <div className="animate-pulse text-blue-600">
              Redirecting you back to the goal page...
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (currentStep === getTotalSteps() + 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ProgressBar currentStep={currentStep} totalSteps={getTotalSteps()} />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="fixed top-20 left-4 p-3 text-gray-600 hover:text-gray-900 transition-colors z-40"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => router.back()}
            className="fixed top-20 right-4 p-3 text-gray-600 hover:text-gray-900 transition-colors z-40"
            aria-label="Close form"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Current step content */}
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-2xl mx-auto">
              <div 
                key={currentStep}
                className="animate-in slide-in-from-right-10 duration-300"
              >
                {renderCurrentStep()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
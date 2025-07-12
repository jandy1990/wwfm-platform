// components/solutions/forms/DosageForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check, X, Star, Plus, Search } from 'lucide-react';

interface DosageFormProps {
  goalId: string;
  goalTitle?: string;
  userId: string;
  solutionName: string;
  category: string;
  existingSolutionId?: string;
  onBack: () => void;
}

interface FailedSolution {
  id?: string;
  name: string;
  rating: number;
}

interface SolutionSuggestion {
  id: string;
  title: string;
  solution_category: string;
  description: string | null;
}

// Unit options by category - measurement units only
const unitOptions = {
  supplements_vitamins: ['mg', 'mcg', 'IU', 'g', 'ml', 'billion CFU', 'other'],
  medications: ['mg', 'mcg', 'g', 'ml', 'units', 'meq', 'other'],
  natural_remedies: ['mg', 'g', 'ml', 'tsp', 'tbsp', 'cups', 'other'],
  beauty_skincare: [] // Not used for skincare
};

// Skincare frequency options
const skincareFrequencies = [
  { value: 'twice_daily', label: 'Twice daily (AM & PM)', display: 'Twice daily' },
  { value: 'once_daily_am', label: 'Once daily (morning)', display: 'Morning only' },
  { value: 'once_daily_pm', label: 'Once daily (night)', display: 'Night only' },
  { value: 'every_other_day', label: 'Every other day', display: 'Every other day' },
  { value: '2-3_weekly', label: '2-3 times per week', display: '2-3x per week' },
  { value: 'weekly', label: 'Weekly', display: 'Weekly' },
  { value: 'spot_treatment', label: 'As needed (spot treatment)', display: 'Spot treatment' }
];

// Progress celebration messages
const ProgressCelebration = ({ step }: { step: number }) => {
  if (step === 1) return null;
  
  const celebrations = [
    "Great start! 🎯",
    "Almost there! 💪",
    "Final step! 🏁"
  ];
  
  return (
    <div className="text-center mb-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
      <p className="text-green-600 dark:text-green-400 font-medium text-lg">
        {celebrations[step - 2]}
      </p>
    </div>
  );
};

export function DosageForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: DosageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  
  // Step 1 fields - Dosage, Effectiveness, TTR
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [skincareFrequency, setSkincareFrequency] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  
  // Cost field (moved to success screen)
  const [costType, setCostType] = useState<'monthly' | 'one_time'>('monthly');
  const [costRange, setCostRange] = useState('dont_remember');
  
  // Step 2 fields - Side Effects
  const [sideEffects, setSideEffects] = useState<string[]>(['None']);
  const [customSideEffect, setCustomSideEffect] = useState('');
  const [showCustomSideEffect, setShowCustomSideEffect] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  const [newFailedSolution, setNewFailedSolution] = useState('');
  const [solutionSuggestions, setSolutionSuggestions] = useState<SolutionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Optional fields (Success screen)
  const [brand, setBrand] = useState('');
  const [form, setForm] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      
      // If we're on step 2 or 3, go back a step
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        // Push state again to maintain navigation
        window.history.pushState({ step: currentStep - 1 }, '');
      } else {
        // On step 1, exit the form
        onBack();
      }
    };

    // Push initial state
    window.history.pushState({ step: currentStep }, '');
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, onBack]);

  // Update history when step changes
  useEffect(() => {
    window.history.pushState({ step: currentStep }, '');
  }, [currentStep]);

  // Track highest step reached (separate from history management)
  useEffect(() => {
    console.log('Current step:', currentStep, 'Highest reached:', highestStepReached);
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
      console.log('Updated highest step to:', currentStep);
    }
  }, [currentStep, highestStepReached]);

  // Search for solutions as user types
  useEffect(() => {
    if (newFailedSolution.length >= 3) {
      // Clear previous timer
      if (searchTimer) clearTimeout(searchTimer);
      
      // Set new timer for debounced search
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const { data, error } = await supabase.rpc('search_all_solutions', {
            search_term: newFailedSolution
          });
          
          if (!error && data) {
            setSolutionSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error searching solutions:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
      
      setSearchTimer(timer);
    } else {
      setSolutionSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [newFailedSolution]);

  // Helper functions
  const buildDosageString = () => {
    if (category === 'beauty_skincare') {
      const selected = skincareFrequencies.find(f => f.value === skincareFrequency);
      return selected?.display || '';
    }

    const unit = showCustomUnit ? customUnit : doseUnit;
    if (!doseAmount || !unit) return '';
    
    let result = `${doseAmount} ${unit}`;
    
    if (frequency) {
      result += ` ${frequency}`;
    }
    
    return result;
  };

  const calculateDailyDose = () => {
    if (!doseAmount || !frequency || category === 'beauty_skincare' || frequency === 'as needed') return null;
    
    const amount = parseFloat(doseAmount);
    if (isNaN(amount)) return null;
    
    const multipliers: Record<string, number> = {
      'once daily': 1,
      'twice daily': 2,
      'three times daily': 3,
      'four times daily': 4,
      'every other day': 0.5,
      'twice weekly': 0.285,
      'weekly': 0.143,
      'monthly': 0.033
    };
    
    return multipliers[frequency] ? amount * multipliers[frequency] : null;
  };

  // Category-specific side effects
  const sideEffectOptions = {
    supplements_vitamins: [
      'None', 'Upset stomach', 'Nausea', 'Constipation', 'Diarrhea', 
      'Headache', 'Metallic taste', 'Fatigue', 'Skin reaction', 
      'Increased energy', 'Sleep changes', 'Morning grogginess', 
      'Vivid dreams', 'Acne/breakouts', 'Gas/bloating', 
      'Initially worse before better'
    ],
    medications: [
      'None', 'Nausea', 'Headache', 'Dizziness', 'Drowsiness', 
      'Insomnia', 'Dry mouth', 'Weight gain', 'Weight loss', 
      'Sexual side effects', 'Mood changes', 'Appetite changes', 
      'Sweating', 'Tremor', 'Constipation', 'Blurred vision', 
      'Initially worse before better'
    ],
    natural_remedies: [
      'None', 'Drowsiness', 'Upset stomach', 'Headache', 
      'Allergic reaction', 'Vivid dreams', 'Changes in appetite', 
      'Mild anxiety', 'Digestive changes', 'Skin reaction', 
      'Interactions with medications', 'Initially worse before better'
    ],
    beauty_skincare: [
      'None', 'Dryness/peeling', 'Redness/irritation', 
      'Purging (initial breakouts)', 'Burning/stinging', 'Itching', 
      'Photosensitivity', 'Discoloration', 'Allergic reaction', 
      'Oiliness', 'Clogged pores', 'Texture changes', 
      'Initially worse before better'
    ]
  };

  const handleSideEffectToggle = (effect: string) => {
    if (effect === 'None') {
      setSideEffects(['None']);
    } else {
      if (sideEffects.includes(effect)) {
        setSideEffects(sideEffects.filter(e => e !== effect));
      } else {
        setSideEffects(sideEffects.filter(e => e !== 'None').concat(effect));
      }
    }
  };

  const addCustomSideEffect = () => {
    if (customSideEffect.trim()) {
      setSideEffects(sideEffects.filter(e => e !== 'None').concat(customSideEffect.trim()));
      setCustomSideEffect('');
      setShowCustomSideEffect(false);
    }
  };

  const addFailedSolution = () => {
    if (newFailedSolution.trim()) {
      // Check if we have a selected solution from suggestions
      const selectedSuggestion = solutionSuggestions.find(
        s => s.title.toLowerCase() === newFailedSolution.toLowerCase()
      );
      
      setFailedSolutions([...failedSolutions, { 
        id: selectedSuggestion?.id,
        name: newFailedSolution, 
        rating: 1 
      }]);
      setNewFailedSolution('');
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: SolutionSuggestion) => {
    setNewFailedSolution(suggestion.title);
    setShowSuggestions(false);
  };

  const updateFailedSolutionRating = (index: number, rating: number) => {
    const updated = [...failedSolutions];
    updated[index].rating = rating;
    setFailedSolutions(updated);
  };

  const removeFailedSolution = (index: number) => {
    setFailedSolutions(failedSolutions.filter((_, i) => i !== index));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Dosage, Effectiveness, TTR
        const dosageValid = category === 'beauty_skincare' 
          ? skincareFrequency !== ''
          : doseAmount !== '' && 
            (doseUnit !== '' || (showCustomUnit && customUnit !== '')) && 
            frequency !== '';
        const effectivenessValid = effectiveness !== null && timeToResults !== '';
        return dosageValid && effectivenessValid;
        
      case 2: // Side Effects
        return sideEffects.length > 0;
        
      case 3: // Failed solutions (optional)
        return true;
        
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Build implementation name
      const implementationName = buildDosageString();
      const dailyDose = calculateDailyDose();
      
      // TODO: Main solution submission logic here
      console.log('TODO: Add main submission logic');
      
      // Submit failed solution ratings for existing solutions
      for (const failed of failedSolutions) {
        if (failed.id) {
          // This is an existing solution - create a rating for it
          await supabase.rpc('create_failed_solution_rating', {
            p_solution_id: failed.id,
            p_goal_id: goalId,
            p_user_id: userId,
            p_rating: failed.rating,
            p_solution_name: failed.name
          });
        }
      }
      
      // Store non-existing failed solutions as text in implementation
      const textOnlyFailed = failedSolutions
        .filter(f => !f.id)
        .map(f => ({ name: f.name, rating: f.rating }));
      
      console.log('Submitting:', {
        solutionName,
        implementationName,
        effectiveness,
        dailyDose,
        costRange: costRange === 'dont_remember' ? null : costRange,
        failedSolutionsWithRatings: failedSolutions.filter(f => f.id),
        failedSolutionsTextOnly: textOnlyFailed,
        sideEffects
      });
      
      // Show success screen instead of redirecting
      setShowSuccessScreen(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdditionalInfo = async () => {
    // TODO: Update the solution with brand, form, and other info
    console.log('Updating additional info:', { brand, form, otherInfo });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Dosage, Effectiveness, TTR
        return (
          <div className="space-y-8 animate-slide-in">
            {/* Quick context card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let's capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            {/* Dosage Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">💊</span>
                </div>
                <h2 className="text-xl font-semibold">Your dosage</h2>
              </div>
              
              {category === 'beauty_skincare' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    How often did you use it? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={skincareFrequency}
                    onChange={(e) => setSkincareFrequency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select frequency</option>
                    {skincareFrequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  {/* Structured dosage input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={doseAmount}
                        onChange={(e) => {
                          // NUMBER VALIDATION: Only allow numbers and decimal point
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setDoseAmount(value);
                          }
                        }}
                        placeholder="e.g., 500"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 dark:bg-gray-800 dark:text-white"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={doseUnit}
                        onChange={(e) => {
                          setDoseUnit(e.target.value);
                          setShowCustomUnit(e.target.value === 'other');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select unit</option>
                        {unitOptions[category as keyof typeof unitOptions]?.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom unit input */}
                  {showCustomUnit && (
                    <div>
                      <input
                        type="text"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="Enter unit (e.g., 'sachets', 'lozenges', 'patches')"
                        className="w-full px-3 py-2 border border-blue-500 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 dark:bg-gray-800 dark:text-white"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How often? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select frequency</option>
                      <option value="once daily">Once daily</option>
                      <option value="twice daily">Twice daily</option>
                      <option value="three times daily">Three times daily</option>
                      <option value="four times daily">Four times daily</option>
                      <option value="as needed">As needed</option>
                      <option value="every other day">Every other day</option>
                      <option value="twice weekly">Twice weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Preview */}
                  {(doseAmount && (doseUnit || customUnit) && frequency) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <span className="text-gray-500">You're taking:</span> <strong className="text-gray-900 dark:text-white">{buildDosageString()}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Visual separator */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">then</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>

            {/* Effectiveness Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <h2 className="text-xl font-semibold">How well it worked</h2>
              </div>
              
              {/* 5-star rating */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEffectiveness(rating)}
                      className={`relative py-4 px-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        effectiveness === rating
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {/* Animated selection indicator */}
                      {effectiveness === rating && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce-in">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {rating === 1 && '😞'}
                          {rating === 2 && '😕'}
                          {rating === 3 && '😐'}
                          {rating === 4 && '😊'}
                          {rating === 5 && '🤩'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                          {rating === 1 && 'Not at all'}
                          {rating === 2 && 'Slightly'}
                          {rating === 3 && 'Moderate'}
                          {rating === 4 && 'Very'}
                          {rating === 5 && 'Extremely'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between sm:hidden">
                  <span className="text-xs text-gray-500">Not at all</span>
                  <span className="text-xs text-gray-500">Extremely</span>
                </div>
              </div>

              {/* Time to results */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    When did you notice results?
                  </label>
                </div>
                <select
                  value={timeToResults}
                  onChange={(e) => setTimeToResults(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white transition-all"
                >
                  <option value="">Select timeframe</option>
                  <option value="Immediately">Immediately</option>
                  <option value="Within days">Within days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="3-4 weeks">3-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                  <option value="Still evaluating">Still evaluating</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2: // Side Effects only
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h2 className="text-xl font-semibold">Any side effects?</h2>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what to expect
              </p>
            </div>

            {/* Side effects grid with hover effects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sideEffectOptions[category as keyof typeof sideEffectOptions]?.map((effect) => (
                <label
                  key={effect}
                  className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                            transition-all transform hover:scale-[1.02] ${
                    sideEffects.includes(effect)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sideEffects.includes(effect)}
                    onChange={() => handleSideEffectToggle(effect)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 
                                transition-all ${
                    sideEffects.includes(effect)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {sideEffects.includes(effect) && (
                      <Check className="w-3 h-3 text-white animate-scale-in" />
                    )}
                  </div>
                  <span className="text-sm">{effect}</span>
                </label>
              ))}
              
              {/* Add Other button with animation */}
              <button
                onClick={() => setShowCustomSideEffect(true)}
                className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                          transition-all transform hover:scale-[1.02] border-dashed
                          border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-sm"
              >
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                  Add other side effect
                </span>
              </button>
            </div>

            {/* Custom side effect input */}
            {showCustomSideEffect && (
              <div className="mt-3 flex gap-2 animate-fade-in">
                <input
                  type="text"
                  value={customSideEffect}
                  onChange={(e) => setCustomSideEffect(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSideEffect()}
                  placeholder="Describe the side effect"
                  className="flex-1 px-3 py-2 border border-blue-500 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={addCustomSideEffect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomSideEffect(false);
                    setCustomSideEffect('');
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Show custom side effects */}
            {sideEffects.filter(e => !sideEffectOptions[category as keyof typeof sideEffectOptions]?.includes(e) && e !== 'None').length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
                <div className="flex flex-wrap gap-2">
                  {sideEffects.filter(e => !sideEffectOptions[category as keyof typeof sideEffectOptions]?.includes(e) && e !== 'None').map((effect) => (
                    <span key={effect} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                                                 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {effect}
                      <button
                        onClick={() => setSideEffects(sideEffects.filter(e => e !== effect))}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected count indicator */}
            {sideEffects.length > 0 && sideEffects[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {sideEffects.length} selected
                </span>
              </div>
            )}
          </div>
        );

      case 3: // What didn't work
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🔍</span>
              </div>
              <h2 className="text-xl font-semibold">What else did you try?</h2>
            </div>

            {/* Context card */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Help others by sharing what didn't work as well
              </p>
            </div>

            {/* Search input */}
            <div className="space-y-3">
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newFailedSolution}
                      onChange={(e) => {
                        setNewFailedSolution(e.target.value);
                        if (e.target.value.length < 3) {
                          setShowSuggestions(false);
                        }
                      }}
                      onFocus={() => {
                        if (newFailedSolution.length >= 3 && solutionSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click events on dropdown items
                        setTimeout(() => {
                          setShowSuggestions(false);
                        }, 200);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && !showSuggestions && addFailedSolution()}
                      placeholder="Search for solutions you tried (supplements, apps, therapies, etc.)"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    {!isSearching && newFailedSolution.length >= 3 && (
                      <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={addFailedSolution}
                    disabled={!newFailedSolution.trim()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                             dark:hover:bg-gray-600 rounded-lg transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                
                {/* Solution suggestions dropdown */}
                {showSuggestions && solutionSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                                 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          {solutionSuggestions.length} solution{solutionSuggestions.length > 1 ? 's' : ''} found
                        </p>
                      </div>
                      {solutionSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur on input
                            selectSuggestion(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                   transition-colors border-b border-gray-100 dark:border-gray-700 
                                   last:border-b-0 focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {suggestion.solution_category?.replace(/_/g, ' ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No results message */}
                {showSuggestions && solutionSuggestions.length === 0 && !isSearching && newFailedSolution.length >= 3 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 
                                 dark:border-gray-700 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No existing solutions found. You can still add "{newFailedSolution}" as a custom entry.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Type at least 3 characters hint */}
              {newFailedSolution.length > 0 && newFailedSolution.length < 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Type at least 3 characters to search existing solutions
                </p>
              )}
            </div>

            {failedSolutions.length > 0 && (
              <div className="space-y-3">
                {failedSolutions.map((failed, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="flex-1 font-medium">{failed.name}</span>
                    
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => updateFailedSolutionRating(index, rating)}
                          className={`p-1 transition-all ${
                            failed.rating >= rating
                              ? 'text-yellow-500'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => removeFailedSolution(index)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Rate 1-5 stars (these didn't work as well as {buildDosageString() || solutionName} for {goalTitle})
                </p>
              </div>
            )}

            {/* Skip hint with arrow animation */}
            {failedSolutions.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">Nothing to add?</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Click Submit to finish</span>
                    <div className="animate-bounce-right">→</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  // Success Screen Component
  if (showSuccessScreen) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          {/* Success animation */}
          <div className="mb-6 opacity-0 animate-[scaleIn_0.5s_ease-out_forwards]">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 opacity-0 animate-[fadeIn_0.5s_ease-in_0.3s_forwards]">
            Thank you for sharing!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 opacity-0 animate-[fadeIn_0.5s_ease-in_0.5s_forwards]">
            Your experience with {solutionName} has been recorded
          </p>

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              {/* Cost section */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Cost</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setCostType('monthly')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                      costType === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setCostType('one_time')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                      costType === 'one_time'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    One-time
                  </button>
                </div>
                <select
                  value={costRange}
                  onChange={(e) => setCostRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="dont_remember">I don't remember</option>
                  <option value="Free">Free</option>
                  {costType === 'monthly' ? (
                    <>
                      <option value="Under $10/month">Under $10/month</option>
                      <option value="$10-25/month">$10-25/month</option>
                      <option value="$25-50/month">$25-50/month</option>
                      <option value="$50-100/month">$50-100/month</option>
                      <option value="$100-200/month">$100-200/month</option>
                      <option value="$200-500/month">$200-500/month</option>
                      <option value="$500-1000/month">$500-1000/month</option>
                      <option value="Over $1000/month">Over $1000/month</option>
                    </>
                  ) : (
                    <>
                      <option value="Under $20">Under $20</option>
                      <option value="$20-50">$20-50</option>
                      <option value="$50-100">$50-100</option>
                      <option value="$100-250">$100-250</option>
                      <option value="$250-500">$250-500</option>
                      <option value="$500-1000">$500-1000</option>
                      <option value="Over $1000">Over $1000</option>
                    </>
                  )}
                </select>
              </div>

              <input
                type="text"
                placeholder="Brand/Manufacturer"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
                disabled={category === 'beauty_skincare'}
              />
              
              {category !== 'beauty_skincare' && (
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">Form factor</option>
                  <option value="tablet">Tablet/Pill</option>
                  <option value="capsule">Capsule</option>
                  <option value="softgel">Softgel</option>
                  <option value="liquid">Liquid/Syrup</option>
                  <option value="powder">Powder</option>
                  <option value="gummy">Gummy</option>
                  <option value="chewable">Chewable</option>
                  <option value="sublingual">Sublingual</option>
                  <option value="lozenge">Lozenge</option>
                  <option value="drops">Drops</option>
                  <option value="spray">Spray</option>
                  <option value="patch">Patch</option>
                  <option value="cream">Cream/Gel</option>
                  <option value="injection">Injection</option>
                  <option value="tea">Tea/Infusion</option>
                  <option value="tincture">Tincture</option>
                  <option value="other">Other</option>
                </select>
              )}
              
              <textarea
                placeholder="Any tips, warnings, or anything else that might help others?"
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(brand || form || otherInfo || costRange !== 'dont_remember') && (
                <button
                  onClick={updateAdditionalInfo}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         text-sm font-medium transition-colors"
                >
                  Save additional details
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push(`/goal/${goalId}`)}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                     rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 
                     transition-all transform hover:scale-105"
          >
            Back to goal page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onBack();
              }
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 
                    dark:border-gray-700 p-4 sm:p-6 overflow-visible">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 sm:px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                     dark:hover:text-gray-200 font-medium transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        
        <div className="flex gap-2">
          {/* Forward button - only show if we've been to a higher step */}
          {(() => {
            console.log('Should show forward button?', currentStep < highestStepReached && currentStep < totalSteps);
            console.log('currentStep:', currentStep, 'highestStepReached:', highestStepReached, 'totalSteps:', totalSteps);
            return null;
          })()}
          {true && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 sm:px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                       dark:hover:text-gray-200 font-medium transition-colors"
            >
              Forward
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNextStep()}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceedToNextStep()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === 3 ? 'Skip' : 'Continue'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceedToNextStep()}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                !isSubmitting
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// CSS animations to add to your global CSS file:
const animationStyles = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.3s ease-out; }
.animate-bounce-in { animation: bounce-in 0.4s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-bounce-right { animation: bounce-right 1s ease-in-out infinite; }
`;
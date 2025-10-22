// components/solutions/forms/DosageForm.tsx
'use client';
// Force recompile
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/database/client'; // Removed: unused after migrating to server actions
import { ChevronLeft, Check, X, Plus } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { FormSectionHeader } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';

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

// Categories that use dosage variants (beauty_skincare uses Standard)
const DOSAGE_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies']

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
  const { triggerPoints } = usePointsAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [submissionResult, setSubmissionResult] = useState<{
    solutionId?: string;
    variantId?: string;
    ratingId?: string;
    implementationId?: string;
    otherRatingsCount?: number;
  }>({});
  const [restoredFromBackup, setRestoredFromBackup] = useState(false);
  
  // Step 1 fields - Dosage, Effectiveness, TTR
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [skincareFrequency, setSkincareFrequency] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [lengthOfUse, setLengthOfUse] = useState('');
  
  // Cost field (moved to success screen)
  // Medications are always one-time purchases; other categories can toggle
  const [costType, setCostType] = useState<'monthly' | 'one_time' | ''>(
    category === 'medications' ? 'one_time' : ''
  );
  const [costRange, setCostRange] = useState('');
  
  // Step 2 fields - Side Effects
  const [sideEffects, setSideEffects] = useState<string[]>(['None']);
  const [customSideEffect, setCustomSideEffect] = useState('');
  const [showCustomSideEffect, setShowCustomSideEffect] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [brand, setBrand] = useState('');
  const [form, setForm] = useState('');
  const [notes, setNotes] = useState('');

  // Form backup - save all critical fields
  const formBackupData = {
    currentStep,
    doseAmount,
    doseUnit,
    customUnit,
    showCustomUnit,
    frequency,
    skincareFrequency,
    effectiveness,
    timeToResults,
    lengthOfUse,
    costType,
    costRange,
    sideEffects,
    customSideEffect,
    failedSolutions,
    brand,
    form,
    notes
  };

  // Use the backup hook
  const { clearBackup } = useFormBackup(
    `dosage-form-${goalId}-${category}`,
    formBackupData,
    {
      debounceMs: 1000, // Save every second
      excludeFields: ['isSubmitting', 'showSuccessScreen', 'submissionResult'],
      onRestore: (data) => {
        // Restore all form fields
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.doseAmount !== undefined) setDoseAmount(data.doseAmount);
        if (data.doseUnit !== undefined) setDoseUnit(data.doseUnit);
        if (data.customUnit !== undefined) setCustomUnit(data.customUnit);
        if (data.showCustomUnit !== undefined) setShowCustomUnit(data.showCustomUnit);
        if (data.frequency !== undefined) setFrequency(data.frequency);
        if (data.skincareFrequency !== undefined) setSkincareFrequency(data.skincareFrequency);
        if (data.effectiveness !== undefined) setEffectiveness(data.effectiveness);
        if (data.timeToResults !== undefined) setTimeToResults(data.timeToResults);
        if (data.lengthOfUse !== undefined) setLengthOfUse(data.lengthOfUse);
        if (data.costType !== undefined) setCostType(data.costType);
        if (data.costRange !== undefined) setCostRange(data.costRange);
        if (data.sideEffects !== undefined) setSideEffects(data.sideEffects);
        if (data.customSideEffect !== undefined) setCustomSideEffect(data.customSideEffect);
        if (data.failedSolutions !== undefined) setFailedSolutions(data.failedSolutions);
        if (data.brand !== undefined) setBrand(data.brand);
        if (data.form !== undefined) setForm(data.form);
        if (data.notes !== undefined) setNotes(data.notes);
        
        // Show notification that data was restored
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000); // Hide after 5 seconds
      }
    }
  );

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

  // Helper functions
  const buildDosageString = () => {
    if (category === 'beauty_skincare') {
      return 'Standard'; // Use single variant like apps
    }

    const unit = showCustomUnit ? customUnit : doseUnit;
    if (!doseAmount || !unit) return '';
    
    let result = `${doseAmount} ${unit}`;
    
    if (frequency) {
      result += ` ${frequency}`;
    }
    
    return result;
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


  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Dosage, Effectiveness, TTR
        const dosageValid = category === 'beauty_skincare'
          ? skincareFrequency !== ''
          : doseAmount !== '' &&
            parseFloat(doseAmount) > 0 &&  // Ensure positive number
            (doseUnit !== '' || (showCustomUnit && customUnit !== '')) &&
            frequency !== '';
        const effectivenessValid = effectiveness !== null && timeToResults !== '' && lengthOfUse !== '';
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
      // Prepare solution fields for storage
      // Only include fields that user has actually filled (no phantom fields)
      const solutionFields: Record<string, unknown> = {}

      // Add fields only if they have values
      if (category !== 'beauty_skincare' && frequency) {
        solutionFields.frequency = frequency
      }
      if (category === 'beauty_skincare' && skincareFrequency) {
        solutionFields.skincare_frequency = skincareFrequency
      }
      if (lengthOfUse) solutionFields.length_of_use = lengthOfUse
      if (timeToResults) solutionFields.time_to_results = timeToResults
      if (sideEffects && sideEffects.length > 0) solutionFields.side_effects = sideEffects
      if (category !== 'beauty_skincare' && doseAmount) {
        solutionFields.dosage_amount = doseAmount
        solutionFields.dosage_unit = showCustomUnit ? customUnit : doseUnit
      }
      if (costRange && costRange !== 'dont_remember') {
        solutionFields.cost = costRange
        // Store the actual cost type selection for validation
        solutionFields.dosage_cost_type = costType  // 'monthly' or 'one_time'
        // Legacy field for backwards compatibility
        solutionFields.cost_type = costType === 'one_time' ? 'one_time' : 'recurring'
      }
      // REMOVED phantom fields: brand, form_factor, notes (shown on success screen)

      // Prepare variant data for dosage categories (not beauty_skincare)
      let variantData = undefined;
      if (DOSAGE_CATEGORIES.includes(category) && doseAmount && (doseUnit || customUnit)) {
        variantData = {
          amount: parseFloat(doseAmount),
          unit: showCustomUnit ? customUnit : doseUnit,
          form_factor: form || undefined
        };
      }

      // Prepare submission data
      const submissionData: SubmitSolutionData = {
        goalId,
        userId,
        solutionName,
        category,
        existingSolutionId,
        effectiveness: effectiveness!,
        timeToResults,
        solutionFields,
        variantData,
        failedSolutions
      };

      // Call server action
      const result = await submitSolution(submissionData);
      
      if (result.success) {
        // Store the result for success screen
        setSubmissionResult({
          solutionId: result.solutionId,
          variantId: result.variantId,
          ratingId: result.ratingId,
          implementationId: result.variantId, // For dosage forms, variantId is the implementationId
          otherRatingsCount: result.otherRatingsCount
        });
        
        // Clear backup on successful submission
        clearBackup();

        // Trigger points animation
        triggerPoints({
          userId,
          points: 15,
          reason: 'Shared your experience'
        });

        // Show success screen
        setShowSuccessScreen(true);
      } else {
        // Handle error
        console.error('Error submitting solution:', result.error);
        alert(result.error || 'Failed to submit solution. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

            {category === 'beauty_skincare' ? (
              <>
                {/* Effectiveness Section for Beauty/Skincare */}
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
                        When did you notice results? <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <select
                      value={timeToResults}
                      onChange={(e) => setTimeToResults(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none transition-all"
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

                {/* Visual separator */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">then</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                </div>

                {/* Application Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <h2 className="text-xl font-semibold">Application details</h2>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      How often did you use it? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={skincareFrequency}
                      onChange={(e) => setSkincareFrequency(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none"
                    >
                      <option value="">Select frequency</option>
                      {skincareFrequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Length of use */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How long did you use it? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={lengthOfUse}
                      onChange={(e) => setLengthOfUse(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none"
                    >
                      <option value="">Select duration</option>
                      <option value="Less than 1 month">Less than 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="Over 2 years">Over 2 years</option>
                      <option value="As needed">As needed</option>
                      <option value="Still using">Still using</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Dosage Section for other categories */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-lg">💊</span>
                    </div>
                    <h2 className="text-xl font-semibold">Your dosage</h2>
                  </div>
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
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 appearance-none"
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
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 appearance-none"
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
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none"
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
                  {(doseAmount && (doseUnit || customUnit) && frequency && category !== 'beauty_skincare') && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <span className="text-gray-500">You're taking:</span> <strong className="text-gray-900 dark:text-white">{buildDosageString()}</strong>
                    </div>
                  )}
                </>
                </div>

                {/* Length of use for other categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How long did you use it? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lengthOfUse}
                    onChange={(e) => setLengthOfUse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             appearance-none"
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 1 month">Less than 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="Over 2 years">Over 2 years</option>
                    <option value="As needed">As needed</option>
                    <option value="Still using">Still using</option>
                  </select>
                </div>

                {/* Visual separator */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">then</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                </div>

                {/* Effectiveness Section for other categories */}
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
                        When did you notice results? <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <select
                      value={timeToResults}
                      onChange={(e) => setTimeToResults(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none transition-all"
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
              </>
            )}
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
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSideEffect()}
                  placeholder="Describe the side effect"
                  maxLength={500}
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

      case 3: // Failed solutions
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={3} />
            
            <FormSectionHeader
              icon="🔍"
              title="What else did you try?"
              bgColorClassName="bg-purple-100 dark:bg-purple-900"
            />
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 
                          dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Help others by sharing what didn't work as well
              </p>
            </div>
            
            <FailedSolutionsPicker
              goalId={goalId}
              goalTitle={goalTitle}
              solutionName={buildDosageString() || solutionName}
              onSolutionsChange={setFailedSolutions}
              existingSolutions={failedSolutions}
            />
            
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

  const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
    const additionalFields: Record<string, unknown> = {};
    
    if (brand && brand.trim()) additionalFields.brand = brand.trim();
    if (form && form.trim()) additionalFields.form = form.trim();
    if (notes && notes.trim()) additionalFields.notes = notes.trim();
    if (costRange && costRange !== 'dont_remember') additionalFields.cost = costRange;
    
    // Only proceed if there are fields to update
    if (Object.keys(additionalFields).length === 0) {
      console.log('No additional fields to update');
      return;
    }
    
    try {
      const result = await updateSolutionFields({
        ratingId: submissionResult.ratingId,
        goalId,
        implementationId: submissionResult.implementationId!,
        userId,
        additionalFields
      });
      
      if (result.success) {
        console.log('Successfully updated additional information');
        alert('Additional information saved successfully!');
      } else {
        console.error('Failed to update:', result.error);
        alert('Failed to save additional information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating additional info:', error);
      alert('An error occurred. Please try again.');
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
            {submissionResult.otherRatingsCount && submissionResult.otherRatingsCount > 0 ? (
              <>Your experience has been added to {submissionResult.otherRatingsCount} {submissionResult.otherRatingsCount === 1 ? 'other' : 'others'}</>
            ) : existingSolutionId ? (
              <>Your experience with {solutionName} has been recorded</>
            ) : (
              <>You're the first to review {solutionName}! It needs 2 more reviews to go live.</>
            )}
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
                {/* Only show toggle for non-medication categories */}
                {category !== 'medications' && (
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
                )}
                <select
                  value={costRange}
                  onChange={(e) => setCostRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm"
                >
                  <option value="">Select cost range...</option>
                  <option value="Free">Free</option>
                  <option value="dont_remember">I don't remember</option>
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
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm"
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What should other people know about trying to {goalTitle}?
                </label>
                <textarea
                  placeholder="Share your experience, challenges, tips, or advice that could help others..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Your insights will be shared in the Community Discussion to help others working toward this goal
                </p>
              </div>
              
              {(brand || form || notes || costRange !== 'dont_remember') && (
                <button
                  onClick={updateAdditionalInfo}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         text-sm font-medium transition-colors"
                >
                  Submit
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
      {/* Restore notification */}
      {restoredFromBackup && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
          <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span className="text-lg">✨</span>
            Your previous progress has been restored
          </p>
        </div>
      )}
      
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

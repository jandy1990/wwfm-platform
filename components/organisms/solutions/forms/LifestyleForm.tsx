// components/solutions/forms/LifestyleForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, AlertCircle, Info, ChevronLeft } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { toast } from 'sonner';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS ,  TestModeCountdown, scrollToFirstError } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface LifestyleFormProps {
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


export function LifestyleForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: LifestyleFormProps) {
  // existingSolutionId will be used when updating existing solutions
  console.log('LifestyleForm initialized with solution:', existingSolutionId || 'new');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('testMode') === 'true';
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
  
  // Step 1 fields - Universal + Required fields
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costImpact, setCostImpact] = useState('');
  const [weeklyPrepTime, setWeeklyPrepTime] = useState('');
  const [stillFollowing, setStillFollowing] = useState<boolean | null>(null);
  const [sustainabilityReason, setSustainabilityReason] = useState('');
  const [previousSleepHours, setPreviousSleepHours] = useState('');
  
  // Step 2 fields - Challenges
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [socialImpact, setSocialImpact] = useState('');
  const [sleepQualityChange, setSleepQualityChange] = useState('');
  const [specificApproach, setSpecificApproach] = useState('');
  const [resources, setResources] = useState('');
  const [notes, setNotes] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Form backup data object
  const formBackupData = {
    effectiveness,
    timeToResults,
    costImpact,
    weeklyPrepTime,
    stillFollowing,
    sustainabilityReason,
    previousSleepHours,
    selectedChallenges,
    customChallenge,
    failedSolutions,
    socialImpact,
    sleepQualityChange,
    specificApproach,
    resources,
    notes,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `lifestyle-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setEffectiveness(data.effectiveness || null);
        setTimeToResults(data.timeToResults || '');
        setCostImpact(data.costImpact || '');
        setWeeklyPrepTime(data.weeklyPrepTime || '');
        setStillFollowing(data.stillFollowing || null);
        setSustainabilityReason(data.sustainabilityReason || '');
        setPreviousSleepHours(data.previousSleepHours || '');
        setSelectedChallenges(data.selectedChallenges || ['None']);
        setCustomChallenge(data.customChallenge || '');
        setFailedSolutions(data.failedSolutions || []);
        setSocialImpact(data.socialImpact || '');
        setSleepQualityChange(data.sleepQualityChange || '');
        setSpecificApproach(data.specificApproach || '');
        setResources(data.resources || '');
        setNotes(data.notes || '');
        setCurrentStep(data.currentStep || 1);
        setHighestStepReached(data.highestStepReached || 1);
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000);
      }
    }
  );

  // Load challenge options
  useEffect(() => {
    const fetchOptions = async () => {
      setChallengesLoading(true);
      try {
        // Initialize Supabase client
        const supabaseClient = createClientComponentClient();

        const { data, error } = await supabaseClient
          .from('challenge_options')
          .select('label')
          .eq('category', category)
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error(`[LifestyleForm] Database error fetching challenges for ${category}:`, error);
          toast.error('Failed to load challenge options. Please refresh the page.');
          setChallengeOptions(['None']);
        } else if (!data || data.length === 0) {
          console.error(`[LifestyleForm] No challenge options found for category: ${category}`);
          toast.error('Challenge options not configured. Please contact support.');
          setChallengeOptions(['None']);
        } else {
          setChallengeOptions(data.map((item: { label: string }) => item.label));
        }
      } catch (err) {
        console.error(`[LifestyleForm] Exception fetching challenge options for ${category}:`, err);
        toast.error('Failed to load form options. Please refresh the page.');
        setChallengeOptions(['None']);
      } finally {
        setChallengesLoading(false);
      }
    };

    fetchOptions();
  }, [category]);

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

  // Challenge toggle handler
  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setSelectedChallenges(['None']);
      setShowCustomChallenge(false);
    } else if (challenge === 'Other (please describe)') {
      setShowCustomChallenge(!showCustomChallenge);
      if (!showCustomChallenge) {
        setSelectedChallenges(prev => [...prev.filter(c => c !== 'None'), 'Other (please describe)']);
      } else {
        setSelectedChallenges(prev => {
          const newChallenges = prev.filter(c => c !== 'Other (please describe)');
          return newChallenges.length === 0 ? ['None'] : newChallenges;
        });
      }
    } else {
      setSelectedChallenges(prev => {
        const filtered = prev.filter(c => c !== 'None');
        if (prev.includes(challenge)) {
          const newChallenges = filtered.filter(c => c !== challenge);
          return newChallenges.length === 0 ? ['None'] : newChallenges;
        }
        return [...filtered, challenge];
      });
    }
  };

  const addCustomChallenge = () => {
    if (customChallenge.trim()) {
      setSelectedChallenges(prev => [...prev.filter(c => c !== 'None'), customChallenge.trim()]);
      setCustomChallenge('');
      setShowCustomChallenge(false);
    }
  };

  // Field validation helper
  const validateField = (fieldName: string, value: any) => {
    let error = '';

    switch (fieldName) {
      case 'effectiveness':
        if (value === null || value === '') {
          error = 'Please rate the effectiveness';
        }
        break;
      case 'timeToResults':
        if (!value || value === '') {
          error = 'Please select when you noticed results';
        }
        break;
      case 'costImpact':
        if (!value || value === '') {
          error = 'Please select cost impact';
        }
        break;
      case 'stillFollowing':
        if (value === null) {
          error = 'Please select if you\'re still following this';
        }
        break;
      case 'weeklyPrepTime':
        if (category === 'diet_nutrition' && (!value || value === '')) {
          error = 'Please select weekly prep time';
        }
        break;
      case 'previousSleepHours':
        if (category === 'sleep' && (!value || value === '')) {
          error = 'Please select previous sleep hours';
        }
        break;
    }

    setValidationErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[fieldName] = error;
      } else {
        delete updated[fieldName];
      }
      return updated;
    });
  };

  // Mark field as touched (for showing validation errors)
  const markTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Touch all required fields for current step (to show validation errors)
  const touchAllRequiredFields = () => {
    switch (currentStep) {
      case 1: // Universal + Required fields
        // Mark as touched AND validate to generate errors
        markTouched('effectiveness');
        validateField('effectiveness', effectiveness);

        markTouched('timeToResults');
        validateField('timeToResults', timeToResults);

        markTouched('costImpact');
        validateField('costImpact', costImpact);

        markTouched('stillFollowing');
        validateField('stillFollowing', stillFollowing);

        if (category === 'diet_nutrition') {
          markTouched('weeklyPrepTime');
          validateField('weeklyPrepTime', weeklyPrepTime);
        }

        if (category === 'sleep') {
          markTouched('previousSleepHours');
          validateField('previousSleepHours', previousSleepHours);
        }
        break;
      case 2: // Challenges
        // Challenges use array validation - no individual fields
        if (selectedChallenges.length === 0) {
          toast.error('Please select at least one challenge');
        }
        break;
      case 3: // Failed solutions (optional, always valid)
        break;
    }
  };

  // Handle Continue button click with validation feedback
  const handleContinue = () => {
    if (!canProceedToNextStep()) {
      // Show validation errors on all required fields
      touchAllRequiredFields();

      // Scroll to first error
      scrollToFirstError(validationErrors);

      // Toast notification
      toast.error('Please fill all required fields');

      return; // Block navigation
    }

    // Validation passed - proceed to next step
    setCurrentStep(currentStep + 1);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Universal + Required fields
        const universalValid = effectiveness !== null && timeToResults !== '' && costImpact !== '' && stillFollowing !== null;
        const categorySpecificValid = category === 'diet_nutrition' 
          ? weeklyPrepTime !== ''
          : previousSleepHours !== '';
        return universalValid && categorySpecificValid;
        
      case 2: // Challenges
        return selectedChallenges.length > 0;
        
      case 3: // Failed solutions (optional)
        return true;
        
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    // Validate before submission
    if (!canProceedToNextStep()) {
      touchAllRequiredFields();
      scrollToFirstError(validationErrors);
      toast.error('Please fill all required fields before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Keep stillFollowing and sustainabilityReason as separate fields
      
      // Primary cost field for cross-category filtering
      const primaryCost = costImpact; // For lifestyle, the impact IS the primary cost info
      const costType = "impact"; // Special type for relative cost changes
      
      // Prepare the solution fields with correct field names
      const solutionFields: Record<string, unknown> = {
        // Primary cost fields for filtering
        cost: primaryCost,
        cost_type: costType,
        // Keep detailed cost impact field
        cost_impact: costImpact,
        // Universal field
        time_to_results: timeToResults,
        // Completion tracking fields (separate for clarity)
        ...(stillFollowing !== null && { still_following: stillFollowing }),
        ...(sustainabilityReason && { sustainability_reason: sustainabilityReason }),
        
        // Category-specific fields
        ...(category === 'diet_nutrition' && {
          weekly_prep_time: weeklyPrepTime,
        }),
        ...(category === 'sleep' && {
          previous_sleep_hours: previousSleepHours,
        }),
        
        // Array field (challenges for both categories) - "None" is a valid value
        challenges: selectedChallenges
        
        // REMOVED from initial submission - optional fields handled in success screen only
      };
      
      // Submit the solution
      const submitData: SubmitSolutionData = {
        solutionName,
        category,
        goalId,
        userId,
        existingSolutionId,
        effectiveness: effectiveness!,  // Pass effectiveness as top-level field
        timeToResults,  // Pass timeToResults as top-level field
        solutionFields,
        failedSolutions: failedSolutions.map(f => ({
          name: f.name,
          rating: f.rating,
          id: f.id
        }))
      };
      
      const result = await submitSolution(submitData);
      
      if (result.success) {
        setSubmissionResult({
          solutionId: result.solutionId,
          variantId: result.variantId,
          ratingId: result.ratingId,
          implementationId: result.variantId,
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
        console.error('Submission failed:', result.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

    const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
    const additionalFields: Record<string, unknown> = {};
    
    if (socialImpact && socialImpact.trim()) additionalFields.social_impact = socialImpact.trim();
    if (sleepQualityChange && sleepQualityChange.trim()) additionalFields.sleep_quality_change = sleepQualityChange.trim();
    if (specificApproach && specificApproach.trim()) additionalFields.specific_approach = specificApproach.trim();
    if (resources && resources.trim()) additionalFields.resources = resources.trim();
    if (notes && notes.trim()) additionalFields.notes = notes.trim();
    
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
        toast.success('Additional information saved!', {
          description: 'Your extra details have been added to your review.'
        });
      } else {
        console.error('Failed to update:', result.error);
        toast.error('Failed to save additional information', {
          description: 'Please try again or contact support if the problem persists.'
        });
      }
    } catch (error) {
      console.error('Error updating additional info:', error);
      toast.error('An error occurred', {
        description: 'Please try again or contact support if the problem persists.'
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Universal + Required fields
        return (
          <div className="space-y-8 animate-slide-in">        {/* Restore notification */}
        {restoredFromBackup && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                        rounded-lg p-3 mb-4 animate-fade-in">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Your previous progress has been restored
            </p>
          </div>
        )}
        
        {/* Quick context card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20
                          border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Let&apos;s capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            {/* Effectiveness Section */}
            <div className="space-y-6">
              <FormSectionHeader
                title="How well it worked"
                icon={CATEGORY_ICONS[category]}
              />
              
              {/* 5-star rating */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setEffectiveness(rating);
                        validateField('effectiveness', rating);
                        markTouched('effectiveness');
                      }}
                      className={`relative py-4 px-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                        effectiveness === rating
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105 shadow-lg'
                          : touched.effectiveness && validationErrors.effectiveness
                          ? 'border-red-500 dark:border-red-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {/* Animated selection indicator */}
                      {effectiveness === rating && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce-in">
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
                {touched.effectiveness && validationErrors.effectiveness && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.effectiveness}
                  </p>
                )}
              </div>

              {/* Time to results */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    When did you notice results?
                  </label>
                </div>
                <Select
                  value={timeToResults}
                  onValueChange={(val) => {
                    setTimeToResults(val);
                    validateField('timeToResults', val);
                    markTouched('timeToResults');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-3 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                             touched.timeToResults && validationErrors.timeToResults
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediately">Immediately</SelectItem>
                    <SelectItem value="Within days">Within days</SelectItem>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                    <SelectItem value="1-2 months">1-2 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                    <SelectItem value="Still evaluating">Still evaluating</SelectItem>
                  </SelectContent>
                </Select>
                {touched.timeToResults && validationErrors.timeToResults && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.timeToResults}
                  </p>
                )}
              </div>
            </div>

            {/* Visual separator */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">then</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>

            {/* Required Fields Section */}
            <div className="space-y-6">
              <FormSectionHeader
                title="Key details"
                icon={CATEGORY_ICONS[category]}
              />

              {/* Cost Impact */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cost impact <span className="text-red-500">*</span>
                </label>
                <Select
                  value={costImpact}
                  onValueChange={(val) => {
                    setCostImpact(val);
                    validateField('costImpact', val);
                    markTouched('costImpact');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-3 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                             touched.costImpact && validationErrors.costImpact
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder={category === 'diet_nutrition' ? "Compared to previous diet" : "Any costs?"} />
                  </SelectTrigger>
                  <SelectContent>
                    {category === 'diet_nutrition' ? (
                      <>
                        <SelectItem value="Significantly more expensive">Significantly more expensive</SelectItem>
                        <SelectItem value="Somewhat more expensive">Somewhat more expensive</SelectItem>
                        <SelectItem value="About the same">About the same</SelectItem>
                        <SelectItem value="Somewhat less expensive">Somewhat less expensive</SelectItem>
                        <SelectItem value="Significantly less expensive">Significantly less expensive</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Under $50">Under $50</SelectItem>
                        <SelectItem value="$50-$100">$50-$100</SelectItem>
                        <SelectItem value="$100-$200">$100-$200</SelectItem>
                        <SelectItem value="Over $200">Over $200</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {touched.costImpact && validationErrors.costImpact && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.costImpact}
                  </p>
                )}
              </div>

              {/* Category-specific required fields */}
              {category === 'diet_nutrition' && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Weekly prep time <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={weeklyPrepTime}
                    onValueChange={(val) => {
                      setWeeklyPrepTime(val);
                      validateField('weeklyPrepTime', val);
                      markTouched('weeklyPrepTime');
                    }}
                  >
                    <SelectTrigger className={`w-full px-4 py-3 rounded-lg
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                               touched.weeklyPrepTime && validationErrors.weeklyPrepTime
                                 ? 'border-2 border-red-500 dark:border-red-600'
                                 : 'border border-gray-300 dark:border-gray-600'
                             }`}>
                      <SelectValue placeholder="Time spent on meal planning/prep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No extra time">No extra time</SelectItem>
                      <SelectItem value="Under 1 hour/week">Under 1 hour/week</SelectItem>
                      <SelectItem value="1-2 hours/week">1-2 hours/week</SelectItem>
                      <SelectItem value="2-4 hours/week">2-4 hours/week</SelectItem>
                      <SelectItem value="4-6 hours/week">4-6 hours/week</SelectItem>
                      <SelectItem value="6-8 hours/week">6-8 hours/week</SelectItem>
                      <SelectItem value="Over 8 hours/week">Over 8 hours/week</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.weeklyPrepTime && validationErrors.weeklyPrepTime && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.weeklyPrepTime}
                    </p>
                  )}
                </div>
              )}

              {category === 'sleep' && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Previous sleep hours <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={previousSleepHours}
                    onValueChange={(val) => {
                      setPreviousSleepHours(val);
                      validateField('previousSleepHours', val);
                      markTouched('previousSleepHours');
                    }}
                  >
                    <SelectTrigger className={`w-full px-4 py-3 rounded-lg
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                               touched.previousSleepHours && validationErrors.previousSleepHours
                                 ? 'border-2 border-red-500 dark:border-red-600'
                                 : 'border border-gray-300 dark:border-gray-600'
                             }`}>
                      <SelectValue placeholder="Before this change" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under 4 hours">Under 4 hours</SelectItem>
                      <SelectItem value="4-5 hours">4-5 hours</SelectItem>
                      <SelectItem value="5-6 hours">5-6 hours</SelectItem>
                      <SelectItem value="6-7 hours">6-7 hours</SelectItem>
                      <SelectItem value="7-8 hours">7-8 hours</SelectItem>
                      <SelectItem value="Over 8 hours">Over 8 hours</SelectItem>
                      <SelectItem value="Highly variable">Highly variable</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.previousSleepHours && validationErrors.previousSleepHours && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.previousSleepHours}
                    </p>
                  )}
                </div>
              )}

              {/* Long-term Sustainability - Two-step approach */}
              <div className="space-y-4">
                {/* Step A: Radio buttons for still following */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Are you still following this {category === 'sleep' ? 'sleep' : 'diet'} approach? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      stillFollowing === true
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : touched.stillFollowing && validationErrors.stillFollowing
                        ? 'border-red-500 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="stillFollowing"
                        checked={stillFollowing === true}
                        onChange={() => {
                          setStillFollowing(true);
                          setSustainabilityReason(''); // Reset reason when changing selection
                          validateField('stillFollowing', true);
                          markTouched('stillFollowing');
                        }}
                        className="mr-2 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm">Yes, still following it</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      stillFollowing === false
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : touched.stillFollowing && validationErrors.stillFollowing
                        ? 'border-red-500 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="stillFollowing"
                        checked={stillFollowing === false}
                        onChange={() => {
                          setStillFollowing(false);
                          setSustainabilityReason(''); // Reset reason when changing selection
                          validateField('stillFollowing', false);
                          markTouched('stillFollowing');
                        }}
                        className="mr-2 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm">No, I stopped</span>
                    </label>
                  </div>
                  {touched.stillFollowing && validationErrors.stillFollowing && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.stillFollowing}
                    </p>
                  )}
                </div>

                {/* Step B: Conditional dropdown based on selection */}
                {/* Trigger recompile */}
                {stillFollowing === true && (
                  <div className="space-y-3 animate-slide-in">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      How's it going? <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <Select value={sustainabilityReason} onValueChange={setSustainabilityReason}>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy to maintain now">Easy to maintain now</SelectItem>
                        <SelectItem value="Takes effort but manageable">Takes effort but manageable</SelectItem>
                        <SelectItem value="Getting harder over time">Getting harder over time</SelectItem>
                        <SelectItem value="Struggling but continuing">Struggling but continuing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {stillFollowing === false && (
                  <div className="space-y-3 animate-slide-in">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Main reason you stopped? <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <Select value={sustainabilityReason} onValueChange={setSustainabilityReason}>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Too hard to sustain">Too hard to sustain</SelectItem>
                        <SelectItem value="No longer needed (problem solved)">No longer needed (problem solved)</SelectItem>
                        <SelectItem value="Found something better">Found something better</SelectItem>
                        <SelectItem value="Life circumstances changed">Life circumstances changed</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Challenges
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />

            <FormSectionHeader
              title="Any challenges?"
              icon={CATEGORY_ICONS[category]}
            />

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what to expect
              </p>
            </div>

            {/* Challenges grid */}
            {challengesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challengeOptions.map((challenge) => (
                  <label
                    key={challenge}
                    className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                              transition-all transform hover:scale-[1.02] ${
                      selectedChallenges.includes(challenge)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChallenges.includes(challenge)}
                      onChange={() => handleChallengeToggle(challenge)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 
                                  transition-all ${
                      selectedChallenges.includes(challenge)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }`}>
                      {selectedChallenges.includes(challenge) && (
                        <Check className="w-3 h-3 text-white animate-scale-in" />
                      )}
                    </div>
                    <span className="text-sm">{challenge}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Custom challenge input */}
            {showCustomChallenge && (
              <div className="mt-3 flex gap-2 animate-fade-in">
                <input
                  type="text"
                  value={customChallenge}
                  onChange={(e) => setCustomChallenge(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomChallenge()}
                  placeholder="Describe the challenge"
                  maxLength={500}
                  className="flex-1 px-3 py-2 border border-purple-500 rounded-lg 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={addCustomChallenge}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white 
                           rounded-lg transition-colors button-focus-tight"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setShowCustomChallenge(false);
                    setCustomChallenge('');
                    setSelectedChallenges(prev => prev.filter(c => c !== 'Other (please describe)'));
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Display custom challenges */}
            {(() => {
              const customChallenges = selectedChallenges.filter(c => 
                !challengeOptions.includes(c) && c !== 'None' && c !== 'Other (please describe)'
              );
              return customChallenges.length > 0 && (
                <div className="mt-3 space-y-2">
                  {customChallenges.map((challenge) => (
                    <div key={challenge} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 
                                                  px-3 py-2 rounded-lg animate-fade-in">
                      <span className="text-sm flex-1">{challenge}</span>
                      <button
                        onClick={() => setSelectedChallenges(prev => {
                          const newChallenges = prev.filter(c => c !== challenge);
                          return newChallenges.length === 0 ? ['None'] : newChallenges;
                        })}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Selected count indicator */}
            {selectedChallenges.length > 0 && selectedChallenges[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                               text-purple-700 dark:text-purple-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {selectedChallenges.filter(c => c !== 'Other (please describe)').length} selected
                </span>
              </div>
            )}
          </div>
        );

      case 3: // What didn't work
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />

            <FormSectionHeader
              title="What else did you try?"
              icon={CATEGORY_ICONS[category]}
            />

            {/* Context card */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Help others by sharing what didn&apos;t work as well
              </p>
            </div>

            {/* Failed Solutions Picker */}
            <FailedSolutionsPicker
              goalId={goalId}
              goalTitle={goalTitle}
              solutionName={solutionName}
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
            ) : (
              <>Your experience with {solutionName} has been recorded and will help people worldwide</>
            )}
          </p>

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              {/* Category-specific optional fields */}
              {category === 'diet_nutrition' && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Social impact</label>
                  <Select value={socialImpact} onValueChange={setSocialImpact}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                      <SelectValue placeholder="Social challenges?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No impact">No impact</SelectItem>
                      <SelectItem value="Slightly challenging">Slightly challenging</SelectItem>
                      <SelectItem value="Moderately challenging">Moderately challenging</SelectItem>
                      <SelectItem value="Very challenging">Very challenging</SelectItem>
                      <SelectItem value="Deal breaker">Deal breaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {category === 'sleep' && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Sleep quality change</label>
                  <Select value={sleepQualityChange} onValueChange={setSleepQualityChange}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                      <SelectValue placeholder="Quality improvement?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dramatically better">Dramatically better</SelectItem>
                      <SelectItem value="Significantly better">Significantly better</SelectItem>
                      <SelectItem value="Somewhat better">Somewhat better</SelectItem>
                      <SelectItem value="No change">No change</SelectItem>
                      <SelectItem value="Somewhat worse">Somewhat worse</SelectItem>
                      <SelectItem value="Much worse">Much worse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {category === 'sleep' && (
                <input
                  type="text"
                  placeholder="Specific approach or method"
                  value={specificApproach}
                  onChange={(e) => setSpecificApproach(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
                />
              )}

              <input
                type="text"
                placeholder="Helpful resources (books, apps, etc.)"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Always-visible submit button - center aligned */}
            <div className="text-center mt-4">
              <button
                onClick={updateAdditionalInfo}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                         font-semibold transition-colors button-focus-tight"
              >
                Submit extra details
              </button>
            </div>
          </div>

          {/* Test Mode Return or Goal Page Navigation */}
          {isTestMode ? (
            <TestModeCountdown isTestMode={isTestMode} />
          ) : (
            <button
              onClick={() => router.push(`/goal/${goalId}`)}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                       rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100
                       transition-all transform hover:scale-105"
            >
              Back to goal page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Unified Form Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Progress Bar - Integrated Header */}
        <div className="sticky top-0 z-10
                        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
                        px-4 sm:px-6 py-3
                        safe-area-inset-top">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onBack();
                }
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors button-focus-tight"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 overflow-visible">
          {renderStep()}
        </div>

        {/* Navigation - Integrated Footer */}
        <div className="sticky bottom-0 z-10
                        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
                        px-4 sm:px-6 py-3
                        safe-area-inset-bottom">
          <div className="flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 sm:px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800
                         dark:hover:text-gray-200 font-semibold transition-colors button-focus-tight"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              {/* Forward button - only show if we've been to a higher step */}
              {currentStep < highestStepReached && currentStep < totalSteps && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 sm:px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800
                           dark:hover:text-gray-200 font-semibold transition-colors button-focus-tight"
                >
                  Forward
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={handleContinue}
                  className="px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {currentStep === 3 ? 'Skip' : 'Continue'}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors ${
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

      </div>

      {/* Step Navigation Helper - Outside unified container */}
      {!canProceedToNextStep() && currentStep === 1 && (
        <Alert className="mt-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Required to continue:</p>
            <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200">
              {effectiveness === null && <li>Effectiveness rating</li>}
              {!timeToResults && <li>Time to results</li>}
              {!costImpact && <li>Cost impact</li>}
              {stillFollowing === null && <li>Still following</li>}
              {category === 'diet_nutrition' && !weeklyPrepTime && <li>Weekly prep time</li>}
              {category === 'sleep' && !previousSleepHours && <li>Previous sleep hours</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

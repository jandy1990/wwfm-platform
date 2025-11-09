'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Check, AlertCircle, Info } from 'lucide-react';
import { Skeleton } from '@/components/atoms/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { toast } from 'sonner';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS, TestModeCountdown, scrollToFirstError, CategorySwitcher } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface HobbyFormProps {
  goalId: string;
  goalTitle?: string;
  userId: string;
  solutionName: string;
  category: string;
  existingSolutionId?: string;
  onBack: () => void;
  onCategoryChange: (newCategory: string) => void;
}

interface FailedSolution {
  id?: string;
  name: string;
  rating: number;
}

export function HobbyForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: HobbyFormProps) {
  console.log('HobbyForm initialized with solution:', existingSolutionId || 'new', 'category:', category);
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
  
  // Step 1 fields - Hobby details
  const [startupCost, setStartupCost] = useState('');
  const [ongoingCost, setOngoingCost] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [frequency, setFrequency] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  
  // Step 2 fields - Challenges
  const [challenges, setChallenges] = useState<string[]>(['None']);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);

  // Loading state and options for database fetch
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeOptionsState, setChallengeOptionsState] = useState<string[]>([]);

  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [communityName, setCommunityName] = useState('');
  const [notes, setNotes] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Track if optional fields have been submitted
  const [optionalFieldsSubmitted, setOptionalFieldsSubmitted] = useState(false);

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;
  
  // Form backup data object
  const formBackupData = {
    startupCost,
    ongoingCost,
    timeCommitment,
    frequency,
    effectiveness,
    timeToResults,
    challenges,
    communityName,
    notes,
    failedSolutions,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `hobby-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setStartupCost(data.startupCost || '');
        setOngoingCost(data.ongoingCost || '');
        setTimeCommitment(data.timeCommitment || '');
        setFrequency(data.frequency || '');
        setEffectiveness(data.effectiveness || null);
        setTimeToResults(data.timeToResults || '');
        setChallenges(data.challenges || ['None']);
        setCommunityName(data.communityName || '');
        setNotes(data.notes || '');
        setFailedSolutions(data.failedSolutions || []);
        setCurrentStep(data.currentStep || 1);
        setHighestStepReached(data.highestStepReached || 1);
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000);
      }
    }
  );

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        window.history.pushState({ step: currentStep - 1 }, '');
      } else {
        onBack();
      }
    };

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

  // Track highest step reached
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep, highestStepReached]);

  // Fetch challenge options from database
  useEffect(() => {
    const fetchChallengeOptions = async () => {
      setLoadingChallenges(true);
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from('challenge_options')
          .select('label')
          .eq('category', 'hobbies_activities')
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error('[HobbyForm] Database error fetching challenges:', error);
          toast.error('Failed to load challenge options. Please refresh the page.');
          setChallengeOptionsState(['None']);
        } else if (!data || data.length === 0) {
          console.error('[HobbyForm] No challenge options found for category: hobbies_activities');
          toast.error('Challenge options not configured. Please contact support.');
          setChallengeOptionsState(['None']);
        } else {
          setChallengeOptionsState(data.map(item => item.label));
        }
      } catch (err) {
        console.error('[HobbyForm] Exception fetching challenge options:', err);
        toast.error('Failed to load form options. Please refresh the page.');
        setChallengeOptionsState(['None']);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchChallengeOptions();
  }, []);

  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setChallenges(['None']);
    } else {
      if (challenges.includes(challenge)) {
        setChallenges(challenges.filter(c => c !== challenge));
      } else {
        setChallenges(challenges.filter(c => c !== 'None').concat(challenge));
      }
    }
  };

  const addCustomChallenge = () => {
    if (customChallenge.trim()) {
      setChallenges(challenges.filter(c => c !== 'None').concat(customChallenge.trim()));
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
      case 'startupCost':
        if (!value || value === '') {
          error = 'Please select startup cost';
        }
        break;
      case 'ongoingCost':
        if (!value || value === '') {
          error = 'Please select ongoing cost';
        }
        break;
      case 'timeCommitment':
        if (!value || value === '') {
          error = 'Please select time per session';
        }
        break;
      case 'frequency':
        if (!value || value === '') {
          error = 'Please select frequency';
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
    if (currentStep === 1) {
      markTouched('effectiveness'); validateField('effectiveness', effectiveness);
      markTouched('timeToResults'); validateField('timeToResults', timeToResults);
      markTouched('startupCost'); validateField('startupCost', startupCost);
      markTouched('ongoingCost'); validateField('ongoingCost', ongoingCost);
      markTouched('timeCommitment'); validateField('timeCommitment', timeCommitment);
      markTouched('frequency'); validateField('frequency', frequency);
    } else if (currentStep === 2 && challenges.length === 0) {
      toast.error('Please select at least one challenge');
    }
  };

  // Handle Continue button click with validation feedback
  const handleContinue = () => {
    if (!canProceedToNextStep()) {
      touchAllRequiredFields();
      scrollToFirstError(validationErrors);
      toast.error('Please fill all required fields');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Hobby details
        return startupCost !== '' && ongoingCost !== '' && timeCommitment !== '' && frequency !== '' && 
               effectiveness !== null && timeToResults !== '';
        
      case 2: // Challenges
        return challenges.length > 0;
        
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

    try{
      // Prepare solution fields for storage
      // Primary cost field for cross-category filtering
      const hasUnknownCost = ongoingCost === "Don't remember" || startupCost === "Don't remember";
      const primaryCost = hasUnknownCost ? "Unknown" :
                          ongoingCost && ongoingCost !== "Free/No ongoing cost" ? ongoingCost :
                          startupCost && startupCost !== "Free/No startup cost" ? startupCost :
                          "Free/No ongoing cost"; // Changed from "Free" to match dropdown options
      const costType = hasUnknownCost ? "unknown" :
                       (ongoingCost && ongoingCost !== "Free/No ongoing cost") &&
                       (startupCost && startupCost !== "Free/No startup cost") ? "dual" :
                       ongoingCost && ongoingCost !== "Free/No ongoing cost" ? "recurring" :
                       startupCost && startupCost !== "Free/No startup cost" ? "one_time" : "free";
      
      const solutionFields = {
        // Primary cost fields for filtering
        cost: primaryCost,
        cost_type: costType,
        // Detailed cost fields preserved
        startup_cost: startupCost,
        ongoing_cost: ongoingCost,
        // Other fields
        time_commitment: timeCommitment,
        frequency,
        time_to_results: timeToResults,  // Standardized field name
        challenges,
        // REMOVED from initial submission - optional fields handled in success screen only
      };

      // Prepare submission data (Hobbies don't have variants)
      const submissionData: SubmitSolutionData = {
        goalId,
        userId,
        solutionName,
        category,
        existingSolutionId,
        effectiveness: effectiveness!,
        timeToResults,
        solutionFields,
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
        // Handle error - validation or submission failure
        console.error('[HobbyForm] Submission failed:', result.error);
        toast.error('Unable to submit', {
          description: result.error || 'Please check your entries and try again.',
          duration: 6000, // 6 seconds for better visibility
        });
      }
    } catch (error) {
      console.error('[HobbyForm] Exception during submission:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again or contact support if the problem persists.',
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

    const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
    const additionalFields: Record<string, unknown> = {};
    
    if (communityName && communityName.trim()) additionalFields.community_name = communityName.trim();
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
        setOptionalFieldsSubmitted(true);
        toast.success('Additional information saved successfully!');
      } else {
        console.error('Failed to update:', result.error);
        toast.error('Failed to save additional information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating additional info:', error);
      toast.error('An error occurred. Please try again.');
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1: // Hobby details
        return (
          <div className="space-y-8 animate-slide-in">
            {/* Restore notification */}
            {restoredFromBackup && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                            rounded-lg p-3 mb-4 animate-fade-in">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Your previous progress has been restored
                </p>
              </div>
            )}
            
            {/* Category Switcher */}
            <CategorySwitcher
              category={category}
              solutionName={solutionName}
              goalTitle={goalTitle}
              onCategoryChange={onCategoryChange}
            />

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

              {/* Time to enjoyment */}
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
                    <SelectItem value="Still learning to enjoy it">Still learning to enjoy it</SelectItem>
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

            {/* Hobby Details Section */}
            <div className="space-y-6">
              <FormSectionHeader 
                icon={CATEGORY_ICONS[category]} 
                title="Hobby details"
              />
              
              {/* Initial/Startup Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Initial startup cost <span className="text-red-500">*</span>
                </label>
                <Select
                  value={startupCost}
                  onValueChange={(val) => {
                    setStartupCost(val);
                    validateField('startupCost', val);
                    markTouched('startupCost');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                             touched.startupCost && validationErrors.startupCost
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select startup cost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free/No startup cost">Free/No startup cost</SelectItem>
                    <SelectItem value="Don't remember">Don't remember</SelectItem>
                    <SelectItem value="Under $50">Under $50</SelectItem>
                    <SelectItem value="$50-$100">$50-$100</SelectItem>
                    <SelectItem value="$100-$250">$100-$250</SelectItem>
                    <SelectItem value="$250-$500">$250-$500</SelectItem>
                    <SelectItem value="$500-$1,000">$500-$1,000</SelectItem>
                    <SelectItem value="$1,000-$2,500">$1,000-$2,500</SelectItem>
                    <SelectItem value="$2,500-$5,000">$2,500-$5,000</SelectItem>
                    <SelectItem value="Over $5,000">Over $5,000</SelectItem>
                  </SelectContent>
                </Select>
                {touched.startupCost && validationErrors.startupCost && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.startupCost}
                  </p>
                )}
              </div>

              {/* Ongoing Monthly Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Typical monthly cost <span className="text-red-500">*</span>
                </label>
                <Select
                  value={ongoingCost}
                  onValueChange={(val) => {
                    setOngoingCost(val);
                    validateField('ongoingCost', val);
                    markTouched('ongoingCost');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                             touched.ongoingCost && validationErrors.ongoingCost
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select monthly cost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free/No ongoing cost">Free/No ongoing cost</SelectItem>
                    <SelectItem value="Don't remember">Don't remember</SelectItem>
                    <SelectItem value="Under $25/month">Under $25/month</SelectItem>
                    <SelectItem value="$25-$50/month">$25-$50/month</SelectItem>
                    <SelectItem value="$50-$100/month">$50-$100/month</SelectItem>
                    <SelectItem value="$100-$200/month">$100-$200/month</SelectItem>
                    <SelectItem value="$200-$500/month">$200-$500/month</SelectItem>
                    <SelectItem value="Over $500/month">Over $500/month</SelectItem>
                  </SelectContent>
                </Select>
                {touched.ongoingCost && validationErrors.ongoingCost && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.ongoingCost}
                  </p>
                )}
              </div>

              {/* Time commitment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Time per session? <span className="text-red-500">*</span>
                </label>
                <Select
                  value={timeCommitment}
                  onValueChange={(val) => {
                    setTimeCommitment(val);
                    validateField('timeCommitment', val);
                    markTouched('timeCommitment');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                             touched.timeCommitment && validationErrors.timeCommitment
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                    <SelectItem value="30-60 minutes">30-60 minutes</SelectItem>
                    <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                    <SelectItem value="2-4 hours">2-4 hours</SelectItem>
                    <SelectItem value="Half day">Half day</SelectItem>
                    <SelectItem value="Full day">Full day</SelectItem>
                    <SelectItem value="Varies significantly">Varies significantly</SelectItem>
                  </SelectContent>
                </Select>
                {touched.timeCommitment && validationErrors.timeCommitment && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.timeCommitment}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  How often do you do it? <span className="text-red-500">*</span>
                </label>
                <Select
                  value={frequency}
                  onValueChange={(val) => {
                    setFrequency(val);
                    validateField('frequency', val);
                    markTouched('frequency');
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                             touched.frequency && validationErrors.frequency
                               ? 'border-2 border-red-500 dark:border-red-600'
                               : 'border border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Few times a week">Few times a week</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Few times a month">Few times a month</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Occasionally">Occasionally</SelectItem>
                  </SelectContent>
                </Select>
                {touched.frequency && validationErrors.frequency && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.frequency}
                  </p>
                )}
              </div>
            </div>

            {/* Step Navigation Helper */}
            {!canProceedToNextStep() && currentStep === 1 && (
              <Alert className="mb-4 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription>
                  <p className="font-semibold text-purple-900 dark:text-purple-200 mb-1">Required to continue:</p>
                  <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-300">
                    {effectiveness === null && <li>Effectiveness rating</li>}
                    {!timeToResults && <li>Time to results</li>}
                    {!startupCost && <li>Initial startup cost</li>}
                    {!ongoingCost && <li>Typical monthly cost</li>}
                    {!timeCommitment && <li>Time per session</li>}
                    {!frequency && <li>Frequency</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2: // Challenges
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h2 className="text-xl font-bold">Any challenges?</h2>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what obstacles to expect
              </p>
            </div>

            {/* Challenges grid with loading state */}
            {loadingChallenges ? (
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
                {challengeOptionsState.map((challenge) => (
                  <label
                    key={challenge}
                    className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                              transition-all transform hover:scale-[1.02] ${
                      challenges.includes(challenge)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={challenges.includes(challenge)}
                      onChange={() => handleChallengeToggle(challenge)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                  transition-all ${
                      challenges.includes(challenge)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }`}>
                      {challenges.includes(challenge) && (
                        <Check className="w-3 h-3 text-white animate-scale-in" />
                      )}
                    </div>
                    <span className="text-sm">{challenge}</span>
                  </label>
                ))}

                {/* Add Other button */}
                {!showCustomChallenge && (
                  <button
                    onClick={() => setShowCustomChallenge(true)}
                    className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                              transition-all transform hover:scale-[1.02] border-dashed
                              border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-lg"
                  >
                    <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600
                                  group-hover:border-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 group-hover:text-gray-700">+</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                      Add other challenge
                    </span>
                  </button>
                )}
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
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomChallenge(false);
                    setCustomChallenge('');
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Show custom challenges */}
            {challenges.filter(c => !challengeOptionsState.includes(c) && c !== 'None').length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
                <div className="flex flex-wrap gap-2">
                  {challenges.filter(c => !challengeOptionsState.includes(c) && c !== 'None').map((challenge) => (
                    <span key={challenge} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                                                 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      {challenge}
                      <button
                        onClick={() => setChallenges(challenges.filter(c => c !== challenge))}
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected count indicator */}
            {challenges.length > 0 && challenges[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                               text-purple-700 dark:text-purple-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {challenges.length} selected
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
              <h2 className="text-xl font-bold">What else did you try?</h2>
            </div>

            {/* Context card */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Help others by sharing what didn&apos;t work as well
              </p>
            </div>

            {/* New Failed Solutions Picker */}
            <FailedSolutionsPicker
              goalId={goalId}
              goalTitle={goalTitle}
              solutionName={solutionName}
              onSolutionsChange={setFailedSolutions}
              existingSolutions={failedSolutions}
            />

            {/* Skip hint */}
            {failedSolutions.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Nothing to add? Click Submit to finish →
              </p>
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
              <>Your experience has been added to {submissionResult.otherRatingsCount} {submissionResult.otherRatingsCount === 1 ? 'other' : 'others'} around the world</>
            ) : (
              <>Your experience has been recorded and will help people worldwide</>
            )}
          </p>

          {/* Optional fields */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Community or group name"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed"
              />
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit button - changes to "Saved" after successful submission */}
            <div className="text-center mt-4">
              <button
                onClick={updateAdditionalInfo}
                disabled={optionalFieldsSubmitted}
                className={`px-6 py-3 rounded-lg font-semibold transition-all button-focus-tight ${
                  optionalFieldsSubmitted
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {optionalFieldsSubmitted ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Saved
                  </span>
                ) : (
                  'Submit extra details'
                )}
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
          <div className="flex items-center justify-end mb-2">
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
    </div>
  );
}

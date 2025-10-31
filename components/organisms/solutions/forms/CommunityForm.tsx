'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Plus, X, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { Skeleton } from '@/components/atoms/skeleton';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS, TestModeCountdown, scrollToFirstError } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface CommunityFormProps {
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


export function CommunityForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId, // Used for pre-populating form if editing existing solution
  onBack
}: CommunityFormProps) {
  console.log('CommunityForm initialized with existingSolutionId:', existingSolutionId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('testMode') === 'true';
  const { triggerPoints } = usePointsAnimation();
  const isMounted = useRef(true);
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
  
  // Step 1 fields - Universal + Category-specific
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costRange, setCostRange] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('');
  const [format, setFormat] = useState('');
  const [groupSize, setGroupSize] = useState('');
  
  // Step 2 fields - Challenges array
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [commitmentType, setCommitmentType] = useState('');
  const [accessibilityLevel, setAccessibilityLevel] = useState('');
  const [leadershipStyle, setLeadershipStyle] = useState('');
  const [notes, setNotes] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const supabaseClient = createClientComponentClient();
  
  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Form backup data object
  const formBackupData = {
    effectiveness,
    timeToResults,
    costRange,
    paymentFrequency,
    meetingFrequency,
    format,
    groupSize,
    selectedChallenges,
    customChallenge,
    failedSolutions,
    commitmentType,
    accessibilityLevel,
    leadershipStyle,
    notes,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `community-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setEffectiveness(data.effectiveness || null);
        setTimeToResults(data.timeToResults || '');
        setCostRange(data.costRange || '');
        setPaymentFrequency(data.paymentFrequency || '');
        setMeetingFrequency(data.meetingFrequency || '');
        setFormat(data.format || '');
        setGroupSize(data.groupSize || '');
        setSelectedChallenges(data.selectedChallenges || ['None']);
        setCustomChallenge(data.customChallenge || '');
        setFailedSolutions(data.failedSolutions || []);
        setCommitmentType(data.commitmentType || '');
        setAccessibilityLevel(data.accessibilityLevel || '');
        setLeadershipStyle(data.leadershipStyle || '');
        setNotes(data.notes || '');
        setCurrentStep(data.currentStep || 1);
        setHighestStepReached(data.highestStepReached || 1);
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000);
      }
    }
  );
  
  // Get category display name
  const getCategoryDisplay = () => {
    return category === 'support_groups' ? 'Support Group' : 'Community/Group';
  };
  
  // Track component mount status
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
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
  
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from('challenge_options')
          .select('label')
          .eq('category', category)
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error(`[CommunityForm] Database error fetching challenges for ${category}:`, error);
          toast.error('Failed to load challenge options. Please refresh the page.');
          setChallengeOptions(['None']);
        } else if (!data || data.length === 0) {
          console.error(`[CommunityForm] No challenge options found for category: ${category}`);
          toast.error('Challenge options not configured. Please contact support.');
          setChallengeOptions(['None']);
        } else {
          setChallengeOptions(data.map(item => item.label));
        }
      } catch (err) {
        console.error(`[CommunityForm] Exception fetching challenges for ${category}:`, err);
        toast.error('Failed to load form options. Please refresh the page.');
        setChallengeOptions(['None']);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [category, supabaseClient]);
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setSelectedChallenges(['None']);
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
  
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        // Universal fields always required
        const universalValid = effectiveness !== null && timeToResults !== '';
        
        // Cost, meeting frequency, format, and group size are required
        const requiredValid = costRange !== '' && meetingFrequency !== '' && format !== '' && groupSize !== '';
        
        console.log('CommunityForm Step 1 validation:', {
          universalValid,
          requiredValid,
          costRange,
          meetingFrequency,
          format,
          groupSize
        });
        
        return universalValid && requiredValid;
        
      case 2:
        // Must select at least one challenge
        return selectedChallenges.length > 0;
        
      case 3:
        // Failed solutions are optional
        return true;
        
      default:
        return false;
    }
  };
  
  const handleSubmit = async () => {
    console.log('CommunityForm handleSubmit called with:', {
      effectiveness,
      timeToResults,
      costRange,
      meetingFrequency,
      format,
      groupSize,
      paymentFrequency,
      selectedChallenges
    });

    // Validate before submitting
    if (!canProceedToNextStep()) {
      touchAllRequiredFields();
      scrollToFirstError(validationErrors);
      toast.error('Please complete all required fields');
      return;
    }

    // Prevent re-submission if already submitting
    if (isSubmitting) {
      console.log('CommunityForm: Already submitting, ignoring duplicate call');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine cost type based on payment structure
      const costType = costRange === 'Free' ? 'free' : 
                       paymentFrequency === 'One-time' ? 'one_time' : 
                       'recurring';
      
      // Prepare solution fields for storage using conditional pattern (like DosageForm)
      // Only include fields that have actual values to avoid undefined
      const solutionFields: Record<string, unknown> = {};
      
      // Add cost fields
      if (costRange) {
        solutionFields.cost = costRange;
        solutionFields.cost_type = costType;
      }

      // Add other fields only if they have values
      if (meetingFrequency) solutionFields.meeting_frequency = meetingFrequency;
      if (format) solutionFields.format = format;
      if (groupSize) solutionFields.group_size = groupSize;

      // Add time_to_results field (REQUIRED by validator for support_groups)
      if (timeToResults) solutionFields.time_to_results = timeToResults;

      // Always include challenges field (required field)
      // "None" is a valid value meaning no challenges experienced
      if (selectedChallenges.length > 0) {
        solutionFields.challenges = selectedChallenges;
      }
      
      // Optional fields from success screen
      // REMOVED from initial submission - optional fields handled in success screen only
      
      // Prepare submission data with correct structure
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
      console.log('CommunityForm submission result:', result);
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) {
        console.log('CommunityForm: Component unmounted during submission, aborting state updates');
        return;
      }
      
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
        // Handle error
        console.error('Error submitting solution:', result.error);
        toast.error('Failed to submit solution', {
          description: result.error || 'Please try again or contact support if the problem persists.'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };
  
    const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
    const additionalFields: Record<string, unknown> = {};
    
    if (paymentFrequency && paymentFrequency.trim()) additionalFields.payment_frequency = paymentFrequency.trim();
    if (commitmentType && commitmentType.trim()) additionalFields.commitment_type = commitmentType.trim();
    if (accessibilityLevel && accessibilityLevel.trim()) additionalFields.accessibility_level = accessibilityLevel.trim();
    if (leadershipStyle && leadershipStyle.trim()) additionalFields.leadership_style = leadershipStyle.trim();
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
          description: 'Thank you for providing more details.'
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
  
  const addCustomChallenge = () => {
    if (customChallenge.trim()) {
      setSelectedChallenges(selectedChallenges.filter(c => c !== 'None').concat(customChallenge.trim()));
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
      case 'paymentFrequency':
        if (!value || value === '') {
          error = 'Please select payment type';
        }
        break;
      case 'costRange':
        // Only validate if payment frequency is set and not free
        if (paymentFrequency && paymentFrequency !== 'free' && (!value || value === '')) {
          error = 'Please select cost';
        }
        break;
      case 'meetingFrequency':
        if (!value || value === '') {
          error = 'Please select meeting frequency';
        }
        break;
      case 'format':
        if (!value || value === '') {
          error = 'Please select format';
        }
        break;
      case 'groupSize':
        if (!value || value === '') {
          error = 'Please select group size';
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
      case 1: // Community details
        // Mark as touched AND validate to generate errors
        markTouched('effectiveness');
        validateField('effectiveness', effectiveness);

        markTouched('timeToResults');
        validateField('timeToResults', timeToResults);

        markTouched('costRange');
        validateField('costRange', costRange);

        markTouched('meetingFrequency');
        validateField('meetingFrequency', meetingFrequency);

        markTouched('format');
        validateField('format', format);

        markTouched('groupSize');
        validateField('groupSize', groupSize);
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
      toast.error('Please complete all required fields', {
        description: 'Fill in the highlighted fields to continue'
      });
      return;
    }

    // Proceed to next step if validation passes
    setCurrentStep(currentStep + 1);
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: // Universal fields + Category-specific required fields
        return renderStepOne();
      case 2: // Challenges
        return renderStepTwo();
      case 3: // Failed solutions
        return renderStepThree();
      default:
        return <div>Invalid step</div>;
    }
  };
  
  const renderStepOne = () => {
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

        {/* Category-specific description */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {category === 'support_groups' ? (
              <>
                <strong>Support Groups:</strong> Therapeutic or emotional support focused groups (e.g., AA, grief support, chronic illness support)
              </>
            ) : (
              <>
                <strong>Groups/Communities:</strong> Activity or interest-based groups (e.g., book clubs, hiking groups, hobby meetups)
              </>
            )}
          </p>
        </div>

        {/* Effectiveness Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <h2 className="text-xl font-bold">How well it worked</h2>
          </div>
          
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
                      ? 'border-red-300 dark:border-red-700 hover:border-red-400'
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
              onValueChange={(value) => {
                setTimeToResults(value);
                validateField('timeToResults', value);
                markTouched('timeToResults');
              }}
            >
              <SelectTrigger className={`w-full px-4 py-3 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                        touched.timeToResults && validationErrors.timeToResults
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
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

        {/* Category-specific fields */}
        <div className="space-y-6">
          <FormSectionHeader 
            icon={CATEGORY_ICONS[category]} 
            title={`${getCategoryDisplay()} details`}
          />

          {/* Payment Frequency - Step 1 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Payment type <span className="text-red-500">*</span>
            </label>
            <Select
              value={paymentFrequency}
              onValueChange={(value) => {
                setPaymentFrequency(value);
                validateField('paymentFrequency', value);
                markTouched('paymentFrequency');
                setCostRange(''); // Reset cost when frequency changes
              }}
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        touched.paymentFrequency && validationErrors.paymentFrequency
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="How do you pay?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free or donation-based</SelectItem>
                <SelectItem value="per-meeting">Per meeting/session</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {touched.paymentFrequency && validationErrors.paymentFrequency && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.paymentFrequency}
              </p>
            )}
          </div>

          {/* Cost Range - Step 2 (conditional) */}
          {paymentFrequency && (
            <div className="space-y-2 animate-slide-in">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {paymentFrequency === 'free' ? 'Type' : 'Amount'} <span className="text-red-500">*</span>
              </label>
              <Select
                value={costRange}
                onValueChange={(value) => {
                  setCostRange(value);
                  validateField('costRange', value);
                  markTouched('costRange');
                }}
              >
                <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                          touched.costRange && validationErrors.costRange
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                  <SelectValue placeholder={paymentFrequency === 'free' ? 'Select type' : 'Select amount'} />
                </SelectTrigger>
                <SelectContent>
                  {paymentFrequency === 'free' && (
                    <>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Donation-based">Donation-based</SelectItem>
                    </>
                  )}
                  
                  {paymentFrequency === 'per-meeting' && (
                    <>
                      <SelectItem value="Under $10/meeting">Under $10/meeting</SelectItem>
                      <SelectItem value="$10-$19.99/meeting">$10-$19.99/meeting</SelectItem>
                      <SelectItem value="$20-$49.99/meeting">$20-$49.99/meeting</SelectItem>
                      <SelectItem value="$50-$99.99/meeting">$50-$99.99/meeting</SelectItem>
                      <SelectItem value="Over $100/meeting">Over $100/meeting</SelectItem>
                    </>
                  )}
                  
                  {paymentFrequency === 'monthly' && (
                    <>
                      <SelectItem value="Under $20/month">Under $20/month</SelectItem>
                      <SelectItem value="$20-$49.99/month">$20-$49.99/month</SelectItem>
                      <SelectItem value="$50-$99.99/month">$50-$99.99/month</SelectItem>
                      <SelectItem value="$100-$199.99/month">$100-$199.99/month</SelectItem>
                      <SelectItem value="$200-$499.99/month">$200-$499.99/month</SelectItem>
                      <SelectItem value="Over $500/month">Over $500/month</SelectItem>
                    </>
                  )}
                  
                  {paymentFrequency === 'yearly' && (
                    <>
                      <SelectItem value="Under $50/year">Under $50/year</SelectItem>
                      <SelectItem value="$50-$99.99/year">$50-$99.99/year</SelectItem>
                      <SelectItem value="$100-$249.99/year">$100-$249.99/year</SelectItem>
                      <SelectItem value="$250-$499.99/year">$250-$499.99/year</SelectItem>
                      <SelectItem value="$500+/year">$500+/year</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {touched.costRange && validationErrors.costRange && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.costRange}
                </p>
              )}
            </div>
          )}

          {/* Meeting frequency */}
          <div>
            <label htmlFor="meeting_frequency" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Meeting frequency <span className="text-red-500">*</span>
            </label>
            <Select
              value={meetingFrequency}
              onValueChange={(value) => {
                setMeetingFrequency(value);
                validateField('meetingFrequency', value);
                markTouched('meetingFrequency');
              }}
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        touched.meetingFrequency && validationErrors.meetingFrequency
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Several times per week">Several times per week</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="As needed">As needed</SelectItem>
                <SelectItem value="Special events only">Special events only</SelectItem>
              </SelectContent>
            </Select>
            {touched.meetingFrequency && validationErrors.meetingFrequency && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.meetingFrequency}
              </p>
            )}
          </div>

          {/* Format */}
          <div>
            <label htmlFor="format" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Format <span className="text-red-500">*</span>
            </label>
            <Select
              value={format}
              onValueChange={(value) => {
                setFormat(value);
                validateField('format', value);
                markTouched('format');
              }}
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        touched.format && validationErrors.format
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="Meeting format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-person only">In-person only</SelectItem>
                <SelectItem value="Online only">Online only</SelectItem>
                <SelectItem value="Hybrid (both)">Hybrid (both)</SelectItem>
                <SelectItem value="Phone/Conference call">Phone/Conference call</SelectItem>
              </SelectContent>
            </Select>
            {touched.format && validationErrors.format && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.format}
              </p>
            )}
          </div>

          {/* Group size */}
          <div>
            <label htmlFor="group_size" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Group size <span className="text-red-500">*</span>
            </label>
            <Select
              value={groupSize}
              onValueChange={(value) => {
                setGroupSize(value);
                validateField('groupSize', value);
                markTouched('groupSize');
              }}
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        touched.groupSize && validationErrors.groupSize
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="How many people?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small (under 10 people)">Small (under 10 people)</SelectItem>
                <SelectItem value="Medium (10-20 people)">Medium (10-20 people)</SelectItem>
                <SelectItem value="Large (20-50 people)">Large (20-50 people)</SelectItem>
                <SelectItem value="Very large (50+ people)">Very large (50+ people)</SelectItem>
                <SelectItem value="Varies significantly">Varies significantly</SelectItem>
                <SelectItem value="One-on-one">One-on-one</SelectItem>
              </SelectContent>
            </Select>
            {touched.groupSize && validationErrors.groupSize && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.groupSize}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderStepTwo = () => {
    if (loading) {
      return (
        <div className="space-y-6 animate-slide-in">
          <ProgressCelebration step={currentStep} />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      );
    }
    
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
            💡 This helps others know what to expect
          </p>
        </div>

        {/* Challenges grid */}
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
          
          {/* Add Other button */}
          <button
            onClick={() => setShowCustomChallenge(true)}
            className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                      transition-all transform hover:scale-[1.02] border-dashed
                      border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors button-focus-tight" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
              Add other challenge
            </span>
          </button>
        </div>

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
        {selectedChallenges.filter(c => !challengeOptions.includes(c) && c !== 'None').length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
            <div className="flex flex-wrap gap-2">
              {selectedChallenges.filter(c => !challengeOptions.includes(c) && c !== 'None').map((challenge) => (
                <span key={challenge} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                                             text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  {challenge}
                  <button
                    onClick={() => setSelectedChallenges(selectedChallenges.filter(c => c !== challenge))}
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selected count indicator */}
        {selectedChallenges.length > 0 && selectedChallenges[0] !== 'None' && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                           text-purple-700 dark:text-purple-300 rounded-full text-sm animate-fade-in">
              <Check className="w-4 h-4" />
              {selectedChallenges.length} selected
            </span>
          </div>
        )}
      </div>
    );
  };
  
  const renderStepThree = () => {
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

        {/* Failed Solutions Picker */}
        <FailedSolutionsPicker
          goalId={goalId}
          goalTitle={goalTitle}
          solutionName={solutionName}
          onSolutionsChange={setFailedSolutions}
          existingSolutions={failedSolutions}
        />

        {/* Skip hint */}
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
              <select
                value={commitmentType}
                onChange={(e) => setCommitmentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm"
              >
                <option value="">Commitment type</option>
                <option value="Drop-in anytime">Drop-in anytime</option>
                <option value="Regular attendance expected">Regular attendance expected</option>
                <option value="Course/Program">Course/Program (fixed duration)</option>
                <option value="Ongoing open group">Ongoing open group</option>
              </select>
              
              <select
                value={accessibilityLevel}
                onChange={(e) => setAccessibilityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm"
              >
                <option value="">{category === 'groups_communities' ? 'Beginner friendly?' : 'Newcomer welcoming?'}</option>
                <option value="Very welcoming">Very welcoming</option>
                <option value="Welcoming">Welcoming</option>
                <option value="Neutral">Neutral</option>
                <option value="Some experience helpful">Some experience helpful</option>
                <option value="Experience required">Experience required</option>
              </select>
              
              {category === 'support_groups' && (
                <select
                  value={leadershipStyle}
                  onChange={(e) => setLeadershipStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm"
                >
                  <option value="">Leadership style</option>
                  <option value="Peer-led">Peer-led</option>
                  <option value="Professional facilitator">Professional facilitator</option>
                  <option value="Rotating leadership">Rotating leadership</option>
                  <option value="Mixed leadership">Mixed leadership</option>
                  <option value="Self-organizing">Self-organizing</option>
                </select>
              )}
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm"
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

      {/* Step Navigation Helper Alert - Outside unified container */}
      {!canProceedToNextStep() && currentStep === 1 && (
        <Alert className="mt-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
          <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription>
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Required to continue:</p>
            <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200 space-y-0.5">
              {!effectiveness && <li>Effectiveness rating</li>}
              {!timeToResults && <li>Time to results</li>}
              {!paymentFrequency && <li>Payment type</li>}
              {paymentFrequency && paymentFrequency !== 'free' && !costRange && <li>Cost amount</li>}
              {!meetingFrequency && <li>Meeting frequency</li>}
              {!format && <li>Format</li>}
              {!groupSize && <li>Group size</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

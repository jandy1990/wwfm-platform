'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Plus, AlertCircle, Info } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS, TestModeCountdown, scrollToFirstError } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Skeleton } from '@/components/atoms/skeleton';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface PurchaseFormProps {
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


const BASE_ALLOWED_FIELDS = [
  'cost',
  'cost_type',
  'purchase_cost_type',
  'cost_range',
  'time_to_results',
  'challenges'
] as const;

const CATEGORY_FIELD_ALLOWLIST: Record<string, readonly string[]> = {
  products_devices: [...BASE_ALLOWED_FIELDS, 'product_type', 'ease_of_use'],
  books_courses: [...BASE_ALLOWED_FIELDS, 'format', 'learning_difficulty']
};

export function PurchaseForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId, // Used for pre-populating form if editing existing solution
  onBack
}: PurchaseFormProps) {
  console.log('PurchaseForm initialized with existingSolutionId:', existingSolutionId);
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
  
  // Step 1 fields - Universal + Category-specific
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costType, setCostType] = useState<'one_time' | 'subscription' | ''>('');
  const [costRange, setCostRange] = useState('');
  const [productType, setProductType] = useState('');
  const [easeOfUse, setEaseOfUse] = useState('');
  const [format, setFormat] = useState('');
  const [learningDifficulty, setLearningDifficulty] = useState('');
  
  // Step 2 fields - Challenges array
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);

  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [brand, setBrand] = useState('');
  const [completionStatus, setCompletionStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Track if optional fields have been submitted
  const [optionalFieldsSubmitted, setOptionalFieldsSubmitted] = useState(false);

  const supabaseClient = createClientComponentClient();
  
  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Form backup data object
  const formBackupData = {
    effectiveness,
    timeToResults,
    costType,
    costRange,
    productType,
    easeOfUse,
    format,
    learningDifficulty,
    selectedChallenges,
    customChallenge,
    failedSolutions,
    brand,
    completionStatus,
    notes,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `purchase-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setEffectiveness(data.effectiveness || null);
        setTimeToResults(data.timeToResults || '');
        setCostType(data.costType || '');
        setCostRange(data.costRange || '');
        setProductType(data.productType || '');
        setEaseOfUse(data.easeOfUse || '');
        setFormat(data.format || '');
        setLearningDifficulty(data.learningDifficulty || '');
        setSelectedChallenges(data.selectedChallenges || ['None']);
        setCustomChallenge(data.customChallenge || '');
        setFailedSolutions(data.failedSolutions || []);
        setBrand(data.brand || '');
        setCompletionStatus(data.completionStatus || '');
        setNotes(data.notes || '');
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
          console.error(`[PurchaseForm] Database error fetching challenges for ${category}:`, error);
          toast.error('Failed to load challenge options. Please refresh the page.');
          setChallengeOptions(['None']);
        } else if (!data || data.length === 0) {
          console.error(`[PurchaseForm] No challenge options found for category: ${category}`);
          toast.error('Challenge options not configured. Please contact support.');
          setChallengeOptions(['None']);
        } else {
          setChallengeOptions(data.map(item => item.label));
        }
      } catch (err) {
        console.error(`[PurchaseForm] Exception fetching challenges for ${category}:`, err);
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
      case 'costType':
        if (!value || value === '') {
          error = 'Please select cost type';
        }
        break;
      case 'costRange':
        if (!value || value === '') {
          error = 'Please select cost range';
        }
        break;
      case 'productType':
        if (category === 'products_devices' && (!value || value === '')) {
          error = 'Please select product type';
        }
        break;
      case 'easeOfUse':
        if (category === 'products_devices' && (!value || value === '')) {
          error = 'Please select ease of use';
        }
        break;
      case 'format':
        if (category === 'books_courses' && (!value || value === '')) {
          error = 'Please select format';
        }
        break;
      case 'learningDifficulty':
        if (category === 'books_courses' && (!value || value === '')) {
          error = 'Please select learning difficulty';
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
      case 1: // Step 1 validation
        // Universal fields
        markTouched('effectiveness');
        validateField('effectiveness', effectiveness);

        markTouched('timeToResults');
        validateField('timeToResults', timeToResults);

        markTouched('costType');
        validateField('costType', costType);

        markTouched('costRange');
        validateField('costRange', costRange);

        // Category-specific fields
        if (category === 'products_devices') {
          markTouched('productType');
          validateField('productType', productType);

          markTouched('easeOfUse');
          validateField('easeOfUse', easeOfUse);
        } else if (category === 'books_courses') {
          markTouched('format');
          validateField('format', format);

          markTouched('learningDifficulty');
          validateField('learningDifficulty', learningDifficulty);
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
      case 1:
        // Universal fields always required
        const universalValid = effectiveness !== null && timeToResults !== '';
        
        // Cost always required
        const costValid = costRange !== '' && costType !== '';
        
        // Category-specific required fields
        let categorySpecificValid = true;
        
        if (category === 'products_devices') {
          categorySpecificValid = easeOfUse !== '' && productType !== '';
        } else if (category === 'books_courses') {
          categorySpecificValid = learningDifficulty !== '' && format !== '';
        }
        
        return universalValid && costValid && categorySpecificValid;
        
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
    // Validate before submission
    if (!canProceedToNextStep()) {
      touchAllRequiredFields();
      scrollToFirstError(validationErrors);
      toast.error('Please fill all required fields before submitting');
      return;
    }

    console.log('[PurchaseForm] handleSubmit called');
    setIsSubmitting(true);
    console.log('[PurchaseForm] State set to submitting');

    try {
      // Determine primary cost and cost_type
      const hasUnknownCost = costRange === "Don't remember";
      const primaryCost = hasUnknownCost ? "Unknown" :
                          costRange === "Free" ? "Free" :
                          costRange;
      const derivedCostType = hasUnknownCost ? "unknown" :
                              costRange === "Free" ? "free" :
                              costType === "one_time" ? "one_time" :
                              "recurring"; // subscription

      // Prepare solution fields for storage
      const solutionFields: Record<string, unknown> = {
        // Cost fields
        cost: primaryCost,
        cost_type: derivedCostType,
        purchase_cost_type: costType, // Preserve original choice (one_time or subscription)
        cost_range: costRange,

        // Category-specific fields
        ...(category === 'products_devices' && {
          product_type: productType,
          ease_of_use: easeOfUse
        }),
        ...(category === 'books_courses' && {
          format,
          learning_difficulty: learningDifficulty
        }),

        // Array field (challenges for both categories) - "None" is a valid value
        challenges: selectedChallenges,

        // REMOVED from initial submission - optional fields handled in success screen only
      };

      if (timeToResults) {
        solutionFields.time_to_results = timeToResults;
      }

      const allowedFields = CATEGORY_FIELD_ALLOWLIST[category] || BASE_ALLOWED_FIELDS;
      const filteredSolutionFields = Object.fromEntries(
        Object.entries(solutionFields).filter(([key]) => allowedFields.includes(key))
      );

      // Prepare submission data with correct structure
      const submissionData: SubmitSolutionData = {
        goalId,
        userId,
        solutionName,
        category,
        existingSolutionId,
        effectiveness: effectiveness!,
        timeToResults,
        solutionFields: filteredSolutionFields,
        failedSolutions
      };

      console.log('[PurchaseForm] Calling submitSolution with:', submissionData);
      const submitStart = Date.now();
      // Call server action
      const result = await submitSolution(submissionData);
      console.log(`[PurchaseForm] submitSolution completed in ${Date.now() - submitStart}ms`);
      console.log('[PurchaseForm] Result:', result);

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
        console.error('[PurchaseForm] Error submitting solution:', result.error);
        toast.error('Failed to submit solution', {
          description: result.error || 'Please try again or contact support if the problem persists.'
        });
      }
    } catch (error) {
      console.error('[PurchaseForm] Error submitting form:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      console.log('[PurchaseForm] Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };
  
    const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
    const additionalFields: Record<string, unknown> = {};
    
    if (brand && brand.trim()) additionalFields.brand = brand.trim();
    if (completionStatus && completionStatus.trim()) additionalFields.completion_status = completionStatus.trim();
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
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: // Universal fields + Category-specific required fields
        return renderStepOne();
      case 2: // Issues
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
            icon={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default}
            title="Purchase details"
          />

          {/* Cost field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cost <span className="text-red-500">*</span>
            </label>
            <RadioGroup
              value={costType}
              onValueChange={(value) => {
                setCostType(value as 'one_time' | 'subscription');
                validateField('costType', value);
                markTouched('costType');
              }}
            >
              <div className="flex gap-4">
                <div className="flex items-center">
                  <RadioGroupItem value="one_time" id="one_time_purchase" />
                  <label htmlFor="one_time_purchase" className="ml-2">One-time purchase</label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="subscription" id="subscription" />
                  <label htmlFor="subscription" className="ml-2">
                    {category === 'products_devices' ? 'Ongoing costs' : 'Subscription'}
                  </label>
                </div>
              </div>
            </RadioGroup>
            {touched.costType && validationErrors.costType && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.costType}
              </p>
            )}

            <Select
              value={costRange}
              onValueChange={(value) => {
                setCostRange(value);
                validateField('costRange', value);
                markTouched('costRange');
              }}
              required
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                        touched.costRange && validationErrors.costRange
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="Select cost range" />
              </SelectTrigger>
              <SelectContent>
                {costType === 'one_time' ? (
                  <>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Under $20">Under $20</SelectItem>
                    <SelectItem value="$20-50">$20-50</SelectItem>
                    <SelectItem value="$50-100">$50-100</SelectItem>
                    <SelectItem value="$100-250">$100-250</SelectItem>
                    <SelectItem value="$250-500">$250-500</SelectItem>
                    <SelectItem value="$500-1000">$500-1000</SelectItem>
                    <SelectItem value="Over $1000">Over $1000</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Under $10/month">Under $10/month</SelectItem>
                    <SelectItem value="$10-25/month">$10-25/month</SelectItem>
                    <SelectItem value="$25-50/month">$25-50/month</SelectItem>
                    <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                    <SelectItem value="Over $100/month">Over $100/month</SelectItem>
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

          {/* Product type/Format */}
          <div>
            <label htmlFor="product_type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {category === 'products_devices' ? 'Product type' : 'Format'}
              <span className="text-red-500"> *</span>
            </label>
            <Select
              value={category === 'products_devices' ? productType : format}
              onValueChange={(value) => {
                if (category === 'products_devices') {
                  setProductType(value);
                  validateField('productType', value);
                  markTouched('productType');
                } else {
                  setFormat(value);
                  validateField('format', value);
                  markTouched('format');
                }
              }}
              required
            >
              <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                        ((category === 'products_devices' && touched.productType && validationErrors.productType) ||
                         (category === 'books_courses' && touched.format && validationErrors.format))
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {category === 'products_devices' ? (
                  <>
                    <SelectItem value="Physical device">Physical device</SelectItem>
                    <SelectItem value="Mobile app">Mobile app</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Wearable">Wearable</SelectItem>
                    <SelectItem value="Subscription service">Subscription service</SelectItem>
                    <SelectItem value="Other">Other (please describe)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Physical book">Physical book</SelectItem>
                    <SelectItem value="E-book">E-book</SelectItem>
                    <SelectItem value="Audiobook">Audiobook</SelectItem>
                    <SelectItem value="Online course">Online course</SelectItem>
                    <SelectItem value="Video series">Video series</SelectItem>
                    <SelectItem value="Workbook/PDF">Workbook/PDF</SelectItem>
                    <SelectItem value="App-based">App-based</SelectItem>
                    <SelectItem value="Other">Other (please describe)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {category === 'products_devices' && touched.productType && validationErrors.productType && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.productType}
              </p>
            )}
            {category === 'books_courses' && touched.format && validationErrors.format && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.format}
              </p>
            )}
          </div>

          {/* Category-specific required fields */}
          {category === 'products_devices' && (
            <div>
              <label htmlFor="ease_of_use" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ease of use <span className="text-red-500">*</span>
              </label>
              <Select
                value={easeOfUse}
                onValueChange={(value) => {
                  setEaseOfUse(value);
                  validateField('easeOfUse', value);
                  markTouched('easeOfUse');
                }}
                required
              >
                <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                          touched.easeOfUse && validationErrors.easeOfUse
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                  <SelectValue placeholder="How easy to use?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Very easy to use">Very easy to use</SelectItem>
                  <SelectItem value="Easy to use">Easy to use</SelectItem>
                  <SelectItem value="Moderate learning curve">Moderate learning curve</SelectItem>
                  <SelectItem value="Difficult to use">Difficult to use</SelectItem>
                  <SelectItem value="Very difficult to use">Very difficult to use</SelectItem>
                </SelectContent>
              </Select>
              {touched.easeOfUse && validationErrors.easeOfUse && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.easeOfUse}
                </p>
              )}
            </div>
          )}

          {category === 'books_courses' && (
            <div>
              <label htmlFor="learning_difficulty" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Learning difficulty <span className="text-red-500">*</span>
              </label>
              <Select
                value={learningDifficulty}
                onValueChange={(value) => {
                  setLearningDifficulty(value);
                  validateField('learningDifficulty', value);
                  markTouched('learningDifficulty');
                }}
                required
              >
                <SelectTrigger className={`w-full px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all ${
                          touched.learningDifficulty && validationErrors.learningDifficulty
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                  <SelectValue placeholder="How challenging?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner friendly">Beginner friendly</SelectItem>
                  <SelectItem value="Some experience helpful">Some experience helpful</SelectItem>
                  <SelectItem value="Intermediate level">Intermediate level</SelectItem>
                  <SelectItem value="Advanced level">Advanced level</SelectItem>
                  <SelectItem value="Expert level">Expert level</SelectItem>
                </SelectContent>
              </Select>
              {touched.learningDifficulty && validationErrors.learningDifficulty && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.learningDifficulty}
                </p>
              )}
            </div>
          )}
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

        {/* Issues grid */}
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

        {/* Add other button */}
        {!showCustomChallenge && (
          <button
            type="button"
            onClick={() => setShowCustomChallenge(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400
                     hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors button-focus-tight"
          >
            <Plus className="w-4 h-4" />
            Add other
          </button>
        )}

        {/* Custom challenge input */}
        {showCustomChallenge && (
          <div className="flex gap-2 animate-slide-in">
            <input
              type="text"
              value={customChallenge}
              onChange={(e) => setCustomChallenge(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomChallenge()}
              placeholder="Enter challenge..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              type="button"
              onClick={addCustomChallenge}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
                       transition-colors text-sm font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomChallenge(false);
                setCustomChallenge('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Custom challenges display */}
        {selectedChallenges.filter(c => !challengeOptions.includes(c)).length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {selectedChallenges
              .filter(c => !challengeOptions.includes(c))
              .map((challenge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30
                           text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {challenge}
                  <button
                    type="button"
                    onClick={() => setSelectedChallenges(selectedChallenges.filter(c => c !== challenge))}
                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
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
              <>Your experience has been recorded and will help people worldwide</>
            )}
          </p>

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Brand/Manufacturer"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed"
              />
              
              
              {category === 'books_courses' && (
                <select
                  value={completionStatus}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                  disabled={optionalFieldsSubmitted}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm
                           disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Completion status</option>
                  <option value="Completed fully">Completed fully</option>
                  <option value="Completed partially">Completed partially</option>
                  <option value="Still in progress">Still in progress</option>
                  <option value="Abandoned">Abandoned</option>
                </select>
              )}
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
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
                  onClick={() => {
                    console.log('[PurchaseForm] Submit button CLICKED');
                    console.log('[PurchaseForm] isSubmitting:', isSubmitting);
                    console.log('[PurchaseForm] canProceed:', canProceedToNextStep());
                    handleSubmit();
                  }}
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
              {!costType && <li>Cost type (one-time or subscription)</li>}
              {!costRange && <li>Cost range</li>}
              {category === 'products_devices' && !productType && <li>Product type</li>}
              {category === 'products_devices' && !easeOfUse && <li>Ease of use</li>}
              {category === 'books_courses' && !format && <li>Format</li>}
              {category === 'books_courses' && !learningDifficulty && <li>Learning difficulty</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

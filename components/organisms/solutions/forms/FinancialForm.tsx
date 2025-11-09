'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, AlertCircle, Info, ChevronLeft, Plus, X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS, TestModeCountdown, scrollToFirstError, CategorySwitcher } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { toast } from 'sonner';

interface FinancialFormProps {
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


export function FinancialForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: FinancialFormProps) {
  console.log('FinancialForm initialized with solution:', existingSolutionId || 'new', 'category:', category);
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
  
  // Step 1 fields - Required fields + effectiveness + TTR
  const [costType, setCostType] = useState('');
  const [financialBenefit, setFinancialBenefit] = useState('');
  const [accessTime, setAccessTime] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToImpact, setTimeToImpact] = useState('');

  // Step 2 fields - Challenges
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [loading, setLoading] = useState(true);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [productType, setProductType] = useState('');
  const [easeOfUse, setEaseOfUse] = useState('');
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
    costType,
    financialBenefit,
    accessTime,
    effectiveness,
    timeToImpact,
    selectedChallenges,
    customChallenge,
    failedSolutions,
    productType,
    easeOfUse,
    notes,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `financial-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setCostType(data.costType || '');
        setFinancialBenefit(data.financialBenefit || '');
        setAccessTime(data.accessTime || '');
        setEffectiveness(data.effectiveness || null);
        setTimeToImpact(data.timeToImpact || '');
        setSelectedChallenges(data.selectedChallenges || ['None']);
        setCustomChallenge(data.customChallenge || '');
        setFailedSolutions(data.failedSolutions || []);
        setProductType(data.productType || '');
        setEaseOfUse(data.easeOfUse || '');
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

  // Load challenge options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Initialize Supabase client
        const supabaseClient = createClientComponentClient();

        const { data, error } = await supabaseClient
          .from('challenge_options')
          .select('label')
          .eq('category', 'financial_products')
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error('[FinancialForm] Database error fetching challenges:', error);
          toast.error('Failed to load challenge options. Please refresh the page.');
          setChallengeOptions(['None']);
        } else if (!data || data.length === 0) {
          console.error('[FinancialForm] No challenge options found for category: financial_products');
          toast.error('Challenge options not configured. Please contact support.');
          setChallengeOptions(['None']);
        } else {
          setChallengeOptions(data.map((item: { label: string }) => item.label));
        }
      } catch (err) {
        console.error('[FinancialForm] Exception fetching challenge options:', err);
        toast.error('Failed to load form options. Please refresh the page.');
        setChallengeOptions(['None']);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setSelectedChallenges(['None']);
      setShowCustomChallenge(false);
    } else if (challenge === 'Other') {
      setShowCustomChallenge(!showCustomChallenge);
      if (!showCustomChallenge) {
        setSelectedChallenges(prev => [...prev.filter(c => c !== 'None'), 'Other']);
      } else {
        setSelectedChallenges(prev => {
          const newChallenges = prev.filter(c => c !== 'Other');
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

  const validateField = (fieldName: string, value: any) => {
    let error = '';
    switch (fieldName) {
      case 'effectiveness':
        if (value === null || value === '') {
          error = 'Please rate the effectiveness';
        }
        break;
      case 'costType':
        if (!value || value === '') {
          error = 'Please select cost type';
        }
        break;
      case 'financialBenefit':
        if (!value || value === '') {
          error = 'Please select financial benefit';
        }
        break;
      case 'accessTime':
        if (!value || value === '') {
          error = 'Please select access time';
        }
        break;
      case 'timeToImpact':
        if (!value || value === '') {
          error = 'Please select time to impact';
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

  const markTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Touch all required fields for current step (to show validation errors)
  const touchAllRequiredFields = () => {
    switch (currentStep) {
      case 1: // Required fields + effectiveness + TTR
        // Mark as touched AND validate to generate errors
        markTouched('effectiveness');
        validateField('effectiveness', effectiveness);

        markTouched('costType');
        validateField('costType', costType);

        markTouched('financialBenefit');
        validateField('financialBenefit', financialBenefit);

        markTouched('accessTime');
        validateField('accessTime', accessTime);

        markTouched('timeToImpact');
        validateField('timeToImpact', timeToImpact);
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
      case 1: // Required fields + effectiveness + TTR
        return costType !== '' && 
               financialBenefit !== '' && 
               accessTime !== '' && 
               effectiveness !== null && 
               timeToImpact !== '';
        
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

    console.log('[FinancialForm] handleSubmit called');
    setIsSubmitting(true);
    console.log('[FinancialForm] State set to submitting');

    try {
      // Prepare solution fields for storage
      const solutionFields: Record<string, unknown> = {
        // Required fields for financial products
        cost_type: costType,
        financial_benefit: financialBenefit,
        access_time: accessTime,
        time_to_results: timeToImpact,

        // Array field (challenges) - required field, "None" is valid
        // Filter out "Other" since it triggers custom input
        challenges: selectedChallenges.filter(c => c !== 'Other'),

        // REMOVED from initial submission - optional fields handled in success screen only
      };

      // Prepare submission data with correct structure
      const submissionData: SubmitSolutionData = {
        goalId,
        userId,
        solutionName,
        category,
        existingSolutionId,
        effectiveness: effectiveness!,
        timeToResults: timeToImpact,
        solutionFields,
        failedSolutions
      };

      console.log('[FinancialForm] Calling submitSolution with:', submissionData);
      const submitStart = Date.now();

      // Call server action with timeout
      const result = await submitSolution(submissionData);

      console.log(`[FinancialForm] submitSolution completed in ${Date.now() - submitStart}ms`);
      console.log('[FinancialForm] Result:', result);
      
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
        console.error('[FinancialForm] Submission failed:', result.error);
        toast.error('Unable to submit', {
          description: result.error || 'Please check your entries and try again.',
          duration: 6000, // 6 seconds for better visibility
        });
      }
    } catch (error) {
      console.error('[FinancialForm] Exception during submission:', error);
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

    if (productType && productType.trim()) additionalFields.product_type = productType.trim();
    if (easeOfUse && easeOfUse.trim()) additionalFields.ease_of_use = easeOfUse.trim();
    if (notes && notes.trim()) additionalFields.notes = notes.trim();

    // Only proceed if there are fields to update
    if (Object.keys(additionalFields).length === 0) {
      console.log('[FinancialForm] No additional fields to update');
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
      } else{
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
      case 1: // Required fields + Effectiveness + TTR
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
        
        {/* Category Switcher */}
        <CategorySwitcher
          category={category}
          solutionName={solutionName}
          goalTitle={goalTitle}
          onCategoryChange={onCategoryChange}
        />

            {/* Required fields section */}
            <div className="space-y-6">
              <FormSectionHeader
                icon={CATEGORY_ICONS.financial_products}
                title="Product details"
              />
              
              {/* Cost Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cost type <span className="text-red-500">*</span>
                </label>
                <Select value={costType} onValueChange={(val) => {
                  setCostType(val);
                  validateField('costType', val);
                  markTouched('costType');
                }}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           transition-all ${
                             touched.costType && validationErrors.costType
                               ? 'border-red-500'
                               : 'border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free to use">Free to use</SelectItem>
                    <SelectItem value="Subscription fee">Subscription fee</SelectItem>
                    <SelectItem value="Transaction/usage fees">Transaction/usage fees</SelectItem>
                    <SelectItem value="Interest charged (loans/credit)">Interest charged (loans/credit)</SelectItem>
                    <SelectItem value="Account maintenance fees">Account maintenance fees</SelectItem>
                    <SelectItem value="One-time purchase/setup fee">One-time purchase/setup fee</SelectItem>
                  </SelectContent>
                </Select>
                {touched.costType && validationErrors.costType && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.costType}
                  </p>
                )}
              </div>

              {/* Financial Benefit */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Financial benefit? <span className="text-red-500">*</span>
                </label>
                <Select value={financialBenefit} onValueChange={(val) => {
                  setFinancialBenefit(val);
                  validateField('financialBenefit', val);
                  markTouched('financialBenefit');
                }}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           transition-all ${
                             touched.financialBenefit && validationErrors.financialBenefit
                               ? 'border-red-500'
                               : 'border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select savings or earnings..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No direct financial benefit">No direct financial benefit</SelectItem>
                    <SelectItem value="Under $25/month saved/earned">Under $25/month saved/earned</SelectItem>
                    <SelectItem value="$25-100/month saved/earned">$25-100/month saved/earned</SelectItem>
                    <SelectItem value="$100-250/month saved/earned">$100-250/month saved/earned</SelectItem>
                    <SelectItem value="$250-500/month saved/earned">$250-500/month saved/earned</SelectItem>
                    <SelectItem value="$500-1000/month saved/earned">$500-1000/month saved/earned</SelectItem>
                    <SelectItem value="Over $1000/month saved/earned">Over $1000/month saved/earned</SelectItem>
                    <SelectItem value="Varies significantly">Varies significantly (explain in notes)</SelectItem>
                  </SelectContent>
                </Select>
                {touched.financialBenefit && validationErrors.financialBenefit && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.financialBenefit}
                  </p>
                )}
              </div>

              {/* Access time */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Access time <span className="text-red-500">*</span>
                </label>
                <Select value={accessTime} onValueChange={(val) => {
                  setAccessTime(val);
                  validateField('accessTime', val);
                  markTouched('accessTime');
                }}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           transition-all ${
                             touched.accessTime && validationErrors.accessTime
                               ? 'border-red-500'
                               : 'border-gray-300 dark:border-gray-600'
                           }`}>
                    <SelectValue placeholder="Select access time..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instant approval">Instant approval</SelectItem>
                    <SelectItem value="Same day">Same day</SelectItem>
                    <SelectItem value="1-3 business days">1-3 business days</SelectItem>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                    <SelectItem value="Over a month">Over a month</SelectItem>
                  </SelectContent>
                </Select>
                {touched.accessTime && validationErrors.accessTime && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.accessTime}
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
                        touched.effectiveness && validationErrors.effectiveness
                          ? 'border-red-500'
                          : effectiveness === rating
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105 shadow-lg'
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
                <Select value={timeToImpact} onValueChange={(val) => {
                  setTimeToImpact(val);
                  validateField('timeToImpact', val);
                  markTouched('timeToImpact');
                }}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           transition-all ${
                             touched.timeToImpact && validationErrors.timeToImpact
                               ? 'border-red-500'
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
                {touched.timeToImpact && validationErrors.timeToImpact && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.timeToImpact}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Challenges only
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <FormSectionHeader 
              icon="🚧"
              title="Any challenges?"
              bgColorClassName="bg-amber-100 dark:bg-amber-900"
            />

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 Help others by sharing what challenges you faced
              </p>
            </div>

            {/* Challenges grid */}
            {loading ? (
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
                    setSelectedChallenges(prev => prev.filter(c => c !== 'Other'));
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
                !challengeOptions.includes(c) && c !== 'None' && c !== 'Other'
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
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
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
                  {selectedChallenges.filter(c => c !== 'Other').length} selected
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
              icon="🔄"
              title="What else did you try?"
              bgColorClassName="bg-purple-100 dark:bg-purple-900"
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
              <>Your experience has been recorded and will help people worldwide</>
            )}
          </p>

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Product type</option>
                <option value="Savings account">Savings account</option>
                <option value="Checking account">Checking account</option>
                <option value="Credit card">Credit card</option>
                <option value="Budgeting app">Budgeting app</option>
                <option value="Investment platform">Investment platform</option>
                <option value="Debt management">Debt management</option>
                <option value="Insurance product">Insurance product</option>
                <option value="Loan">Loan</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={easeOfUse}
                onChange={(e) => setEaseOfUse(e.target.value)}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm
                         disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Ease of use</option>
                <option value="Very easy to use">Very easy to use</option>
                <option value="Easy to use">Easy to use</option>
                <option value="Moderate learning curve">Moderate learning curve</option>
                <option value="Difficult to use">Difficult to use</option>
                <option value="Very difficult to use">Very difficult to use</option>
              </select>

              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                disabled={optionalFieldsSubmitted}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm
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
                  onClick={() => {
                    console.log('[FinancialForm] Submit button CLICKED');
                    console.log('[FinancialForm] isSubmitting:', isSubmitting);
                    console.log('[FinancialForm] canProceed:', canProceedToNextStep());
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

      {/* Step Navigation Helper - Outside unified container */}
      {!canProceedToNextStep() && currentStep === 1 && (
        <Alert className="mt-4 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Required to continue:</p>
            <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200">
              {effectiveness === null && <li>Effectiveness rating</li>}
              {!costType && <li>Cost type</li>}
              {!financialBenefit && <li>Financial benefit</li>}
              {!accessTime && <li>Access time</li>}
              {!timeToImpact && <li>Time to impact</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

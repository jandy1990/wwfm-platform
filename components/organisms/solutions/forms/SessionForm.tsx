  'use client';
// SessionForm - handles session-based solution categories
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
// RadioGroup removed - using standard HTML radio inputs for better test compatibility
import { COST_RANGES } from '@/lib/forms/templates';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS ,  TestModeCountdown, scrollToFirstError } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { toast } from 'sonner';

interface SessionFormProps {
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

interface LabelRow {
  label: string;
}


export function SessionForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: SessionFormProps) {
  // existingSolutionId will be used when updating existing solutions
  console.log('SessionForm initialized with solution:', existingSolutionId || 'new');
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

  // Categories with only per_session cost type (no radio button)
  const singleCostCategories = ['therapists_counselors', 'coaches_mentors', 'alternative_practitioners', 'doctors_specialists', 'medical_procedures'];
  const initialCostType = singleCostCategories.includes(category) ?
    (category === 'medical_procedures' ? 'total' : 'per_session') : '';

  const [costType, setCostType] = useState<'per_session' | 'monthly' | 'total' | ''>(initialCostType);
  const [costRange, setCostRange] = useState('');
  const [sessionFrequency, setSessionFrequency] = useState('');
  const [customSessionFrequency, setCustomSessionFrequency] = useState('');
  const [format, setFormat] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [insuranceCoverage, setInsuranceCoverage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [responseTime, setResponseTime] = useState('');
  
  // Step 2 fields - Arrays (side effects or challenges)
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['None']);
  const [sideEffectOptions, setSideEffectOptions] = useState<string[]>([]);
  const [customSideEffect, setCustomSideEffect] = useState('');
  const [showCustomSideEffect, setShowCustomSideEffect] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen only - not included in initial submission)
  const [completedTreatment, setCompletedTreatment] = useState('');
  const [typicalLength, setTypicalLength] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Track if optional fields have been submitted
  const [optionalFieldsSubmitted, setOptionalFieldsSubmitted] = useState(false);

  // const supabaseClient = createClientComponentClient();

  // Only show side effects for medical procedures and alternative practitioners
  const showSideEffects = ['medical_procedures', 'alternative_practitioners'].includes(category);

  // Show challenges for therapists, coaches, doctors, professional services, and crisis resources
  const showChallenges = ['therapists_counselors', 'coaches_mentors', 'doctors_specialists', 'professional_services', 'crisis_resources'].includes(category);

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;
  
  // Form backup data object
  const formBackupData = {
    effectiveness,
    timeToResults,
    costType,
    costRange,
    sessionFrequency,
    customSessionFrequency,
    format,
    sessionLength,
    waitTime,
    insuranceCoverage,
    specialty,
    customSpecialty,
    showCustomSpecialty,
    responseTime,
    selectedSideEffects,
    customSideEffect,
    selectedChallenges,
    customChallenge,
    failedSolutions,
    completedTreatment,
    typicalLength,
    availability,
    notes,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `session-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setEffectiveness(data.effectiveness || null);
        setTimeToResults(data.timeToResults || '');
        setCostType(data.costType || '');
        setCostRange(data.costRange || '');
        setSessionFrequency(data.sessionFrequency || '');
        setCustomSessionFrequency(data.customSessionFrequency || '');
        setFormat(data.format || '');
        setSessionLength(data.sessionLength || '');
        setWaitTime(data.waitTime || '');
        setInsuranceCoverage(data.insuranceCoverage || '');
        setSpecialty(data.specialty || '');
        setCustomSpecialty(data.customSpecialty || '');
        setShowCustomSpecialty(data.showCustomSpecialty || false);
        setResponseTime(data.responseTime || '');
        setSelectedSideEffects(data.selectedSideEffects || ['None']);
        setCustomSideEffect(data.customSideEffect || '');
        setSelectedChallenges(data.selectedChallenges || ['None']);
        setCustomChallenge(data.customChallenge || '');
        setFailedSolutions(data.failedSolutions || []);
        setCompletedTreatment(data.completedTreatment || '');
        setTypicalLength(data.typicalLength || '');
        setAvailability(data.availability || []);
        setNotes(data.notes || '');
        setCurrentStep(data.currentStep || 1);
        setHighestStepReached(data.highestStepReached || 1);
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000);
      }
    }
  );
  
  // Handle browser back button and history management (consolidated to prevent race conditions)
  useEffect(() => {
    // Initial history pushState
    window.history.pushState({ step: currentStep }, '');

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      } else {
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, onBack]);
  
  // Track highest step reached
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep, highestStepReached]);
  
  useEffect(() => {
    if (showSideEffects) {
      setLoading(true);
      const fetchOptions = async () => {
        try {
          const supabase = createClientComponentClient();
          const { data, error } = await supabase
            .from('side_effect_options')
            .select('label')
            .eq('category', category)
            .eq('is_active', true)
            .order('display_order');

          if (error) {
            console.error(`[SessionForm] Database error fetching side effects for ${category}:`, error);
            toast.error('Failed to load side effect options. Please refresh the page.');
            setSideEffectOptions(['None']);
          } else if (!data || data.length === 0) {
            console.error(`[SessionForm] No side effect options found for category: ${category}`);
            toast.error('Side effect options not configured. Please contact support.');
            setSideEffectOptions(['None']);
          } else {
            const rows = data as LabelRow[];
            setSideEffectOptions(rows.map((item) => item.label));
          }
        } catch (err) {
          console.error(`[SessionForm] Exception fetching side effects for ${category}:`, err);
          toast.error('Failed to load form options. Please refresh the page.');
          setSideEffectOptions(['None']);
        }
        setLoading(false);
      };

      fetchOptions();
    }
    // Note: showSideEffects is derived from category, so only category in deps
  }, [category]);
  
  useEffect(() => {
    if (showChallenges) {
      setChallengesLoading(true);

      const fetchChallenges = async () => {
        try {
          const supabase = createClientComponentClient();
          const { data, error } = await supabase
            .from('challenge_options')
            .select('label')
            .eq('category', category)
            .eq('is_active', true)
            .order('display_order');

          if (error) {
            console.error(`[SessionForm] Database error fetching challenges for ${category}:`, error);
            toast.error('Failed to load challenge options. Please refresh the page.');
            setChallengeOptions(['None']);
          } else if (!data || data.length === 0) {
            console.error(`[SessionForm] No challenge options found for category: ${category}`);
            toast.error('Challenge options not configured. Please contact support.');
            setChallengeOptions(['None']);
          } else {
            const rows = data as LabelRow[];
            setChallengeOptions(rows.map((item) => item.label));
          }
        } catch (err) {
          console.error(`[SessionForm] Exception fetching challenges for ${category}:`, err);
          toast.error('Failed to load form options. Please refresh the page.');
          setChallengeOptions(['None']);
        }
        setChallengesLoading(false);
      };

      fetchChallenges();
    }
    // Note: showChallenges is derived from category, so only category in deps
  }, [category]);
  
  const handleSideEffectToggle = (effect: string) => {
    if (effect === 'None') {
      setSelectedSideEffects(['None']);
      setShowCustomSideEffect(false);
    } else if (effect === 'Other (please describe)') {
      // Toggle the text input visibility
      if (showCustomSideEffect) {
        setShowCustomSideEffect(false);
        setCustomSideEffect('');
      } else {
        setShowCustomSideEffect(true);
      }
    } else {
      setSelectedSideEffects(prev => {
        const filtered = prev.filter(e => e !== 'None');
        if (prev.includes(effect)) {
          const newEffects = filtered.filter(e => e !== effect);
          return newEffects.length === 0 ? ['None'] : newEffects;
        }
        return [...filtered, effect];
      });
    }
  };
  
  const addCustomSideEffect = () => {
    if (customSideEffect.trim()) {
      setSelectedSideEffects(selectedSideEffects.filter(e => e !== 'None').concat(customSideEffect.trim()));
      setCustomSideEffect('');
      setShowCustomSideEffect(false);
    }
  };
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenge === 'None') {
      setSelectedChallenges(['None']);
      setShowCustomChallenge(false);
    } else if (challenge === 'Other (please describe)') {
      // Toggle the text input visibility
      if (showCustomChallenge) {
        setShowCustomChallenge(false);
        setCustomChallenge('');
      } else {
        setShowCustomChallenge(true);
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
      setSelectedChallenges(selectedChallenges.filter(c => c !== 'None').concat(customChallenge.trim()));
      setCustomChallenge('');
      setShowCustomChallenge(false);
    }
  };

  // Different cost options for different categories
  const getCostOptions = () => {
    if (category === 'crisis_resources') {
      return ['Free', 'Donation-based', 'Sliding scale', "Don't remember"];
    }
    if (category === 'medical_procedures') {
      // Medical procedures only use total cost (no radio button)
      return [...COST_RANGES.total, "Don't remember"];
    }
    const baseOptions = COST_RANGES[costType as keyof typeof COST_RANGES] || COST_RANGES.per_session;
    return [...baseOptions, "Don't remember"];
  };
  
  const renderStepOne = () => {
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
            <div className={`grid grid-cols-5 gap-2 ${touched.effectiveness && validationErrors.effectiveness ? 'ring-2 ring-red-500 rounded-lg p-1' : ''}`}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    setEffectiveness(rating);
                    markTouched('effectiveness');
                  }}
                  onBlur={() => markTouched('effectiveness')}
                  className={`relative py-4 px-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    effectiveness === rating
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105 shadow-lg'
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
            {touched.effectiveness && validationErrors.effectiveness && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.effectiveness}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between sm:hidden">
              <span className="text-xs text-gray-500">Not at all</span>
              <span className="text-xs text-gray-500">Extremely</span>
            </div>
          </div>

          {/* Time to results */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                When did you notice results? <span className="text-red-500">*</span>
              </label>
            </div>
            <Select
              value={timeToResults}
              onValueChange={(value) => {
                setTimeToResults(value);
                markTouched('timeToResults');
              }}
            >
              <SelectTrigger
                onBlur={() => markTouched('timeToResults')}
                className={`w-full px-4 py-3 rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all
                       ${touched.timeToResults && validationErrors.timeToResults
                         ? 'border-2 border-red-500'
                         : 'border border-gray-300 dark:border-gray-600'}`}
              >
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.timeToResults}</AlertDescription>
              </Alert>
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
            title={category === 'medical_procedures' ? 'Procedure details' : 'Session details'}
          />

      {/* Required fields based on category */}
      <div className="space-y-4">
        {/* Session frequency - REQUIRED for specific categories, OPTIONAL for doctors */}
        {['therapists_counselors', 'coaches_mentors', 'alternative_practitioners', 'medical_procedures', 'professional_services'].includes(category) && (
          <div className="space-y-2">
            <Label htmlFor="session_frequency">
              {category === 'medical_procedures' ? 'Treatment frequency' : 'Session frequency'}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={sessionFrequency}
              onValueChange={(value) => {
                setSessionFrequency(value);
                markTouched('sessionFrequency');
              }}
            >
              <SelectTrigger
                onBlur={() => markTouched('sessionFrequency')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.sessionFrequency && validationErrors.sessionFrequency
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="One-time only">One-time only</SelectItem>
                <SelectItem value="As needed">As needed</SelectItem>
                <SelectItem value="Multiple times per week">Multiple times per week</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Every 2-3 months">Every 2-3 months</SelectItem>
                <SelectItem value="Other">Other (please describe)</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom frequency field when "Other" is selected */}
            {sessionFrequency === 'Other' && (
              <div className="mt-3 animate-slide-in">
                <input
                  type="text"
                  placeholder="Please describe the frequency"
                  value={customSessionFrequency}
                  onChange={(e) => setCustomSessionFrequency(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-purple-500 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {touched.sessionFrequency && validationErrors.sessionFrequency && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.sessionFrequency}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Session length REQUIRED for therapists, coaches, alternative practitioners */}
        {['therapists_counselors', 'coaches_mentors', 'alternative_practitioners'].includes(category) && (
          <div className="space-y-2">
            <Label htmlFor="session_length">
              Session length <span className="text-red-500">*</span>
            </Label>
            <Select
              value={sessionLength}
              onValueChange={(value) => {
                setSessionLength(value);
                markTouched('sessionLength');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('sessionLength')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.sessionLength && validationErrors.sessionLength
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 15 minutes">Under 15 minutes</SelectItem>
                <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
                <SelectItem value="90-120 minutes">90-120 minutes</SelectItem>
                <SelectItem value="Over 2 hours">Over 2 hours</SelectItem>
                <SelectItem value="Varies">Varies</SelectItem>
              </SelectContent>
            </Select>
            {touched.sessionLength && validationErrors.sessionLength && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.sessionLength}</AlertDescription>
              </Alert>
            )}
          </div>
        )}


        {/* Format field - REQUIRED for crisis_resources only */}
        {category === 'crisis_resources' && (
          <div className="space-y-2">
            <Label htmlFor="format">
              Format <span className="text-red-500">*</span>
            </Label>
            <Select
              value={format}
              onValueChange={(value) => {
                setFormat(value);
                markTouched('format');
              }}
            >
              <SelectTrigger
                onBlur={() => markTouched('format')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.format && validationErrors.format
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Text/Chat">Text/Chat</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
            {touched.format && validationErrors.format && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.format}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Insurance coverage field - REQUIRED for doctors_specialists only */}
        {category === 'doctors_specialists' && (
          <div className="space-y-2">
            <Label htmlFor="insurance_coverage">
              Insurance coverage <span className="text-red-500">*</span>
            </Label>
            <Select
              value={insuranceCoverage}
              onValueChange={(value) => {
                setInsuranceCoverage(value);
                markTouched('insuranceCoverage');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('insuranceCoverage')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.insuranceCoverage && validationErrors.insuranceCoverage
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="Coverage status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fully covered by insurance">Fully covered by insurance</SelectItem>
                <SelectItem value="Partially covered by insurance">Partially covered by insurance</SelectItem>
                <SelectItem value="Not covered by insurance/self-funded">Not covered by insurance/self-funded</SelectItem>
                <SelectItem value="Covered by government program (Medicare, NHS, provincial coverage, etc.)">Covered by government program (Medicare, NHS, provincial coverage, etc.)</SelectItem>
              </SelectContent>
            </Select>
            {touched.insuranceCoverage && validationErrors.insuranceCoverage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.insuranceCoverage}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Cost field */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Cost? <span className="text-red-500">*</span>
          </Label>

          {/* Only show radio buttons for categories that support multiple cost types */}
          {category !== 'crisis_resources' && !singleCostCategories.includes(category) && (
            <>
              <div className="flex gap-4" role="radiogroup">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="costType"
                    value="per_session"
                    checked={costType === 'per_session'}
                    onChange={(e) => {
                      setCostType(e.target.value as 'per_session' | 'monthly' | 'total');
                      markTouched('costType');
                    }}
                    onBlur={() => markTouched('costType')}
                    className="mr-2 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span>Per session</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="costType"
                    value="monthly"
                    checked={costType === 'monthly'}
                    onChange={(e) => {
                      setCostType(e.target.value as 'per_session' | 'monthly' | 'total');
                      markTouched('costType');
                    }}
                    onBlur={() => markTouched('costType')}
                    className="mr-2 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span>Monthly</span>
                </label>
                {category === 'medical_procedures' && (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="costType"
                      value="total"
                      checked={costType === 'total'}
                      onChange={(e) => {
                        setCostType(e.target.value as 'per_session' | 'monthly' | 'total');
                        markTouched('costType');
                      }}
                      onBlur={() => markTouched('costType')}
                      className="mr-2 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span>Total cost</span>
                  </label>
                )}
              </div>
              {touched.costType && validationErrors.costType && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.costType}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          <Select
            value={costRange}
            onValueChange={(value) => {
              setCostRange(value);
              markTouched('costRange');
            }}
            required
          >
            <SelectTrigger
              onBlur={() => markTouched('costRange')}
              className={`w-full px-4 py-2 rounded-lg
                ${touched.costRange && validationErrors.costRange
                  ? 'border-2 border-red-500'
                  : 'border border-gray-300 dark:border-gray-600'}`}
            >
              <SelectValue placeholder="Select cost range" />
            </SelectTrigger>
            <SelectContent>
              {getCostOptions().map(range => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.costRange && validationErrors.costRange && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.costRange}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Wait time for doctors REQUIRED, medical_procedures REQUIRED */}
        {category === 'doctors_specialists' && (
          <div className="space-y-2">
            <Label htmlFor="wait_time">
              Wait time <span className="text-red-500">*</span>
            </Label>
            <Select
              value={waitTime}
              onValueChange={(value) => {
                setWaitTime(value);
                markTouched('waitTime');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('waitTime')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.waitTime && validationErrors.waitTime
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="Time to get appointment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Same day">Same day</SelectItem>
                <SelectItem value="Within a week">Within a week</SelectItem>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-2 months">1-2 months</SelectItem>
                <SelectItem value="2+ months">2+ months</SelectItem>
              </SelectContent>
            </Select>
            {touched.waitTime && validationErrors.waitTime && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.waitTime}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {category === 'medical_procedures' && (
          <div className="space-y-2">
            <Label htmlFor="wait_time">
              Wait time <span className="text-red-500">*</span>
            </Label>
            <Select
              value={waitTime}
              onValueChange={(value) => {
                setWaitTime(value);
                markTouched('waitTime');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('waitTime')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.waitTime && validationErrors.waitTime
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="Time to get appointment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Same day">Same day</SelectItem>
                <SelectItem value="Within a week">Within a week</SelectItem>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-3 months">1-3 months</SelectItem>
                <SelectItem value="3-6 months">3-6 months</SelectItem>
                <SelectItem value="More than 6 months">More than 6 months</SelectItem>
              </SelectContent>
            </Select>
            {touched.waitTime && validationErrors.waitTime && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.waitTime}</AlertDescription>
              </Alert>
            )}
          </div>
        )}


        {/* Specialty for professional_services REQUIRED */}
        {category === 'professional_services' && (
          <div className="space-y-2">
            <Label htmlFor="specialty">
              Type of service <span className="text-red-500">*</span>
            </Label>
            <Select
              value={specialty}
              onValueChange={(value) => {
                setSpecialty(value);
                markTouched('specialty');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('specialty')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.specialty && validationErrors.specialty
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Career/Business coach">Career/Business coach</SelectItem>
                <SelectItem value="Creative services (photographer, designer, writer)">Creative services (photographer, designer, writer)</SelectItem>
                <SelectItem value="Digital marketing/Tech specialist">Digital marketing/Tech specialist</SelectItem>
                <SelectItem value="Financial advisor/Planner">Financial advisor/Planner</SelectItem>
                <SelectItem value="Hair/Beauty professional">Hair/Beauty professional</SelectItem>
                <SelectItem value="Home services (cleaning, handyman, etc.)">Home services (cleaning, handyman, etc.)</SelectItem>
                <SelectItem value="Legal services">Legal services</SelectItem>
                <SelectItem value="Nutritionist">Nutritionist</SelectItem>
                <SelectItem value="Personal trainer/Fitness coach">Personal trainer/Fitness coach</SelectItem>
                <SelectItem value="Pet services">Pet services</SelectItem>
                <SelectItem value="Professional organizer">Professional organizer</SelectItem>
                <SelectItem value="Tutor/Educational specialist">Tutor/Educational specialist</SelectItem>
                <SelectItem value="Virtual assistant">Virtual assistant</SelectItem>
                <SelectItem value="Other (please specify)">Other (please specify)</SelectItem>
              </SelectContent>
            </Select>
            {touched.specialty && validationErrors.specialty && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.specialty}</AlertDescription>
              </Alert>
            )}

            {/* Custom specialty text field when "Other" is selected */}
            {specialty === 'Other (please specify)' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Please specify the type of professional service"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        )}

        {/* Response time for crisis_resources REQUIRED */}
        {category === 'crisis_resources' && (
          <div className="space-y-2">
            <Label htmlFor="response_time">
              Response time <span className="text-red-500">*</span>
            </Label>
            <Select
              value={responseTime}
              onValueChange={(value) => {
                setResponseTime(value);
                markTouched('responseTime');
              }}
              required
            >
              <SelectTrigger
                onBlur={() => markTouched('responseTime')}
                className={`w-full px-4 py-2 rounded-lg
                  ${touched.responseTime && validationErrors.responseTime
                    ? 'border-2 border-red-500'
                    : 'border border-gray-300 dark:border-gray-600'}`}
              >
                <SelectValue placeholder="How quickly did they respond?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="Within 5 minutes">Within 5 minutes</SelectItem>
                <SelectItem value="Within 30 minutes">Within 30 minutes</SelectItem>
                <SelectItem value="Within hours">Within hours</SelectItem>
                <SelectItem value="Within 24 hours">Within 24 hours</SelectItem>
                <SelectItem value="Within a couple of days">Within a couple of days</SelectItem>
                <SelectItem value="More than a couple of days">More than a couple of days</SelectItem>
              </SelectContent>
            </Select>
            {touched.responseTime && validationErrors.responseTime && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.responseTime}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
      </div>
    );
  };
  
  const renderStepTwo = () => {
    console.log('[DEBUG] renderStepTwo called');
    console.log('[DEBUG] showSideEffects:', showSideEffects);
    console.log('[DEBUG] showChallenges:', showChallenges);
    console.log('[DEBUG] category:', category);
    
    return (
      <div className="space-y-6 animate-slide-in">
        <ProgressCelebration step={currentStep} />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <h2 className="text-xl font-bold">
            {showSideEffects ? 'Any side effects?' : 'Any challenges?'}
          </h2>
        </div>

        {/* Quick tip */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 This helps others know what to expect
          </p>
        </div>

        {showSideEffects ? renderSideEffects() : showChallenges ? renderChallenges() : null}
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
  
  const renderSideEffects = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    // Add "Other" option if not already in the list
    const allSideEffects = sideEffectOptions.includes('Other (please describe)') 
      ? sideEffectOptions 
      : [...sideEffectOptions, 'Other (please describe)'];
    
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allSideEffects.map((effect) => (
        <label
          key={effect}
          className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                    transition-all transform hover:scale-[1.02] ${
            selectedSideEffects.includes(effect)
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-lg'
          }`}
        >
          <input
            type="checkbox"
            checked={selectedSideEffects.includes(effect)}
            onChange={() => handleSideEffectToggle(effect)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 
                        transition-all ${
            selectedSideEffects.includes(effect)
              ? 'border-purple-500 bg-purple-500'
              : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
          }`}>
            {selectedSideEffects.includes(effect) && (
              <Check className="w-3 h-3 text-white animate-scale-in" />
            )}
          </div>
          <span className="text-sm">{effect}</span>
        </label>
        ))}
      </div>

      {/* Custom side effect input */}
      {showCustomSideEffect && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={customSideEffect}
              onChange={(e) => setCustomSideEffect(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSideEffect()}
              placeholder="Please describe the side effect"
              maxLength={500}
              className="flex-1 px-3 py-2 border border-purple-500 rounded-lg 
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       dark:bg-gray-800 dark:text-white"
              autoFocus
            />
            <button
              type="button"
              onClick={addCustomSideEffect}
              disabled={!customSideEffect.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors button-focus-tight"
            >
              Add
            </button>
          </div>
        </div>
      )}
      </>
    );
  };
  
  const renderChallenges = () => {
    console.log('[DEBUG] renderChallenges called, category:', category);
    console.log('[DEBUG] challengesLoading:', challengesLoading);
    console.log('[DEBUG] challengeOptions:', challengeOptions);

    if (challengesLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    // Safety check for challengeOptions
    if (!Array.isArray(challengeOptions)) {
      console.error('[DEBUG] challengeOptions is not an array:', challengeOptions);
      return <div>Error loading challenges. Please refresh the page.</div>;
    }

    // Add "Other" option if not already in the list
    const allChallenges = (challengeOptions || []).includes('Other (please describe)')
      ? (challengeOptions || [])
      : [...(challengeOptions || []), 'Other (please describe)'];

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allChallenges.map((challenge) => (
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

      {/* Custom barrier input */}
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
            type="button"
            onClick={addCustomChallenge}
            disabled={!customChallenge.trim()}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Show custom barriers */}
      {selectedChallenges.filter(c => !challengeOptions?.includes(c) && c !== 'None').length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
          <div className="flex flex-wrap gap-2">
            {selectedChallenges.filter(c => !challengeOptions?.includes(c) && c !== 'None').map((challenge) => (
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
      </>
    );
  };

  // Validation functions
  const validateField = (fieldName: string, value: unknown): string => {
    // Universal required fields
    if (fieldName === 'effectiveness' && (value === null || value === undefined)) {
      return 'Please rate how well this worked for you';
    }
    if (fieldName === 'timeToResults' && !value) {
      return 'Please select when you noticed results';
    }
    if (fieldName === 'costRange' && !value) {
      return 'Please select a cost range';
    }
    if (fieldName === 'costType' && category !== 'crisis_resources' && !singleCostCategories.includes(category) && !value) {
      return 'Please select a cost type';
    }

    // Category-specific required fields
    if (fieldName === 'sessionLength') {
      if (['therapists_counselors', 'coaches_mentors', 'alternative_practitioners'].includes(category) && !value) {
        return 'Session length is required for this category';
      }
    }
    if (fieldName === 'sessionFrequency') {
      if (['therapists_counselors', 'coaches_mentors', 'alternative_practitioners', 'medical_procedures', 'professional_services'].includes(category) && !value) {
        return category === 'medical_procedures' ? 'Treatment frequency is required' : 'Session frequency is required';
      }
    }
    if (fieldName === 'waitTime') {
      if (['doctors_specialists', 'medical_procedures'].includes(category) && !value) {
        return 'Wait time is required for this category';
      }
    }
    if (fieldName === 'insuranceCoverage' && category === 'doctors_specialists' && !value) {
      return 'Insurance coverage is required';
    }
    if (fieldName === 'specialty' && category === 'professional_services' && !value) {
      return 'Type of service is required';
    }
    if (fieldName === 'responseTime' && category === 'crisis_resources' && !value) {
      return 'Response time is required';
    }
    if (fieldName === 'format' && category === 'crisis_resources' && !value) {
      return 'Format is required';
    }

    return '';
  };

  const markTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Touch all required fields for current step (to show validation errors)
  const touchAllRequiredFields = () => {
    switch (currentStep) {
      case 1: // Session details
        // Universal required fields
        markTouched('effectiveness');
        validateField('effectiveness', effectiveness);

        markTouched('timeToResults');
        validateField('timeToResults', timeToResults);

        markTouched('costRange');
        validateField('costRange', costRange);

        // Cost type (all categories EXCEPT crisis_resources)
        if (category !== 'crisis_resources') {
          markTouched('costType');
          validateField('costType', costType);
        }

        // Category-specific required fields
        if (['therapists_counselors', 'coaches_mentors', 'alternative_practitioners'].includes(category)) {
          // These need sessionLength + sessionFrequency
          markTouched('sessionLength');
          validateField('sessionLength', sessionLength);

          markTouched('sessionFrequency');
          validateField('sessionFrequency', sessionFrequency);
        } else if (category === 'doctors_specialists') {
          // Doctors need waitTime + insuranceCoverage
          markTouched('waitTime');
          validateField('waitTime', waitTime);

          markTouched('insuranceCoverage');
          validateField('insuranceCoverage', insuranceCoverage);
        } else if (category === 'medical_procedures') {
          // Medical procedures need waitTime + sessionFrequency
          markTouched('waitTime');
          validateField('waitTime', waitTime);

          markTouched('sessionFrequency');
          validateField('sessionFrequency', sessionFrequency);
        } else if (category === 'professional_services') {
          // Professional services need specialty + sessionFrequency
          markTouched('specialty');
          validateField('specialty', specialty);

          markTouched('sessionFrequency');
          validateField('sessionFrequency', sessionFrequency);
        } else if (category === 'crisis_resources') {
          // Crisis resources need responseTime + format
          markTouched('responseTime');
          validateField('responseTime', responseTime);

          markTouched('format');
          validateField('format', format);
        }
        break;

      case 2: // Side effects or challenges
        // These use array validation - handled separately
        if (showSideEffects && selectedSideEffects.length === 0) {
          toast.error('Please select at least one side effect option');
        }
        if (showChallenges && selectedChallenges.length === 0) {
          toast.error('Please select at least one challenge option');
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

  const getFieldValue = (fieldName: string): unknown => {
    switch (fieldName) {
      case 'effectiveness': return effectiveness;
      case 'timeToResults': return timeToResults;
      case 'costRange': return costRange;
      case 'costType': return costType;
      case 'sessionLength': return sessionLength;
      case 'sessionFrequency': return sessionFrequency;
      case 'waitTime': return waitTime;
      case 'insuranceCoverage': return insuranceCoverage;
      case 'specialty': return specialty;
      case 'responseTime': return responseTime;
      case 'format': return format;
      default: return undefined;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        // Universal fields always required
        const universalValid = effectiveness !== null && timeToResults !== '';
        
        // Cost always required
        const costValid = costRange !== '' && 
                         (category === 'crisis_resources' || costType !== '');
        
        // Category-specific required fields
        let categorySpecificValid = true;

        if (category === 'therapists_counselors' || category === 'coaches_mentors' || category === 'alternative_practitioners') {
          // These categories require both session_frequency and session_length
          categorySpecificValid = sessionLength !== '' && sessionFrequency !== '';
        } else if (category === 'doctors_specialists') {
          // Doctors require wait_time and insurance_coverage (NOT session fields)
          categorySpecificValid = waitTime !== '' && insuranceCoverage !== '';
        } else if (category === 'medical_procedures') {
          const frequencyValid = sessionFrequency !== '' &&
            (sessionFrequency !== 'Other' || (sessionFrequency === 'Other' && customSessionFrequency.trim() !== ''));
          categorySpecificValid = waitTime !== '' && frequencyValid;
        } else if (category === 'professional_services') {
          categorySpecificValid = specialty !== '' && sessionFrequency !== '';
        } else if (category === 'crisis_resources') {
          categorySpecificValid = responseTime !== '' && format !== '';
        } else {
          // Unknown category - should not happen
          categorySpecificValid = false;
        }
        
        return universalValid && costValid && categorySpecificValid;
        
      case 2:
        // Must select at least one side effect/barrier
        const hasSelections = showSideEffects ? selectedSideEffects.length > 0 : selectedChallenges.length > 0;
        return hasSelections;
        
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

    setIsSubmitting(true);

    try {
      // Determine primary cost and type
      const hasUnknownCost = costRange === "Don't remember";
      const primaryCost = hasUnknownCost ? "Unknown" : 
                          costRange === "Free" || costRange === "Donation-based" ? "Free" :
                          costRange;
      
      // Determine cost_type for the primary cost field
      const derivedCostType = hasUnknownCost ? "unknown" :
                              costRange === "Free" || costRange === "Donation-based" ? "free" :
                              costType === "total" ? "one_time" :
                              costType === "per_session" ? "per_session" :
                              "recurring"; // monthly
      
      // Prepare solution fields for storage
      const solutionFields: Record<string, unknown> = {
        // Universal field
        time_to_results: timeToResults,
        // Cost fields
        cost: primaryCost,
        cost_type: derivedCostType,
        cost_range: costRange,
        session_cost_type: costType // Preserve the original session cost type
      };
      
      // Add optional fields based on category
      if (sessionFrequency) {
        // Use custom frequency text if "Other" was selected and custom text provided
        solutionFields.session_frequency = (sessionFrequency === 'Other' && customSessionFrequency.trim())
          ? customSessionFrequency.trim()
          : sessionFrequency;
      }
      if (format) solutionFields.format = format;
      if (sessionLength) solutionFields.session_length = sessionLength;
      if (waitTime) solutionFields.wait_time = waitTime;
      if (insuranceCoverage) solutionFields.insurance_coverage = insuranceCoverage;
      if (specialty) {
        solutionFields.specialty = specialty;
        // Save custom specialty text if "Other" was selected
        if (specialty === 'Other (please specify)' && customSpecialty.trim()) {
          solutionFields.custom_specialty = customSpecialty.trim();
        }
      }
      if (responseTime) solutionFields.response_time = responseTime;
      
      // Add side effects or barriers
      if (showSideEffects) {
        // "None" is a valid value - only filter out 'Other (please describe)' marker
        solutionFields.side_effects = selectedSideEffects.filter(e => e !== 'Other (please describe)');
      }
      if (showChallenges) {
        // Include challenges - "None" is a valid value
        solutionFields.challenges = selectedChallenges;
      }
      
      // REMOVED from initial submission - notes handled in success screen only

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
          implementationId: result.variantId, // For session forms, variantId is the implementationId
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
        console.error('[SessionForm] Submission failed:', result.error);
        toast.error('Unable to submit', {
          description: result.error || 'Please check your entries and try again.',
          duration: 6000, // 6 seconds for better visibility
        });
      }
    } catch (error) {
      console.error('[SessionForm] Exception during submission:', error);
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

    if (sessionFrequency && category === 'doctors_specialists') additionalFields.session_frequency = sessionFrequency;
    if (sessionLength && ['doctors_specialists', 'professional_services'].includes(category)) additionalFields.session_length = sessionLength;
    if (format && category !== 'crisis_resources') additionalFields.format = format;
    if (insuranceCoverage && ['therapists_counselors', 'medical_procedures'].includes(category)) additionalFields.insurance_coverage = insuranceCoverage;
    if (completedTreatment) additionalFields.completed_treatment = completedTreatment;
    if (typicalLength) additionalFields.typical_length = typicalLength;
    if (availability.length > 0) additionalFields.availability = availability;
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
        // Show success feedback
        console.log('Successfully updated additional information');
        // Mark as submitted to disable fields and change button
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
      case 1: // Universal fields + Category-specific required fields
        return renderStepOne();
      case 2: // Side effects or barriers
        return renderStepTwo();
      case 3: // Failed solutions
        return renderStepThree();
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

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              {/* Session frequency - Optional for doctors_specialists only */}
              {category === 'doctors_specialists' && (
                <Select value={sessionFrequency} onValueChange={setSessionFrequency} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Session frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One-time only">One-time only</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                    <SelectItem value="Multiple times per week">Multiple times per week</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Every 2-3 months">Every 2-3 months</SelectItem>
                    <SelectItem value="Other">Other (please describe)</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Session length - Optional for doctors_specialists and professional_services */}
              {['doctors_specialists', 'professional_services'].includes(category) && (
                <Select value={sessionLength} onValueChange={setSessionLength} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Session length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under 15 minutes">Under 15 minutes</SelectItem>
                    <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                    <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                    <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                    <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
                    <SelectItem value="90-120 minutes">90-120 minutes</SelectItem>
                    <SelectItem value="Over 2 hours">Over 2 hours</SelectItem>
                    <SelectItem value="Varies">Varies</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Format - Optional for all categories except crisis_resources */}
              {category !== 'crisis_resources' && (
                <Select value={format} onValueChange={setFormat} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    {category === 'medical_procedures' ? (
                      <>
                        <SelectItem value="Outpatient">Outpatient</SelectItem>
                        <SelectItem value="Inpatient">Inpatient</SelectItem>
                        <SelectItem value="In-office">In-office</SelectItem>
                        <SelectItem value="At-home">At-home</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="In-person">In-person</SelectItem>
                        <SelectItem value="Virtual/Online">Virtual/Online</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Insurance coverage - Optional for therapists_counselors and medical_procedures */}
              {['therapists_counselors', 'medical_procedures'].includes(category) && (
                <Select value={insuranceCoverage} onValueChange={setInsuranceCoverage} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Insurance coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fully covered by insurance">Fully covered by insurance</SelectItem>
                    <SelectItem value="Partially covered by insurance">Partially covered by insurance</SelectItem>
                    <SelectItem value="Not covered by insurance/self-funded">Not covered by insurance/self-funded</SelectItem>
                    <SelectItem value="Covered by government program (Medicare, NHS, provincial coverage, etc.)">Covered by government program (Medicare, NHS, provincial coverage, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {['therapists_counselors', 'coaches_mentors', 'medical_procedures'].includes(category) && (
                <Select value={completedTreatment} onValueChange={setCompletedTreatment} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Completed full treatment?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Still ongoing">Still ongoing</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {!['professional_services', 'crisis_resources', 'medical_procedures'].includes(category) && (
                <Select value={typicalLength} onValueChange={setTypicalLength} disabled={optionalFieldsSubmitted}>
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                           disabled={optionalFieldsSubmitted}>
                    <SelectValue placeholder="Typical treatment length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single session only">Single session only</SelectItem>
                    <SelectItem value="2-4 sessions">2-4 sessions</SelectItem>
                    <SelectItem value="5-8 sessions">5-8 sessions</SelectItem>
                    <SelectItem value="8-12 sessions">8-12 sessions</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="Ongoing/Indefinite">Ongoing/Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {category === 'crisis_resources' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Availability</p>
                  {['24/7', 'Business hours', 'Evenings', 'Weekends', 'Immediate response', 'Callback within 24hrs'].map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={availability.includes(option)}
                        disabled={optionalFieldsSubmitted}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailability([...availability, option]);
                          } else {
                            setAvailability(availability.filter(a => a !== option));
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <span className={`text-sm ${optionalFieldsSubmitted ? 'opacity-60' : ''}`}>{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
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
          <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription>
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Required to continue:</p>
            <ul className="list-disc list-inside text-sm text-purple-800 dark:text-purple-200 space-y-0.5">
              {!effectiveness && <li>Effectiveness rating</li>}
              {!timeToResults && <li>Time to results</li>}
              {!costType && <li>Cost type</li>}
              {!costRange && <li>Cost amount</li>}
              {category === 'doctors_specialists' && !waitTime && <li>Wait time</li>}
              {category === 'doctors_specialists' && !insuranceCoverage && <li>Insurance coverage</li>}
              {category === 'medical_procedures' && !waitTime && <li>Wait time</li>}
              {category === 'medical_procedures' && !sessionFrequency && <li>Treatment frequency</li>}
              {category === 'medical_procedures' && sessionFrequency === 'Other' && !customSessionFrequency.trim() && <li>Treatment frequency description (you selected "Other")</li>}
              {['therapists_counselors', 'coaches_mentors', 'alternative_practitioners'].includes(category) && !sessionFrequency && <li>Session frequency</li>}
              {['therapists_counselors', 'coaches_mentors', 'alternative_practitioners'].includes(category) && !sessionLength && <li>Session length</li>}
              {category === 'professional_services' && !specialty && <li>Service specialty</li>}
              {category === 'professional_services' && specialty === 'Other' && !customSpecialty.trim() && <li>Specialty description (you selected "Other")</li>}
              {category === 'professional_services' && !sessionFrequency && <li>Session frequency</li>}
              {category === 'crisis_resources' && !responseTime && <li>Response time</li>}
              {category === 'crisis_resources' && !format && <li>Format</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

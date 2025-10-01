// components/solutions/forms/LifestyleForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
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
      const fallbackKey =
        category === 'diet_nutrition'
          ? 'diet_challenges'
          : category === 'sleep'
            ? 'sleep_challenges'
            : undefined;
      const fallbackOptions = fallbackKey ? DROPDOWN_OPTIONS[fallbackKey] : undefined;

      // Initialize Supabase client
      const supabaseClient = createClientComponentClient();
      
      const { data, error } = await supabaseClient
        .from('challenge_options')
        .select('label')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data && data.length > 0) {
        setChallengeOptions(data.map((item: { label: string }) => item.label));
      } else if (fallbackOptions) {
        // Use fallback if no data in DB
        setChallengeOptions(fallbackOptions);
      }
      setChallengesLoading(false);
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
    setIsSubmitting(true);
    
    try {
      // Keep stillFollowing and sustainabilityReason as separate fields
      
      // Primary cost field for cross-category filtering
      const primaryCost = costImpact; // For lifestyle, the impact IS the primary cost info
      const costType = "impact"; // Special type for relative cost changes
      
      // Prepare the solution fields with correct field names
      const solutionFields: Record<string, any> = {
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
    const additionalFields: Record<string, any> = {};
    
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let&apos;s capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            {/* Category-specific description */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                {category === 'diet_nutrition' ? (
                  <><strong>Diet/Nutrition:</strong> Changes to eating habits, meal plans, dietary restrictions, or nutritional approaches</>  
                ) : (
                  <><strong>Sleep:</strong> Changes to sleep schedule, bedtime routines, sleep environment, or sleep-related habits</>  
                )}
              </p>
            </div>

            {/* Effectiveness Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <FormSectionHeader 
                  icon="⭐"
                  title="How well it worked"
                  bgColor="bg-green-100 dark:bg-green-900"
                />
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

            {/* Required Fields Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <FormSectionHeader 
                  icon={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default}
                  title="Key details"
                />
              </div>

              {/* Cost Impact */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost impact <span className="text-red-500">*</span>
                </label>
                <select
                  value={costImpact}
                  onChange={(e) => setCostImpact(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">{category === 'diet_nutrition' ? "Compared to previous diet" : "Any costs?"}</option>
                  {category === 'diet_nutrition' ? (
                    <>
                      <option value="Significantly more expensive">Significantly more expensive</option>
                      <option value="Somewhat more expensive">Somewhat more expensive</option>
                      <option value="About the same">About the same</option>
                      <option value="Somewhat less expensive">Somewhat less expensive</option>
                      <option value="Significantly less expensive">Significantly less expensive</option>
                    </>
                  ) : (
                    <>
                      <option value="Free">Free</option>
                      <option value="Under $50">Under $50</option>
                      <option value="$50-$100">$50-$100</option>
                      <option value="$100-$200">$100-$200</option>
                      <option value="Over $200">Over $200</option>
                    </>
                  )}
                </select>
              </div>

              {/* Category-specific required fields */}
              {category === 'diet_nutrition' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weekly prep time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={weeklyPrepTime}
                    onChange={(e) => setWeeklyPrepTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             appearance-none"
                  >
                    <option value="">Time spent on meal planning/prep</option>
                    <option value="No extra time">No extra time</option>
                    <option value="Under 1 hour/week">Under 1 hour/week</option>
                    <option value="1-2 hours/week">1-2 hours/week</option>
                    <option value="2-4 hours/week">2-4 hours/week</option>
                    <option value="4-6 hours/week">4-6 hours/week</option>
                    <option value="6-8 hours/week">6-8 hours/week</option>
                    <option value="Over 8 hours/week">Over 8 hours/week</option>
                  </select>
                </div>
              )}

              {category === 'sleep' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Previous sleep hours <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={previousSleepHours}
                    onChange={(e) => setPreviousSleepHours(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             appearance-none"
                  >
                    <option value="">Before this change</option>
                    <option value="Under 4 hours">Under 4 hours</option>
                    <option value="4-5 hours">4-5 hours</option>
                    <option value="5-6 hours">5-6 hours</option>
                    <option value="6-7 hours">6-7 hours</option>
                    <option value="7-8 hours">7-8 hours</option>
                    <option value="Over 8 hours">Over 8 hours</option>
                    <option value="Highly variable">Highly variable</option>
                  </select>
                </div>
              )}

              {/* Long-term Sustainability - Two-step approach */}
              <div className="space-y-4">
                {/* Step A: Radio buttons for still following */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Are you still following this {category === 'sleep' ? 'sleep' : 'diet'} approach? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      stillFollowing === true
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="stillFollowing"
                        checked={stillFollowing === true}
                        onChange={() => {
                          setStillFollowing(true);
                          setSustainabilityReason(''); // Reset reason when changing selection
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        stillFollowing === true
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {stillFollowing === true && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">Yes, still following it</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      stillFollowing === false
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="stillFollowing"
                        checked={stillFollowing === false}
                        onChange={() => {
                          setStillFollowing(false);
                          setSustainabilityReason(''); // Reset reason when changing selection
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        stillFollowing === false
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {stillFollowing === false && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">No, I stopped</span>
                    </label>
                  </div>
                </div>

                {/* Step B: Conditional dropdown based on selection */}
                {stillFollowing === true && (
                  <div className="space-y-3 animate-slide-in">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      How's it going? <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <select
                      value={sustainabilityReason}
                      onChange={(e) => setSustainabilityReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none"
                    >
                      <option value="">Select (optional)</option>
                      <option value="Easy to maintain now">Easy to maintain now</option>
                      <option value="Takes effort but manageable">Takes effort but manageable</option>
                      <option value="Getting harder over time">Getting harder over time</option>
                      <option value="Struggling but continuing">Struggling but continuing</option>
                    </select>
                  </div>
                )}

                {stillFollowing === false && (
                  <div className="space-y-3 animate-slide-in">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Main reason you stopped? <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <select
                      value={sustainabilityReason}
                      onChange={(e) => setSustainabilityReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               appearance-none"
                    >
                      <option value="">Select (optional)</option>
                      <option value="Too hard to sustain">Too hard to sustain</option>
                      <option value="No longer needed (problem solved)">No longer needed (problem solved)</option>
                      <option value="Found something better">Found something better</option>
                      <option value="Life circumstances changed">Life circumstances changed</option>
                      <option value="Other">Other</option>
                    </select>
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
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <FormSectionHeader 
                icon="⚡"
                title="Any challenges?"
                bgColor="bg-amber-100 dark:bg-amber-900"
              />
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what to expect
              </p>
            </div>

            {/* Challenges grid */}
            {challengesLoading ? (
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {challengeOptions.map((challenge) => (
                  <label
                    key={challenge}
                    className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                              transition-all transform hover:scale-[1.02] ${
                      selectedChallenges.includes(challenge)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
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
                        ? 'border-blue-500 bg-blue-500'
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
                  className="flex-1 px-3 py-2 border border-blue-500 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={addCustomChallenge}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg transition-colors"
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
                    <div key={challenge} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
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
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
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
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🔍</span>
              </div>
              <FormSectionHeader 
                icon="🔍"
                title="What else did you try?"
                bgColor="bg-purple-100 dark:bg-purple-900"
              />
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
              {/* Category-specific optional fields */}
              {category === 'diet_nutrition' && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Social impact</label>
                  <select
                    value={socialImpact}
                    onChange={(e) => setSocialImpact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             appearance-none text-sm"
                  >
                    <option value="">Social challenges?</option>
                    <option value="No impact">No impact</option>
                    <option value="Slightly challenging">Slightly challenging</option>
                    <option value="Moderately challenging">Moderately challenging</option>
                    <option value="Very challenging">Very challenging</option>
                    <option value="Deal breaker">Deal breaker</option>
                  </select>
                </div>
              )}

              {category === 'sleep' && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Sleep quality change</label>
                  <select
                    value={sleepQualityChange}
                    onChange={(e) => setSleepQualityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             appearance-none text-sm"
                  >
                    <option value="">Quality improvement?</option>
                    <option value="Dramatically better">Dramatically better</option>
                    <option value="Significantly better">Significantly better</option>
                    <option value="Somewhat better">Somewhat better</option>
                    <option value="No change">No change</option>
                    <option value="Somewhat worse">Somewhat worse</option>
                    <option value="Much worse">Much worse</option>
                  </select>
                </div>
              )}

              {category === 'sleep' && (
                <input
                  type="text"
                  placeholder="Specific approach or method"
                  value={specificApproach}
                  onChange={(e) => setSpecificApproach(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
                />
              )}

              <input
                type="text"
                placeholder="Helpful resources (books, apps, etc.)"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(socialImpact || sleepQualityChange || (category === 'sleep' && specificApproach) || resources || notes) && (
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
          {currentStep < highestStepReached && currentStep < totalSteps && (
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

// components/solutions/forms/AppForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/database/client'; // Removed: unused after migrating to server actions
import { ChevronLeft, Check, X, Plus } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface AppFormProps {
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



export function AppForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: AppFormProps) {
  // Debug logging
  
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
  
  // Step 1 fields - App details
  const [cost, setCost] = useState('');
  const [timeToResults, setTimeToResults] = useState('');
  const [usageFrequency, setUsageFrequency] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  
  // Step 2 fields - Challenges
  const [challenges, setChallenges] = useState<string[]>(['None']);
  const [customChallenge, setCustomChallenge] = useState('');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;
  
  // Form backup data object
  const formBackupData = {
    cost,
    timeToResults,
    usageFrequency,
    subscriptionType,
    effectiveness,
    challenges,
    platform,
    notes,
    failedSolutions,
    currentStep,
    highestStepReached
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    `app-form-${goalId}-${solutionName}`,
    formBackupData,
    {
      onRestore: (data) => {
        setCost(data.cost || '');
        setTimeToResults(data.timeToResults || '');
        setUsageFrequency(data.usageFrequency || '');
        setSubscriptionType(data.subscriptionType || '');
        setEffectiveness(data.effectiveness || null);
        setChallenges(data.challenges || ['None']);
        setPlatform(data.platform || '');
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


  useEffect(() => {
    // Auto-set cost to 'Free' when Free version is selected
    if (subscriptionType === 'Free version') {
      setCost('Free');
    }
  }, [subscriptionType]);

  // App-specific challenge options
  const challengeOptions = DROPDOWN_OPTIONS.app_challenges ?? ['None'];

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


  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // App details
        // Auto-set cost for free version
        const effectiveCost = subscriptionType === 'Free version' ? 'Free' : cost;
        return effectiveCost !== '' && timeToResults !== '' && usageFrequency !== '' && 
               subscriptionType !== '' && effectiveness !== null;
        
      case 2: // Challenges
        return challenges.length > 0;
        
      case 3: // Failed solutions (optional)
        return true;
        
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Determine cost type based on subscription type
      const costType = subscriptionType === 'Free version' ? 'free' :
                       subscriptionType === 'One-time purchase' ? 'one_time' :
                       'recurring'; // Monthly or Annual subscription
      
      // Prepare solution fields for storage using conditional pattern (like DosageForm)
      // Only include fields that have actual values to avoid undefined
      const solutionFields: Record<string, unknown> = {};
      
      // Add cost fields
      if (subscriptionType === 'Free version') {
        solutionFields.cost = 'Free';
        solutionFields.cost_type = 'free';
      } else if (cost) {
        solutionFields.cost = cost;
        solutionFields.cost_type = costType;
      }
      
      // Add other fields only if they have values
      if (timeToResults) solutionFields.time_to_results = timeToResults;
      if (usageFrequency) solutionFields.usage_frequency = usageFrequency;
      if (subscriptionType) solutionFields.subscription_type = subscriptionType;
      if (challenges && challenges.length > 0) solutionFields.challenges = challenges;
      // REMOVED from initial submission - platform and notes handled in success screen only

      // Prepare submission data (Apps don't have variants)
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

    const updateAdditionalInfo = async () => {
    // Prepare the additional fields to save
      const additionalFields: Record<string, unknown> = {};
    
    if (platform && platform.trim()) additionalFields.platform = platform.trim();
    if (notes && notes.trim()) additionalFields.notes = notes.trim();
    
    // Only proceed if there are fields to update
    if (Object.keys(additionalFields).length === 0) {
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
      case 1: // App details
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let's capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
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

            {/* App Details Section */}
            <div className="space-y-6">
              <FormSectionHeader 
                icon={CATEGORY_ICONS[category]} 
                title="App details"
              />
              
              {/* Usage frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How often do you use it? <span className="text-red-500">*</span>
                </label>
                <select
                  value={usageFrequency}
                  onChange={(e) => setUsageFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">Select frequency</option>
                  <option value="Multiple times daily">Multiple times daily</option>
                  <option value="Daily">Daily</option>
                  <option value="Few times a week">Few times a week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>

              {/* Subscription type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What version do you use? <span className="text-red-500">*</span>
                </label>
                <select
                  value={subscriptionType}
                  onChange={(e) => {
                    setSubscriptionType(e.target.value);
                    // Reset cost when subscription type changes
                    setCost('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">Select type</option>
                  <option value="Free version">Free version</option>
                  <option value="Monthly subscription">Monthly subscription</option>
                  <option value="Annual subscription">Annual subscription</option>
                  <option value="One-time purchase">One-time purchase</option>
                </select>
              </div>

              {/* Cost - conditional based on subscription type */}
              {subscriptionType && subscriptionType !== 'Free version' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             appearance-none"
                  >
                    <option value="">Select cost</option>
                    {subscriptionType === 'Monthly subscription' && (
                      <>
                        <option value="Under $5/month">Under $5/month</option>
                        <option value="$5-$9.99/month">$5-$9.99/month</option>
                        <option value="$10-$19.99/month">$10-$19.99/month</option>
                        <option value="$20-$49.99/month">$20-$49.99/month</option>
                        <option value="$50-$99.99/month">$50-$99.99/month</option>
                        <option value="$100+/month">$100+/month</option>
                      </>
                    )}
                    {subscriptionType === 'Annual subscription' && (
                      <>
                        <option value="Under $50/year">Under $50/year</option>
                        <option value="$50-$99.99/year">$50-$99.99/year</option>
                        <option value="$100-$199.99/year">$100-$199.99/year</option>
                        <option value="$200-$499.99/year">$200-$499.99/year</option>
                        <option value="$500-$999.99/year">$500-$999.99/year</option>
                        <option value="$1000+/year">$1000+/year</option>
                      </>
                    )}
                    {subscriptionType === 'One-time purchase' && (
                      <>
                        <option value="Under $5">Under $5</option>
                        <option value="$5-$9.99">$5-$9.99</option>
                        <option value="$10-$24.99">$10-$24.99</option>
                        <option value="$25-$49.99">$25-$49.99</option>
                        <option value="$50-$99.99">$50-$99.99</option>
                        <option value="$100-$249.99">$100-$249.99</option>
                        <option value="$250+">$250+</option>
                      </>
                    )}
                  </select>
                </div>
              )}
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
              <h2 className="text-xl font-semibold">Any challenges?</h2>
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
                    challenges.includes(challenge)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
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
                      ? 'border-blue-500 bg-blue-500'
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
              <button
                onClick={() => setShowCustomChallenge(true)}
                className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                          transition-all transform hover:scale-[1.02] border-dashed
                          border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-sm"
              >
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
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
            {challenges.filter(c => !challengeOptions.includes(c) && c !== 'None').length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
                <div className="flex flex-wrap gap-2">
                  {challenges.filter(c => !challengeOptions.includes(c) && c !== 'None').map((challenge) => (
                    <span key={challenge} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                                                 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {challenge}
                      <button
                        onClick={() => setChallenges(challenges.filter(c => c !== challenge))}
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
            {challenges.length > 0 && challenges[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
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
              <h2 className="text-xl font-semibold">What else did you try?</h2>
            </div>

            {/* Context card */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Help others by sharing what didn't work as well
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

          {/* Optional fields */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm"
              >
                <option value="">Select platform</option>
                <option value="iOS">iOS (iPhone/iPad)</option>
                <option value="Android">Android</option>
                <option value="Web">Web/Browser</option>
                <option value="Windows">Windows</option>
                <option value="Mac">Mac</option>
                <option value="Cross-platform">Multiple platforms</option>
                <option value="Chrome Extension">Chrome Extension</option>
                <option value="Other">Other</option>
              </select>
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         appearance-none text-sm"
              />
              
              {(platform || notes) && (
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

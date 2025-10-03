'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/database/client'; // Removed: unused after migrating to server actions
import { ChevronLeft, Check } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared/';
import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';
import { updateSolutionFields } from '@/app/actions/update-solution-fields';
import { useFormBackup } from '@/lib/hooks/useFormBackup';
import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options';

interface HobbyFormProps {
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
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [communityName, setCommunityName] = useState('');
  const [notes, setNotes] = useState('');

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

  // Hobby-specific challenge options
  const challengeOptions = DROPDOWN_OPTIONS.hobby_challenges ?? ['None'];

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
    setIsSubmitting(true);
    
    try {
      // Prepare solution fields for storage
      // Primary cost field for cross-category filtering
      const hasUnknownCost = ongoingCost === "Don't remember" || startupCost === "Don't remember";
      const primaryCost = hasUnknownCost ? "Unknown" : 
                          ongoingCost && ongoingCost !== "Free/No ongoing cost" ? ongoingCost :
                          startupCost && startupCost !== "Free/No startup cost" ? startupCost : 
                          "Free";
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
            
            {/* Quick context card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let&apos;s capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
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

              {/* Time to enjoyment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    How long until you enjoyed it?
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
                  <option value="Still learning">Still learning to enjoy it</option>
                </select>
              </div>
            </div>

            {/* Visual separator */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">then</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>

            {/* Hobby Context */}
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Hobby/Activity:</strong> Something you do for fun, personal growth, or creative expression (not fitness-related)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Examples: painting, gardening, playing guitar, coding, bird watching, woodworking
                  </p>
                </div>
              </div>
            </div>

            {/* Hobby Details Section */}
            <div className="space-y-6">
              <FormSectionHeader 
                icon={CATEGORY_ICONS[category]} 
                title="Hobby details"
              />
              
              {/* Initial/Startup Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial startup cost <span className="text-red-500">*</span>
                </label>
                <select
                  value={startupCost}
                  onChange={(e) => setStartupCost(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">Select startup cost</option>
                  <option value="Free/No startup cost">Free/No startup cost</option>
                  <option value="Don't remember">Don't remember</option>
                  <option value="Under $50">Under $50</option>
                  <option value="$50-$100">$50-$100</option>
                  <option value="$100-$250">$100-$250</option>
                  <option value="$250-$500">$250-$500</option>
                  <option value="$500-$1,000">$500-$1,000</option>
                  <option value="$1,000-$2,500">$1,000-$2,500</option>
                  <option value="$2,500-$5,000">$2,500-$5,000</option>
                  <option value="Over $5,000">Over $5,000</option>
                </select>
              </div>

              {/* Ongoing Monthly Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Typical monthly cost <span className="text-red-500">*</span>
                </label>
                <select
                  value={ongoingCost}
                  onChange={(e) => setOngoingCost(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">Select monthly cost</option>
                  <option value="Free/No ongoing cost">Free/No ongoing cost</option>
                  <option value="Don't remember">Don't remember</option>
                  <option value="Under $25/month">Under $25/month</option>
                  <option value="$25-$50/month">$25-$50/month</option>
                  <option value="$50-$100/month">$50-$100/month</option>
                  <option value="$100-$200/month">$100-$200/month</option>
                  <option value="$200-$500/month">$200-$500/month</option>
                  <option value="Over $500/month">Over $500/month</option>
                </select>
              </div>

              {/* Time commitment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time per session? <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           appearance-none"
                >
                  <option value="">Select time</option>
                  <option value="15-30 minutes">15-30 minutes</option>
                  <option value="30-60 minutes">30-60 minutes</option>
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="2-4 hours">2-4 hours</option>
                  <option value="Half day">Half day</option>
                  <option value="Full day">Full day</option>
                  <option value="Varies significantly">Varies significantly</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How often do you do it? <span className="text-red-500">*</span>
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
                  <option value="Daily">Daily</option>
                  <option value="Few times a week">Few times a week</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Few times a month">Few times a month</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Occasionally">Occasionally</option>
                </select>
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
              <h2 className="text-xl font-semibold">Any challenges?</h2>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what obstacles to expect
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
              {!showCustomChallenge && (
                <button
                  onClick={() => setShowCustomChallenge(true)}
                  className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                            transition-all transform hover:scale-[1.02] border-dashed
                            border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-sm"
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
            Your experience with {solutionName} has been recorded
          </p>

          {/* Optional fields */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Community or group name"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <textarea
                placeholder="What do others need to know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(communityName || notes) && (
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

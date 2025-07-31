// components/solutions/forms/LifestyleForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';

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
  
  // Step 1 fields - Universal + Required fields
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costImpact, setCostImpact] = useState('');
  const [weeklyPrepTime, setWeeklyPrepTime] = useState('');
  const [adjustmentPeriod, setAdjustmentPeriod] = useState('');
  const [longTermSustainability, setLongTermSustainability] = useState('');
  const [previousSleepHours, setPreviousSleepHours] = useState('');
  
  // Step 2 fields - Challenges
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [socialImpact, setSocialImpact] = useState('');
  const [sleepQualityChange, setSleepQualityChange] = useState('');
  const [specificApproach, setSpecificApproach] = useState('');
  const [resources, setResources] = useState('');
  const [tips, setTips] = useState('');

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Load challenge options
  useEffect(() => {
    const fetchOptions = async () => {
      // Fallback challenge options for categories
      const fallbackChallenges: Record<string, string[]> = {
        diet_nutrition: [
          'Meal planning time',
          'Higher grocery costs',
          'Social situations difficult',
          'Cravings/temptations',
          'Family not supportive',
          'Limited food options',
          'Cooking skills needed',
          'Travel/eating out challenges',
          'Energy dips initially',
          'Digestive adjustment',
          'None'
        ],
        sleep: [
          'Hard to maintain schedule',
          "Partner's different schedule",
          'Work/family conflicts',
          'Too restrictive',
          'Anxiety about sleep',
          'Physical discomfort',
          'Missing late night activities',
          'Inconsistent results',
          'Felt worse initially',
          'Environmental factors (noise, light)',
          'None'
        ]
      };
      
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data && data.length > 0) {
        setChallengeOptions(data.map((item: { label: string }) => item.label));
      } else if (fallbackChallenges[category]) {
        // Use fallback if no data in DB
        setChallengeOptions(fallbackChallenges[category]);
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
      case 1: // Universal + Required fields
        const universalValid = effectiveness !== null && timeToResults !== '' && costImpact !== '' && adjustmentPeriod !== '' && longTermSustainability !== '';
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
      // TODO: Main solution submission logic here
      console.log('TODO: Add main submission logic');
      
      // Submit failed solution ratings for existing solutions
      for (const failed of failedSolutions) {
        if (failed.id) {
          // This is an existing solution - create a rating for it
          await supabase.rpc('create_failed_solution_rating', {
            p_solution_id: failed.id,
            p_goal_id: goalId,
            p_user_id: userId,
            p_rating: failed.rating,
            p_solution_name: failed.name
          });
        }
      }
      
      // Store non-existing failed solutions as text in implementation
      const textOnlyFailed = failedSolutions
        .filter(f => !f.id)
        .map(f => ({ name: f.name, rating: f.rating }));
      
      console.log('Submitting:', {
        solutionName,
        effectiveness,
        costImpact,
        weeklyPrepTime,
        adjustmentPeriod,
        longTermSustainability,
        previousSleepHours,
        challenges: selectedChallenges,
        failedSolutionsWithRatings: failedSolutions.filter(f => f.id),
        failedSolutionsTextOnly: textOnlyFailed
      });
      
      // Show success screen instead of redirecting
      setShowSuccessScreen(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdditionalInfo = async () => {
    // TODO: Update the solution with additional info
    console.log('Updating additional info:', { socialImpact, sleepQualityChange, specificApproach, resources, tips });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Universal + Required fields
        return (
          <div className="space-y-8 animate-slide-in">
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
                           dark:bg-gray-800 dark:text-white transition-all"
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
                <h2 className="text-xl font-semibold">Key details</h2>
              </div>

              {/* Cost Impact */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost impact? <span className="text-red-500">*</span>
                </label>
                <select
                  value={costImpact}
                  onChange={(e) => setCostImpact(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
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
                      <option value="Under $50 one-time">Under $50 one-time</option>
                      <option value="$50-200 one-time">$50-200 one-time</option>
                      <option value="Over $200 one-time">Over $200 one-time</option>
                      <option value="Ongoing costs">Ongoing costs (please describe)</option>
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
                             dark:bg-gray-800 dark:text-white"
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
                             dark:bg-gray-800 dark:text-white"
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

              {/* Adjustment Period */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adjustment period <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustmentPeriod}
                  onChange={(e) => setAdjustmentPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">{category === 'diet_nutrition' ? "Time to feel comfortable with change" : "Time to adjust to new routine"}</option>
                  {category === 'diet_nutrition' ? (
                    <>
                      <option value="No adjustment needed">No adjustment needed</option>
                      <option value="A few days">A few days</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="2-4 weeks">2-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="Over 2 months">Over 2 months</option>
                      <option value="Still adjusting">Still adjusting</option>
                    </>
                  ) : (
                    <>
                      <option value="Immediate improvement">Immediate improvement</option>
                      <option value="A few days">A few days</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="Over a month">Over a month</option>
                      <option value="Never fully adjusted">Never fully adjusted</option>
                    </>
                  )}
                </select>
              </div>

              {/* Long-term Sustainability */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Long-term sustainability <span className="text-red-500">*</span>
                </label>
                <select
                  value={longTermSustainability}
                  onChange={(e) => setLongTermSustainability(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">How sustainable was it?</option>
                  <option value="Still maintaining">Still maintaining</option>
                  <option value="Maintained for years">Maintained for years</option>
                  <option value="Maintained 6-12 months">Maintained 6-12 months</option>
                  <option value="Maintained 3-6 months">Maintained 3-6 months</option>
                  <option value="Maintained 1-3 months">Maintained 1-3 months</option>
                  <option value="Stopped within a month">Stopped within a month</option>
                  <option value="Modified but continued">Modified but continued</option>
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

            {/* Selected count indicator */}
            {selectedChallenges.length > 0 && selectedChallenges[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {selectedChallenges.length} selected
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
            Your experience with {solutionName} has been recorded
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
                             dark:bg-gray-700 dark:text-white text-sm"
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
                             dark:bg-gray-700 dark:text-white text-sm"
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

              <input
                type="text"
                placeholder="Specific approach or method"
                value={specificApproach}
                onChange={(e) => setSpecificApproach(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />

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
                placeholder="Any tips, warnings, or anything else that might help others?"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(socialImpact || sleepQualityChange || specificApproach || resources || tips) && (
                <button
                  onClick={updateAdditionalInfo}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         text-sm font-medium transition-colors"
                >
                  Save additional details
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

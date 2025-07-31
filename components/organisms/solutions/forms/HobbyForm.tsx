// components/solutions/forms/HobbyForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check, X, Plus } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';

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

export function HobbyForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: HobbyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  
  // Step 1 fields - Hobby details
  const [timeCommitment, setTimeCommitment] = useState('');
  const [startupCost, setStartupCost] = useState('');
  const [ongoingCost, setOngoingCost] = useState('');
  const [timeToEnjoyment, setTimeToEnjoyment] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  
  // Step 2 fields - Barriers
  const [barriers, setBarriers] = useState<string[]>(['None']);
  const [customBarrier, setCustomBarrier] = useState('');
  const [showCustomBarrier, setShowCustomBarrier] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [skillLevel, setSkillLevel] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

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


  // Hobby-specific barrier options
  const barrierOptions = [
    'None',
    'Initial skill required',
    'Equipment costs',
    'Finding time',
    'Space requirements',
    'Weather dependent',
    'Need others to participate',
    'Physical limitations',
    'Access to facilities',
    'Learning curve',
    'Transportation needed',
    'Seasonal limitations'
  ];

  const handleBarrierToggle = (barrier: string) => {
    if (barrier === 'None') {
      setBarriers(['None']);
    } else {
      if (barriers.includes(barrier)) {
        setBarriers(barriers.filter(b => b !== barrier));
      } else {
        setBarriers(barriers.filter(b => b !== 'None').concat(barrier));
      }
    }
  };

  const addCustomBarrier = () => {
    if (customBarrier.trim()) {
      setBarriers(barriers.filter(b => b !== 'None').concat(customBarrier.trim()));
      setCustomBarrier('');
      setShowCustomBarrier(false);
    }
  };


  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Hobby details
        return timeCommitment !== '' && startupCost !== '' && ongoingCost !== '' && 
               timeToEnjoyment !== '' && effectiveness !== null;
        
      case 2: // Barriers
        return barriers.length > 0;
        
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
        timeCommitment,
        startupCost,
        ongoingCost,
        timeToEnjoyment,
        barriers,
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
    // TODO: Update the solution with skill level and other info
    console.log('Updating additional info:', { skillLevel, otherInfo });
  };

  const getFieldCompletion = () => {
    switch (currentStep) {
      case 1:
        return {
          timeCommitment: timeCommitment !== '',
          startupCost: startupCost !== '',
          ongoingCost: ongoingCost !== '',
          timeToEnjoyment: timeToEnjoyment !== ''
        };
      
      case 2:
        return {
          barriers: barriers.length > 0
        };
        
      case 3:
        return {
          optional: true
        };
        
      default:
        return {};
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Hobby details
        return (
          <div className="space-y-8 animate-slide-in">
            {/* Quick context card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let's capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            {/* Hobby Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎨</span>
                </div>
                <h2 className="text-xl font-semibold">Hobby details</h2>
              </div>
              
              {/* Time commitment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How much time per week? <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select time per week</option>
                  <option value="Less than 1 hour/week">Less than 1 hour/week</option>
                  <option value="1-3 hours/week">1-3 hours/week</option>
                  <option value="3-5 hours/week">3-5 hours/week</option>
                  <option value="5-10 hours/week">5-10 hours/week</option>
                  <option value="10-15 hours/week">10-15 hours/week</option>
                  <option value="15-20 hours/week">15-20 hours/week</option>
                  <option value="20-30 hours/week">20-30 hours/week</option>
                  <option value="30+ hours/week">30+ hours/week</option>
                </select>
              </div>

              {/* Cost fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  What did it cost? <span className="text-red-500">*</span>
                </h3>
                
                {/* Startup cost */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Initial startup cost
                  </label>
                  <select
                    value={startupCost}
                    onChange={(e) => setStartupCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select startup cost</option>
                    <option value="Free/No startup cost">Free/No startup cost</option>
                    <option value="Under $50">Under $50</option>
                    <option value="$50-$99.99">$50-$99.99</option>
                    <option value="$100-$249.99">$100-$249.99</option>
                    <option value="$250-$499.99">$250-$499.99</option>
                    <option value="$500-$999.99">$500-$999.99</option>
                    <option value="$1000-$2499.99">$1000-$2499.99</option>
                    <option value="$2500+">$2500+</option>
                  </select>
                </div>

                {/* Ongoing cost */}
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Monthly ongoing cost
                  </label>
                  <select
                    value={ongoingCost}
                    onChange={(e) => setOngoingCost(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select ongoing cost</option>
                    <option value="Free/No ongoing cost">Free/No ongoing cost</option>
                    <option value="Under $10/month">Under $10/month</option>
                    <option value="$10-$24.99/month">$10-$24.99/month</option>
                    <option value="$25-$49.99/month">$25-$49.99/month</option>
                    <option value="$50-$99.99/month">$50-$99.99/month</option>
                    <option value="$100-$199.99/month">$100-$199.99/month</option>
                    <option value="$200+/month">$200+/month</option>
                  </select>
                </div>
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
                  <span className="text-lg">😊</span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    When did it become enjoyable?
                  </label>
                </div>
                <select
                  value={timeToEnjoyment}
                  onChange={(e) => setTimeToEnjoyment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white transition-all"
                >
                  <option value="">Select timeframe</option>
                  <option value="Immediately enjoyable">Immediately enjoyable</option>
                  <option value="Within first week">Within first week</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="Took persistence">Took persistence</option>
                </select>
              </div>
            </div>

            {/* Field completion dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Object.entries(getFieldCompletion()).map(([field, completed]) => (
                <div
                  key={field}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    completed ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        );

      case 2: // Barriers
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🚧</span>
              </div>
              <h2 className="text-xl font-semibold">Any barriers?</h2>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 This helps others know what challenges to expect
              </p>
            </div>

            {/* Barriers grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {barrierOptions.map((barrier) => (
                <label
                  key={barrier}
                  className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                            transition-all transform hover:scale-[1.02] ${
                    barriers.includes(barrier)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={barriers.includes(barrier)}
                    onChange={() => handleBarrierToggle(barrier)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 
                                transition-all ${
                    barriers.includes(barrier)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {barriers.includes(barrier) && (
                      <Check className="w-3 h-3 text-white animate-scale-in" />
                    )}
                  </div>
                  <span className="text-sm">{barrier}</span>
                </label>
              ))}
              
              {/* Add Other button */}
              <button
                onClick={() => setShowCustomBarrier(true)}
                className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                          transition-all transform hover:scale-[1.02] border-dashed
                          border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-sm"
              >
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                  Add other barrier
                </span>
              </button>
            </div>

            {/* Custom barrier input */}
            {showCustomBarrier && (
              <div className="mt-3 flex gap-2 animate-fade-in">
                <input
                  type="text"
                  value={customBarrier}
                  onChange={(e) => setCustomBarrier(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomBarrier()}
                  placeholder="Describe the barrier"
                  className="flex-1 px-3 py-2 border border-blue-500 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={addCustomBarrier}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomBarrier(false);
                    setCustomBarrier('');
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Show custom barriers */}
            {barriers.filter(b => !barrierOptions.includes(b) && b !== 'None').length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
                <div className="flex flex-wrap gap-2">
                  {barriers.filter(b => !barrierOptions.includes(b) && b !== 'None').map((barrier) => (
                    <span key={barrier} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                                                 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {barrier}
                      <button
                        onClick={() => setBarriers(barriers.filter(b => b !== barrier))}
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
            {barriers.length > 0 && barriers[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {barriers.length} selected
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
            Your experience with {solutionName} has been recorded
          </p>

          {/* Optional fields */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Current skill level</option>
                <option value="Still beginner">Still beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              
              <textarea
                placeholder="Any tips for beginners? What resources helped you learn?"
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(skillLevel || otherInfo) && (
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

// CSS animations to add to your global CSS file:
const animationStyles = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.3s ease-out; }
.animate-bounce-in { animation: bounce-in 0.4s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-bounce-right { animation: bounce-right 1s ease-in-out infinite; }
`;
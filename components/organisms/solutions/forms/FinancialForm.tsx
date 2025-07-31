'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';

interface FinancialFormProps {
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

export function FinancialForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: FinancialFormProps) {
  console.log('FinancialForm initialized with solution:', existingSolutionId || 'new');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  
  // Step 1 fields - Required fields + effectiveness + TTR
  const [costType, setCostType] = useState('');
  const [financialBenefit, setFinancialBenefit] = useState('');
  const [accessTime, setAccessTime] = useState('');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');

  // Step 2 fields - Barriers
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>(['None']);
  const [loading, setLoading] = useState(true);
  const [barrierOptions, setBarrierOptions] = useState<string[]>([]);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [provider, setProvider] = useState('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(['None']);
  const [easeOfUse, setEaseOfUse] = useState('');

  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

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

  // Load barrier options
  useEffect(() => {
    const fetchOptions = async () => {
      // Fallback barrier options for financial products
      const fallbackBarriers: string[] = [
        'Credit score too low',
        'Income requirements not met',
        'Complex application process',
        'High minimum balance',
        'Documentation requirements',
        'Geographic restrictions',
        'Age restrictions',
        'Citizenship/residency requirements',
        'Hidden fees discovered',
        'Poor customer service',
        'Technical issues with platform',
        'None'
      ];
      
      const { data, error } = await supabase
        .from('challenge_options')
        .select('label')
        .eq('category', 'financial_products')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data && data.length > 0) {
        setBarrierOptions(data.map((item: { label: string }) => item.label));
      } else {
        // Use fallback if no data in DB
        setBarrierOptions(fallbackBarriers);
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, []);

  const handleRequirementToggle = (requirement: string) => {
    if (requirement === 'None') {
      setSelectedRequirements(['None']);
    } else {
      setSelectedRequirements(prev => {
        const filtered = prev.filter(r => r !== 'None');
        if (prev.includes(requirement)) {
          const newRequirements = filtered.filter(r => r !== requirement);
          return newRequirements.length === 0 ? ['None'] : newRequirements;
        }
        return [...filtered, requirement];
      });
    }
  };

  const handleBarrierToggle = (barrier: string) => {
    if (barrier === 'None') {
      setSelectedBarriers(['None']);
    } else {
      setSelectedBarriers(prev => {
        const filtered = prev.filter(b => b !== 'None');
        if (prev.includes(barrier)) {
          const newBarriers = filtered.filter(b => b !== barrier);
          return newBarriers.length === 0 ? ['None'] : newBarriers;
        }
        return [...filtered, barrier];
      });
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Required fields + effectiveness + TTR
        return costType !== '' && 
               financialBenefit !== '' && 
               accessTime !== '' && 
               effectiveness !== null && 
               timeToResults !== '';
        
      case 2: // Barriers
        return selectedBarriers.length > 0;
        
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
        costType,
        financialBenefit,
        accessTime,
        barriers: selectedBarriers,
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
    // TODO: Update the solution with provider, requirements, and ease of use
    console.log('Updating additional info:', { provider, selectedRequirements, easeOfUse });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Required fields + Effectiveness + TTR
        return (
          <div className="space-y-8 animate-slide-in">
            {/* Quick context card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Let&apos;s capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            {/* Category clarification */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                <strong>Financial Products:</strong> Budgeting tools, investment platforms, 
                savings accounts, credit cards, debt management solutions, financial apps, 
                or any product/service that helps with money management
              </p>
            </div>

            {/* Required fields section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <h2 className="text-xl font-semibold">Product details</h2>
              </div>
              
              {/* Cost Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost type? <span className="text-red-500">*</span>
                </label>
                <select
                  value={costType}
                  onChange={(e) => setCostType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white transition-all"
                >
                  <option value="">Select cost type</option>
                  <option value="Free">Free to use</option>
                  <option value="Subscription fee">Subscription fee</option>
                  <option value="Transaction fees">Transaction/usage fees</option>
                  <option value="Interest charged">Interest charged (loans/credit)</option>
                  <option value="Account fees">Account maintenance fees</option>
                  <option value="One-time fee">One-time purchase/setup fee</option>
                </select>
              </div>

              {/* Financial Benefit */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Financial benefit? <span className="text-red-500">*</span>
                </label>
                <select
                  value={financialBenefit}
                  onChange={(e) => setFinancialBenefit(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white transition-all"
                >
                  <option value="">Savings or earnings</option>
                  <option value="No direct financial benefit">No direct financial benefit</option>
                  <option value="Under $25/month saved/earned">Under $25/month saved/earned</option>
                  <option value="$25-100/month saved/earned">$25-100/month saved/earned</option>
                  <option value="$100-250/month saved/earned">$100-250/month saved/earned</option>
                  <option value="$250-500/month saved/earned">$250-500/month saved/earned</option>
                  <option value="$500-1000/month saved/earned">$500-1000/month saved/earned</option>
                  <option value="Over $1000/month saved/earned">Over $1000/month saved/earned</option>
                  <option value="Varies significantly">Varies significantly (explain in notes)</option>
                </select>
              </div>

              {/* Access time */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Access time <span className="text-red-500">*</span>
                </label>
                <select
                  value={accessTime}
                  onChange={(e) => setAccessTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white transition-all"
                >
                  <option value="">How quickly available?</option>
                  <option value="Instant approval">Instant approval</option>
                  <option value="Same day">Same day</option>
                  <option value="1-3 business days">1-3 business days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="Over a month">Over a month</option>
                </select>
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
          </div>
        );

      case 2: // Barriers only
        return (
          <div className="space-y-6 animate-slide-in">
            <ProgressCelebration step={currentStep} />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🚧</span>
              </div>
              <h2 className="text-xl font-semibold">Any barriers encountered?</h2>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 Help others by sharing what challenges you faced
              </p>
            </div>

            {/* Barriers grid */}
            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {barrierOptions.map((barrier) => (
                  <label
                    key={barrier}
                    className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                              transition-all transform hover:scale-[1.02] ${
                      selectedBarriers.includes(barrier)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBarriers.includes(barrier)}
                      onChange={() => handleBarrierToggle(barrier)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 
                                  transition-all ${
                      selectedBarriers.includes(barrier)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }`}>
                      {selectedBarriers.includes(barrier) && (
                        <Check className="w-3 h-3 text-white animate-scale-in" />
                      )}
                    </div>
                    <span className="text-sm">{barrier}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Selected count indicator */}
            {selectedBarriers.length > 0 && selectedBarriers[0] !== 'None' && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                               text-blue-700 dark:text-blue-300 rounded-full text-sm animate-fade-in">
                  <Check className="w-4 h-4" />
                  {selectedBarriers.length} selected
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
              <input
                type="text"
                placeholder="Provider/Company name"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />

              {/* Minimum Requirements */}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Minimum requirements</label>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {[
                    'None',
                    'Bank account required',
                    'Minimum balance ($500+)',
                    'Minimum balance ($1000+)',
                    'Minimum balance ($5000+)',
                    'Good credit (650+)',
                    'Excellent credit (750+)',
                    'Proof of income',
                    'Business entity',
                    'Collateral required',
                    'Age 18+ required',
                    'US citizenship/residency',
                    'Other requirements'
                  ].map((requirement) => (
                    <label key={requirement} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRequirements.includes(requirement)}
                        onChange={() => handleRequirementToggle(requirement)}
                        className="w-3 h-3"
                      />
                      <span>{requirement}</span>
                    </label>
                  ))}
                </div>
              </div>

              <select
                value={easeOfUse}
                onChange={(e) => setEaseOfUse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Ease of use</option>
                <option value="Very easy">Very easy</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Complex">Complex</option>
                <option value="Very complex">Very complex</option>
              </select>
              
              {(provider || selectedRequirements.length > 1 || selectedRequirements[0] !== 'None' || easeOfUse) && (
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check, X, Plus } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Checkbox } from '@/components/atoms/checkbox';
import { SolutionCategory } from '@/lib/forms/templates';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';

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

export function CommunityForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: CommunityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  
  // Step 1 fields - Universal + Category-specific
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costRange, setCostRange] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('');
  const [format, setFormat] = useState('');
  const [groupSize, setGroupSize] = useState('');
  
  // Step 2 fields - Challenges array
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['None']);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [groupName, setGroupName] = useState('');
  const [location, setLocation] = useState('');
  const [howToJoin, setHowToJoin] = useState('');
  const [commitmentType, setCommitmentType] = useState('');
  const [accessibilityLevel, setAccessibilityLevel] = useState('');
  const [leadershipStyle, setLeadershipStyle] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  const supabaseClient = createClientComponentClient();
  
  // Progress indicator
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;
  
  // Get category display name
  const getCategoryDisplay = () => {
    return category === 'support_groups' ? 'Support Group' : 'Community/Group';
  };
  
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
      // Fallback challenge options for categories
      const fallbackChallenges: Record<string, string[]> = {
        support_groups: [
          'Inconsistent attendance',
          'Group dynamics issues',
          'Not enough structure',
          'Too much structure',
          'Facilitator quality varies',
          'Hard to share openly',
          'Triggering content from others',
          'Time conflicts',
          'Cliques or exclusion',
          'Not the right fit',
          'None'
        ],
        groups_communities: [
          'Hard to break in socially',
          'Activity level inconsistent',
          'Leadership issues',
          'Drama or conflicts',
          'Time commitment too high',
          'Location/meeting challenges',
          'Cost of activities',
          'Age/demographic mismatch',
          'Too competitive/not competitive enough',
          'Communication gaps',
          'None'
        ]
      };
      
      const { data, error } = await supabaseClient
        .from('challenge_options')
        .select('label')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data && data.length > 0) {
        setChallengeOptions(data.map(item => item.label));
      } else if (fallbackChallenges[category]) {
        // Use fallback if no data in DB
        setChallengeOptions(fallbackChallenges[category]);
      }
      setLoading(false);
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
    setIsSubmitting(true);
    
    try {
      // TODO: Submit implementation
      console.log('Submitting community form with:', {
        effectiveness,
        timeToResults,
        costRange,
        meetingFrequency,
        format,
        groupSize,
        challenges: selectedChallenges,
        failedSolutions
      });
      
      // Submit failed solution ratings
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
      
      setShowSuccessScreen(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateAdditionalInfo = async () => {
    // TODO: Update additional info
    console.log('Updating additional info:', { 
      groupName, 
      location, 
      howToJoin,
      commitmentType,
      accessibilityLevel,
      leadershipStyle,
      additionalInfo 
    });
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
      <div className="space-y-8 animate-slide-in">
        {/* Quick context card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                      border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Let&apos;s capture how <strong>{solutionName}</strong> worked for <strong>{goalTitle}</strong>
          </p>
        </div>

        {/* Category-specific description */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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

        {/* Category-specific fields */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{getCategoryDisplay()} details</h2>

          {/* Cost field */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Cost? <span className="text-red-500">*</span>
            </Label>
            <Select value={costRange} onValueChange={setCostRange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select cost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Donation-based">Donation-based</SelectItem>
                <SelectItem value="Under $20/meeting">Under $20/meeting</SelectItem>
                <SelectItem value="$20-50/meeting">$20-50/meeting</SelectItem>
                <SelectItem value="Under $20/month">Under $20/month</SelectItem>
                <SelectItem value="$20-50/month">$20-50/month</SelectItem>
                <SelectItem value="$50-100/month">$50-100/month</SelectItem>
                <SelectItem value="Over $100/month">Over $100/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meeting frequency */}
          <div>
            <Label htmlFor="meeting_frequency">
              Meeting frequency <span className="text-red-500">*</span>
            </Label>
            <Select value={meetingFrequency} onValueChange={setMeetingFrequency} required>
              <SelectTrigger>
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
          </div>

          {/* Format */}
          <div>
            <Label htmlFor="format">
              Format <span className="text-red-500">*</span>
            </Label>
            <Select value={format} onValueChange={setFormat} required>
              <SelectTrigger>
                <SelectValue placeholder="Meeting format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-person only">In-person only</SelectItem>
                <SelectItem value="Online only">Online only</SelectItem>
                <SelectItem value="Hybrid (both)">Hybrid (both)</SelectItem>
                <SelectItem value="Phone/Conference call">Phone/Conference call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group size */}
          <div>
            <Label htmlFor="group_size">
              Group size <span className="text-red-500">*</span>
            </Label>
            <Select value={groupSize} onValueChange={setGroupSize} required>
              <SelectTrigger>
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
  };
  
  const renderStepThree = () => {
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
                placeholder="Group/Community name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <input
                type="text"
                placeholder="Location (city, online platform, etc.)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <input
                type="text"
                placeholder="How to join (website, contact info, etc.)"
                value={howToJoin}
                onChange={(e) => setHowToJoin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              <select
                value={commitmentType}
                onChange={(e) => setCommitmentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
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
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
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
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white text-sm"
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
                placeholder="Any additional info that might help others?"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(groupName || location || howToJoin || commitmentType || accessibilityLevel || leadershipStyle || additionalInfo) && (
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
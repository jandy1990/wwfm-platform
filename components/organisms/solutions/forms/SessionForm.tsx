'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/client';
import { ChevronLeft, Check, Plus, X } from 'lucide-react';
import { FailedSolutionsPicker } from '@/components/organisms/solutions/FailedSolutionsPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { COST_RANGES } from '@/lib/forms/templates';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Skeleton } from '@/components/atoms/skeleton';
import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [highestStepReached, setHighestStepReached] = useState(1);
  
  // Step 1 fields - Universal + Category-specific
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  const [costType, setCostType] = useState<'per_session' | 'monthly' | 'total'>('per_session');
  const [costRange, setCostRange] = useState('');
  const [sessionFrequency, setSessionFrequency] = useState('');
  const [format, setFormat] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [insuranceCoverage, setInsuranceCoverage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [responseTime, setResponseTime] = useState('');
  
  // Step 2 fields - Arrays (side effects or barriers)
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['None']);
  const [sideEffectOptions, setSideEffectOptions] = useState<string[]>([]);
  const [customSideEffect, setCustomSideEffect] = useState('');
  const [showCustomSideEffect, setShowCustomSideEffect] = useState(false);
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>(['None']);
  const [barrierOptions, setBarrierOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [barriersLoading, setBarriersLoading] = useState(true);
  const [customBarrier, setCustomBarrier] = useState('');
  const [showCustomBarrier, setShowCustomBarrier] = useState(false);
  
  // Step 3 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  
  // Optional fields (Success screen)
  const [completedTreatment, setCompletedTreatment] = useState('');
  const [typicalLength, setTypicalLength] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // const supabaseClient = createClientComponentClient();
  
  // Only show side effects for medical procedures and alternative practitioners
  const showSideEffects = ['medical_procedures', 'alternative_practitioners'].includes(category);
  
  // Show barriers for therapists, coaches, doctors, professional services, and crisis resources
  const showBarriers = ['therapists_counselors', 'coaches_mentors', 'doctors_specialists', 'professional_services', 'crisis_resources'].includes(category);
  
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
  
  useEffect(() => {
    if (showSideEffects) {
      setLoading(true);
      const fetchOptions = async () => {
        const { data, error } = await supabase
          .from('side_effect_options')
          .select('label')
          .eq('category', category)
          .eq('is_active', true)
          .order('display_order');
        
        if (!error && data) {
          setSideEffectOptions(data.map(item => item.label));
        }
        setLoading(false);
      };
      
      fetchOptions();
    }
  }, [category, showSideEffects]);
  
  useEffect(() => {
    if (showBarriers) {
      setBarriersLoading(true);
      
      // Fallback barrier options for categories that might not be in DB yet
      const fallbackBarriers: Record<string, string[]> = {
        professional_services: [
          'Finding the right professional',
          'High cost',
          'Limited availability',
          'Not covered by insurance',
          'Unclear about what I need',
          'Too many options to choose from',
          'Scheduling conflicts',
          'Location/distance issues',
          'Communication style mismatch',
          'Didn\'t see results quickly enough',
          'Service quality inconsistent',
          'Contract/Commitment requirements',
          'None'
        ],
        coaches_mentors: [
          'Finding the right coach',
          'High cost',
          'No insurance coverage', 
          'Hard to verify credentials',
          'Too pushy or sales-focused',
          'Chemistry/personality mismatch',
          'Scheduling conflicts',
          'Time zone differences',
          'Unclear what to look for',
          'Results vary widely',
          'Time commitment required',
          'Contract/package pressure',
          'Other (please describe)',
          'None'
        ],
        doctors_specialists: [
          'Finding the right doctor',
          'High cost',
          'Insurance issues',
          'Long wait times for appointments',
          'Long wait times in office/clinic',
          'Limited availability',
          'Communication issues',
          'Didn\'t feel heard',
          'Rushed appointments',
          'Location/distance',
          'Referral required',
          'Other (please describe)',
          'None'
        ],
        crisis_resources: [
          'Long wait times',
          'Difficulty getting through',
          'Not the right type of help',
          'Felt judged or dismissed',
          'Language barriers',
          'Technical issues with platform',
          'Limited hours of operation',
          'Needed different level of care',
          'Privacy concerns',
          'None'
        ]
      };
      
      const fetchBarriers = async () => {
        const { data, error } = await supabase
          .from('challenge_options')
          .select('label')
          .eq('category', category)
          .eq('is_active', true)
          .order('display_order');
        
        if (!error && data && data.length > 0) {
          setBarrierOptions(data.map(item => item.label));
        } else if (fallbackBarriers[category]) {
          // Use fallback if no data in DB
          setBarrierOptions(fallbackBarriers[category]);
        }
        setBarriersLoading(false);
      };
      
      fetchBarriers();
    }
  }, [category, showBarriers]);
  
  const handleSideEffectToggle = (effect: string) => {
    if (effect === 'None') {
      setSelectedSideEffects(['None']);
      setShowCustomSideEffect(false);
    } else if (effect === 'Other (please describe)') {
      // Toggle the text input visibility
      if (selectedSideEffects.includes(effect)) {
        setSelectedSideEffects(prev => prev.filter(e => e !== effect));
        setShowCustomSideEffect(false);
        setCustomSideEffect('');
      } else {
        setSelectedSideEffects(prev => [...prev.filter(e => e !== 'None'), effect]);
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

  const addCustomBarrier = () => {
    if (customBarrier.trim()) {
      setSelectedBarriers(selectedBarriers.filter(b => b !== 'None').concat(customBarrier.trim()));
      setCustomBarrier('');
      setShowCustomBarrier(false);
    }
  };

  // Different cost options for different categories
  const getCostOptions = () => {
    if (category === 'crisis_resources') {
      return ['Free', 'Donation-based', 'Sliding scale'];
    }
    if (category === 'medical_procedures') {
      // Handle all three cost types for medical procedures
      if (costType === 'total') {
        return COST_RANGES.one_time;  // For total cost of procedure
      } else if (costType === 'per_session') {
        return COST_RANGES.per_session;  // For per session costs
      } else {
        return COST_RANGES.monthly;  // For monthly costs
      }
    }
    return COST_RANGES[costType as keyof typeof COST_RANGES] || COST_RANGES.per_session;
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

        {/* Category-specific fields */}
        <div className="space-y-6">
          <FormSectionHeader 
            icon={CATEGORY_ICONS[category]} 
            title="Session details"
          />

      {/* Cost field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cost? <span className="text-red-500">*</span>
        </label>
        
        {category !== 'crisis_resources' && (
          <RadioGroup value={costType} onValueChange={(value) => setCostType(value as 'per_session' | 'monthly' | 'total')}>
            <div className="flex gap-4">
              <div className="flex items-center">
                <RadioGroupItem value="per_session" id="per_session" />
                <label htmlFor="per_session" className="ml-2">Per session</label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="monthly" id="monthly" />
                <label htmlFor="monthly" className="ml-2">Monthly</label>
              </div>
              {category === 'medical_procedures' && (
                <div className="flex items-center">
                  <RadioGroupItem value="total" id="total" />
                  <label htmlFor="total" className="ml-2">Total cost</label>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        
        <Select value={costRange} onValueChange={setCostRange} required>
          <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
            <SelectValue placeholder="Select cost range" />
          </SelectTrigger>
          <SelectContent>
            {getCostOptions().map(range => (
              <SelectItem key={range} value={range}>{range}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Required fields based on category */}
      <div className="space-y-4">
        {/* Optional fields that remain in Step 1 */}
        {category !== 'crisis_resources' && (
          <div>
            <label htmlFor="session_frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {category === 'medical_procedures' ? 'Treatment frequency' : 'Session frequency'}
            </label>
            <Select value={sessionFrequency} onValueChange={setSessionFrequency}>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
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
          </div>
        )}

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {category === 'alternative_practitioners' ? (
                <>
                  <SelectItem value="Practitioner's office">Practitioner's office</SelectItem>
                  <SelectItem value="Home visit/Mobile service">Home visit/Mobile service</SelectItem>
                  <SelectItem value="Virtual/Remote">Virtual/Remote</SelectItem>
                  <SelectItem value="Wellness center/Clinic">Wellness center/Clinic</SelectItem>
                  <SelectItem value="Mix of locations">Mix of locations</SelectItem>
                </>
              ) : category === 'crisis_resources' ? (
                <>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Text/Chat">Text/Chat</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </>
              ) : category === 'medical_procedures' ? (
                <>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                  <SelectItem value="Inpatient">Inpatient</SelectItem>
                  <SelectItem value="In-office">In-office</SelectItem>
                  <SelectItem value="At-home">At-home</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="By phone/teleconference">By phone/teleconference</SelectItem>
                  <SelectItem value="Mix of in-person & virtual">Mix of in-person & virtual</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Session length for therapists_counselors REQUIRED */}
        {category === 'therapists_counselors' && (
          <div>
            <label htmlFor="session_length" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session length <span className="text-red-500">*</span>
            </label>
            <Select value={sessionLength} onValueChange={setSessionLength} required>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 30 minutes">Under 30 minutes</SelectItem>
                <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
                <SelectItem value="90-120 minutes">90-120 minutes</SelectItem>
                <SelectItem value="Over 2 hours">Over 2 hours</SelectItem>
                <SelectItem value="Varies">Varies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Session length for other categories OPTIONAL */}
        {!['crisis_resources', 'medical_procedures', 'therapists_counselors'].includes(category) && (
          <div>
            <label htmlFor="session_length" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session length</label>
            <Select value={sessionLength} onValueChange={setSessionLength}>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="How long?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Under 30 minutes">Under 30 minutes</SelectItem>
                <SelectItem value="30-45 minutes">30-45 minutes</SelectItem>
                <SelectItem value="45-60 minutes">45-60 minutes</SelectItem>
                <SelectItem value="60-90 minutes">60-90 minutes</SelectItem>
                <SelectItem value="90-120 minutes">90-120 minutes</SelectItem>
                <SelectItem value="Over 2 hours">Over 2 hours</SelectItem>
                <SelectItem value="Varies">Varies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {['therapists_counselors', 'doctors_specialists', 'medical_procedures'].includes(category) && (
          <div>
            <label htmlFor="insurance_coverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Insurance coverage</label>
            <Select value={insuranceCoverage} onValueChange={setInsuranceCoverage}>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="Coverage status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fully covered">Fully covered by insurance</SelectItem>
                <SelectItem value="Partially covered">Partially covered by insurance</SelectItem>
                <SelectItem value="Not covered">Not covered by insurance</SelectItem>
                <SelectItem value="No insurance">No insurance/Self-pay</SelectItem>
                <SelectItem value="Government program">Covered by government program (Medicare, NHS, provincial coverage, etc.)</SelectItem>
                <SelectItem value="HSA/FSA eligible (US)">HSA/FSA eligible (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Wait time for doctors OPTIONAL, medical_procedures REQUIRED */}
        {category === 'doctors_specialists' && (
          <div>
            <label htmlFor="wait_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wait time</label>
            <Select value={waitTime} onValueChange={setWaitTime}>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
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
          </div>
        )}

        {category === 'medical_procedures' && (
          <div>
            <label htmlFor="wait_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wait time <span className="text-red-500">*</span>
            </label>
            <Select value={waitTime} onValueChange={setWaitTime} required>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
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
          </div>
        )}


        {/* Specialty for professional_services REQUIRED */}
        {category === 'professional_services' && (
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type of service <span className="text-red-500">*</span>
            </label>
            <Select value={specialty} onValueChange={setSpecialty} required>
              <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal trainer/Fitness coach">Personal trainer/Fitness coach</SelectItem>
                <SelectItem value="Nutritionist/Dietitian">Nutritionist/Dietitian</SelectItem>
                <SelectItem value="Professional organizer">Professional organizer</SelectItem>
                <SelectItem value="Financial advisor/Planner">Financial advisor/Planner</SelectItem>
                <SelectItem value="Legal services">Legal services</SelectItem>
                <SelectItem value="Virtual assistant">Virtual assistant</SelectItem>
                <SelectItem value="Tutor/Educational specialist">Tutor/Educational specialist</SelectItem>
                <SelectItem value="Hair/Beauty professional">Hair/Beauty professional</SelectItem>
                <SelectItem value="Home services">Home services (cleaning, handyman, etc.)</SelectItem>
                <SelectItem value="Career/Business coach">Career/Business coach</SelectItem>
                <SelectItem value="Digital marketing/Tech specialist">Digital marketing/Tech specialist</SelectItem>
                <SelectItem value="Pet services">Pet services</SelectItem>
                <SelectItem value="Creative services">Creative services (photographer, designer, writer)</SelectItem>
                <SelectItem value="Other">Other professional service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Response time for crisis_resources REQUIRED */}
        {category === 'crisis_resources' && (
          <>
            <div>
              <label htmlFor="response_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response time <span className="text-red-500">*</span>
              </label>
              <Select value={responseTime} onValueChange={setResponseTime} required>
                <SelectTrigger className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
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
            </div>
            
          </>
        )}
      </div>
    </div>
      </div>
    );
  };
  
  const renderStepTwo = () => {
    return (
      <div className="space-y-6 animate-slide-in">
        <ProgressCelebration step={currentStep} />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <h2 className="text-xl font-semibold">
            {showSideEffects ? 'Any side effects?' : 'Any barriers?'}
          </h2>
        </div>

        {/* Quick tip */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 This helps others know what to expect
          </p>
        </div>

        {showSideEffects ? renderSideEffects() : showBarriers ? renderBarriers() : null}
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
  
  const renderSideEffects = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sideEffectOptions.map((effect) => (
        <label
          key={effect}
          className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer 
                    transition-all transform hover:scale-[1.02] ${
            selectedSideEffects.includes(effect)
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
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
              ? 'border-blue-500 bg-blue-500'
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
        <div className="mt-3 animate-fade-in">
          <input
            type="text"
            value={customSideEffect}
            onChange={(e) => setCustomSideEffect(e.target.value)}
            placeholder="Please describe the side effect"
            className="w-full px-3 py-2 border border-blue-500 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-800 dark:text-white"
            autoFocus
          />
        </div>
      )}
      </>
    );
  };
  
  const renderBarriers = () => {
    if (barriersLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    return (
      <>
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
            onKeyDown={(e) => e.key === 'Enter' && addCustomBarrier()}
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
      {selectedBarriers.filter(b => !barrierOptions.includes(b) && b !== 'None').length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added:</p>
          <div className="flex flex-wrap gap-2">
            {selectedBarriers.filter(b => !barrierOptions.includes(b) && b !== 'None').map((barrier) => (
              <span key={barrier} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                                           text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {barrier}
                <button
                  onClick={() => setSelectedBarriers(selectedBarriers.filter(b => b !== barrier))}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
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
  
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        // Universal fields always required
        const universalValid = effectiveness !== null && timeToResults !== '';
        
        // Cost always required
        const costValid = costRange !== '';
        
        // Category-specific required fields
        let categorySpecificValid = true;
        
        if (category === 'therapists_counselors') {
          categorySpecificValid = sessionLength !== '';
        } else if (category === 'medical_procedures') {
          categorySpecificValid = waitTime !== '';
        } else if (category === 'professional_services') {
          categorySpecificValid = specialty !== '';
        } else if (category === 'crisis_resources') {
          categorySpecificValid = responseTime !== '';
        }
        
        return universalValid && costValid && categorySpecificValid;
        
      case 2:
        // Must select at least one side effect/barrier
        const hasSelections = showSideEffects ? selectedSideEffects.length > 0 : selectedBarriers.length > 0;
        return hasSelections;
        
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
      // Include custom side effect description if "Other" is selected
      const sideEffectsData = showSideEffects ? {
        selected: selectedSideEffects,
        customDescription: selectedSideEffects.includes('Other (please describe)') ? customSideEffect : undefined
      } : undefined;

      console.log('Submitting session form with:', {
        effectiveness,
        timeToResults,
        costRange,
        costType,
        sessionFrequency,
        format,
        sessionLength,
        waitTime,
        insuranceCoverage,
        specialty,
        responseTime,
        sideEffects: sideEffectsData,
        barriers: showBarriers ? selectedBarriers : undefined,
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
      completedTreatment,
      typicalLength,
      availability,
      additionalInfo 
    });
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
            Your experience with {solutionName} has been recorded
          </p>

          {/* Optional fields in a subtle card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-6 opacity-0 animate-[slideUp_0.5s_ease-out_0.7s_forwards]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Add more details (optional):
            </p>
            
            <div className="space-y-4">
              {['therapists_counselors', 'coaches_mentors', 'medical_procedures'].includes(category) && (
                <select
                  value={completedTreatment}
                  onChange={(e) => setCompletedTreatment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm"
                >
                  <option value="">Completed full treatment?</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Still ongoing">Still ongoing</option>
                </select>
              )}
              
              {!['professional_services', 'crisis_resources'].includes(category) && (
                <select
                  value={typicalLength}
                  onChange={(e) => setTypicalLength(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           appearance-none text-sm"
                >
                  <option value="">Typical treatment length</option>
                  <option value="Single session">Single session</option>
                  <option value="2-5 sessions">2-5 sessions</option>
                  <option value="6-12 sessions">6-12 sessions</option>
                  <option value="3-12 months">3-12 months</option>
                  <option value="Over 1 year">Over 1 year</option>
                  <option value="Ongoing/Varies">Ongoing/Varies</option>
                </select>
              )}
              
              {category === 'crisis_resources' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Availability</p>
                  {['24/7', 'Business hours', 'Evenings', 'Weekends', 'Immediate response', 'Callback within 24hrs'].map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={availability.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailability([...availability, option]);
                          } else {
                            setAvailability(availability.filter(a => a !== option));
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              <textarea
                placeholder="Any tips or additional info that might help others?"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white text-sm"
              />
              
              {(completedTreatment || typicalLength || availability.length > 0 || additionalInfo) && (
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

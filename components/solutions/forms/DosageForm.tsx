// components/solutions/forms/DosageForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Check, AlertCircle, X, Star } from 'lucide-react';

interface DosageFormProps {
  goalId: string;
  goalTitle?: string;
  userId: string;
  solutionName: string;
  category: string;
  existingSolutionId?: string;
  onBack: () => void;
}

interface FailedSolution {
  name: string;
  rating: number;
}

// Unit options by category
const unitOptions = {
  supplements_vitamins: ['mg', 'mcg', 'IU', 'g', 'tablets', 'capsules', 'ml', 'drops', 'gummies', 'other'],
  medications: ['mg', 'mcg', 'g', 'tablets', 'capsules', 'ml', 'units', 'puffs', 'patches', 'other'],
  natural_remedies: ['mg', 'g', 'ml', 'drops', 'capsules', 'tsp', 'tbsp', 'tea bags', 'other'],
  beauty_skincare: [] // Not used for skincare
};

// Skincare frequency options
const skincareFrequencies = [
  { value: 'twice_daily', label: 'Twice daily (AM & PM)', display: 'Twice daily' },
  { value: 'once_daily_am', label: 'Once daily (morning)', display: 'Morning only' },
  { value: 'once_daily_pm', label: 'Once daily (night)', display: 'Night only' },
  { value: 'every_other_day', label: 'Every other day', display: 'Every other day' },
  { value: '2-3_weekly', label: '2-3 times per week', display: '2-3x per week' },
  { value: 'weekly', label: 'Weekly', display: 'Weekly' },
  { value: 'spot_treatment', label: 'As needed (spot treatment)', display: 'Spot treatment' }
];

export function DosageForm({
  goalId,
  goalTitle = "your goal",
  userId,
  solutionName,
  category,
  existingSolutionId,
  onBack
}: DosageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 fields - Dosage specification
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [doseCount, setDoseCount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [skincareFrequency, setSkincareFrequency] = useState('');
  
  // Step 2 fields - Effectiveness
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [timeToResults, setTimeToResults] = useState('');
  
  // Step 3 fields - Cost & Side Effects
  const [costType, setCostType] = useState<'monthly' | 'one_time'>('monthly');
  const [costRange, setCostRange] = useState('');
  const [sideEffects, setSideEffects] = useState<string[]>(['None']);
  
  // Step 4 - Failed solutions
  const [failedSolutions, setFailedSolutions] = useState<FailedSolution[]>([]);
  const [newFailedSolution, setNewFailedSolution] = useState('');
  
  // Optional fields (Step 5)
  const [brand, setBrand] = useState('');
  const [form, setForm] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  // Progress indicator
  const totalSteps = 5; // Added optional details step
  const progress = (currentStep / totalSteps) * 100;

  // Helper functions
  const isDosageRequired = () => {
    return ['medications', 'supplements_vitamins', 'natural_remedies'].includes(category);
  };

  const buildDosageString = () => {
    if (category === 'beauty_skincare') {
      const selected = skincareFrequencies.find(f => f.value === skincareFrequency);
      return selected?.display || '';
    }

    const unit = showCustomUnit ? customUnit : doseUnit;
    if (!doseAmount || !unit) return '';
    
    let result = `${doseAmount} ${unit}`;
    
    // Add count if provided and makes sense
    if (doseCount && !['tablets', 'capsules', 'gummies'].includes(unit)) {
      result += ` (${doseCount} ${doseCount === '1' ? 'dose' : 'doses'})`;
    }
    
    if (frequency) {
      result += ` ${frequency}`;
    }
    
    return result;
  };

  const calculateDailyDose = () => {
    if (!doseAmount || !frequency || category === 'beauty_skincare') return null;
    
    const amount = parseFloat(doseAmount);
    if (isNaN(amount)) return null;
    
    const multipliers: Record<string, number> = {
      'once daily': 1,
      'twice daily': 2,
      'three times daily': 3,
      'four times daily': 4,
      'every other day': 0.5,
      'twice weekly': 0.285,
      'weekly': 0.143,
      'monthly': 0.033
    };
    
    return multipliers[frequency] ? amount * multipliers[frequency] : null;
  };

  // Category-specific side effects
  const sideEffectOptions = {
    supplements_vitamins: [
      'None', 'Upset stomach', 'Nausea', 'Constipation', 'Diarrhea', 
      'Headache', 'Metallic taste', 'Fatigue', 'Skin reaction', 
      'Increased energy', 'Sleep changes', 'Morning grogginess', 
      'Vivid dreams', 'Acne/breakouts', 'Gas/bloating', 
      'Initially worse before better', 'Other (please describe)'
    ],
    medications: [
      'None', 'Nausea', 'Headache', 'Dizziness', 'Drowsiness', 
      'Insomnia', 'Dry mouth', 'Weight gain', 'Weight loss', 
      'Sexual side effects', 'Mood changes', 'Appetite changes', 
      'Sweating', 'Tremor', 'Constipation', 'Blurred vision', 
      'Initially worse before better', 'Other (please describe)'
    ],
    natural_remedies: [
      'None', 'Drowsiness', 'Upset stomach', 'Headache', 
      'Allergic reaction', 'Vivid dreams', 'Changes in appetite', 
      'Mild anxiety', 'Digestive changes', 'Skin reaction', 
      'Interactions with medications', 'Initially worse before better', 
      'Other (please describe)'
    ],
    beauty_skincare: [
      'None', 'Dryness/peeling', 'Redness/irritation', 
      'Purging (initial breakouts)', 'Burning/stinging', 'Itching', 
      'Photosensitivity', 'Discoloration', 'Allergic reaction', 
      'Oiliness', 'Clogged pores', 'Texture changes', 
      'Initially worse before better', 'Other (please describe)'
    ]
  };

  const handleSideEffectToggle = (effect: string) => {
    if (effect === 'None') {
      setSideEffects(['None']);
    } else {
      if (sideEffects.includes(effect)) {
        setSideEffects(sideEffects.filter(e => e !== effect));
      } else {
        setSideEffects(sideEffects.filter(e => e !== 'None').concat(effect));
      }
    }
  };

  const addFailedSolution = () => {
    if (newFailedSolution.trim()) {
      setFailedSolutions([...failedSolutions, { name: newFailedSolution, rating: 1 }]);
      setNewFailedSolution('');
    }
  };

  const updateFailedSolutionRating = (index: number, rating: number) => {
    const updated = [...failedSolutions];
    updated[index].rating = rating;
    setFailedSolutions(updated);
  };

  const removeFailedSolution = (index: number) => {
    setFailedSolutions(failedSolutions.filter((_, i) => i !== index));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Dosage specification
        if (category === 'beauty_skincare') {
          return skincareFrequency !== '';
        }
        return doseAmount !== '' && 
               (doseUnit !== '' || (showCustomUnit && customUnit !== '')) && 
               frequency !== '';
      case 2: // Effectiveness
        return effectiveness !== null && timeToResults !== '';
      case 3: // Cost & Side Effects
        return costRange !== '' && sideEffects.length > 0;
      case 4: // Failed solutions (optional)
        return true;
      case 5: // Additional details (optional)
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Build implementation name
      const implementationName = buildDosageString();
      const dailyDose = calculateDailyDose();
      
      // TODO: Save to database
      console.log('Submitting:', {
        solutionName,
        implementationName,
        effectiveness,
        dailyDose,
        failedSolutions
      });
      
      router.push(`/goal/${goalId}?success=true`);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Dosage specification
        if (category === 'beauty_skincare') {
          return (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  How did you use <strong>{solutionName}</strong> for <strong>{goalTitle}</strong>?
                </p>
              </div>

              <h2 className="text-xl font-semibold">Usage frequency</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How often did you use it? <span className="text-red-500">*</span>
                </label>
                <select
                  value={skincareFrequency}
                  onChange={(e) => setSkincareFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select frequency</option>
                  {skincareFrequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        }

        // For medications/supplements/natural remedies
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Specify exactly what you took for <strong>{goalTitle}</strong>
              </p>
            </div>

            <h2 className="text-xl font-semibold">Your {solutionName} dosage</h2>

            {/* Structured dosage input */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={doseAmount}
                  onChange={(e) => setDoseAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={doseUnit}
                  onChange={(e) => {
                    setDoseUnit(e.target.value);
                    setShowCustomUnit(e.target.value === 'other');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select</option>
                  {unitOptions[category as keyof typeof unitOptions]?.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  Count
                </label>
                <input
                  type="text"
                  value={doseCount}
                  onChange={(e) => setDoseCount(e.target.value)}
                  placeholder="2 (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Custom unit input */}
            {showCustomUnit && (
              <div>
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="Enter unit (e.g., 'sachets', 'lozenges', 'patches')"
                  className="w-full px-3 py-2 border border-blue-500 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>
            )}

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How often? <span className="text-red-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select frequency</option>
                <option value="once daily">Once daily</option>
                <option value="twice daily">Twice daily</option>
                <option value="three times daily">Three times daily</option>
                <option value="four times daily">Four times daily</option>
                <option value="as needed">As needed</option>
                <option value="every other day">Every other day</option>
                <option value="twice weekly">Twice weekly</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Preview */}
            {(doseAmount && (doseUnit || customUnit) && frequency) && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                This will create: <strong className="text-gray-900 dark:text-white">{buildDosageString()}</strong>
              </div>
            )}
          </div>
        );

      case 2: // Effectiveness
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Rate how well <strong>{buildDosageString() || solutionName}</strong> worked for <strong>{goalTitle}</strong>
              </p>
            </div>

            <h2 className="text-xl font-semibold">How effective was it?</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rate its effectiveness
              </label>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setEffectiveness(rating)}
                    className={`py-3 sm:py-4 px-1 sm:px-2 rounded-lg border-2 transition-all ${
                      effectiveness === rating
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl mb-1">
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
              <div className="flex justify-between mt-2 sm:hidden">
                <span className="text-xs text-gray-500">Not at all</span>
                <span className="text-xs text-gray-500">Extremely</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How long until you noticed results?
              </label>
              <select
                value={timeToResults}
                onChange={(e) => setTimeToResults(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
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
        );

      case 3: // Cost & Side Effects
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cost & Side Effects</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What did it cost?
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  onClick={() => setCostType('monthly')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    costType === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Monthly cost
                </button>
                <button
                  onClick={() => setCostType('one_time')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    costType === 'one_time'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  One-time purchase
                </button>
              </div>
              
              <select
                value={costRange}
                onChange={(e) => setCostRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select cost range</option>
                {costType === 'monthly' ? (
                  <>
                    <option value="Free">Free</option>
                    <option value="Under $10/month">Under $10/month</option>
                    <option value="$10-25/month">$10-25/month</option>
                    <option value="$25-50/month">$25-50/month</option>
                    <option value="$50-100/month">$50-100/month</option>
                    <option value="$100-200/month">$100-200/month</option>
                    <option value="Over $200/month">Over $200/month</option>
                  </>
                ) : (
                  <>
                    <option value="Free">Free</option>
                    <option value="Under $20">Under $20</option>
                    <option value="$20-50">$20-50</option>
                    <option value="$50-100">$50-100</option>
                    <option value="$100-250">$100-250</option>
                    <option value="$250-500">$250-500</option>
                    <option value="Over $500">Over $500</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Did you experience any side effects?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sideEffectOptions[category as keyof typeof sideEffectOptions]?.map((effect) => (
                  <label
                    key={effect}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer 
                              transition-all ${
                      sideEffects.includes(effect)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sideEffects.includes(effect)}
                      onChange={() => handleSideEffectToggle(effect)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      sideEffects.includes(effect)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {sideEffects.includes(effect) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm">{effect}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Failed solutions
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">What else did you try?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Quick ratings for other things you tried for <strong>{goalTitle}</strong> that didn't work as well
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFailedSolution}
                onChange={(e) => setNewFailedSolution(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFailedSolution()}
                placeholder="Add anything else you tried (supplements, apps, therapies, etc.)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={addFailedSolution}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                         dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            {failedSolutions.length > 0 && (
              <div className="space-y-3">
                {failedSolutions.map((failed, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="flex-1 font-medium">{failed.name}</span>
                    
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => updateFailedSolutionRating(index, rating)}
                          className={`p-1 transition-all ${
                            failed.rating >= rating
                              ? 'text-yellow-500'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => removeFailedSolution(index)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Rate 1-5 stars (these didn't work as well as {buildDosageString() || solutionName} for {goalTitle})
                </p>
              </div>
            )}

            {failedSolutions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No other solutions added yet</p>
                <p className="text-sm mt-1">This step is optional - you can skip it</p>
              </div>
            )}
          </div>
        );

      case 5: // Additional details (optional)
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Details (Optional)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add any details that might help others
            </p>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand/Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={
                  category === 'beauty_skincare' 
                    ? "Already included in product name"
                    : "e.g., Nature Made, NOW Foods"
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
                disabled={category === 'beauty_skincare'}
              />
            </div>

            {/* Form factor */}
            {category !== 'beauty_skincare' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select form</option>
                  <option value="tablet">Tablet/Pill</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="powder">Powder</option>
                  <option value="gummy">Gummy</option>
                  <option value="sublingual">Sublingual</option>
                  <option value="topical">Topical/Cream</option>
                  <option value="injection">Injection</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Time of day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Best time to take/use
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              >
                <option value="">Not important</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening/Night</option>
                <option value="with_meals">With meals</option>
                <option value="empty_stomach">Empty stomach</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>

            {/* Other info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Any other important information?
              </label>
              <textarea
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                placeholder="Tips, warnings, or anything else that might help others..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              These details are optional - you can skip this step
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
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
                    dark:border-gray-700 p-4 sm:p-6">
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
            {currentStep === 4 || currentStep === 5 ? 'Skip' : 'Continue'}
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
  );
}
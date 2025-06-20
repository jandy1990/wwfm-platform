// components/solutions/forms/DosageForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface DosageFormProps {
  goalId: string;
  userId: string;
  solutionName: string;
  category: string;
  onBack: () => void;
}

interface FormData {
  effectiveness: number;
  timeToResults: string;
  costType: 'monthly' | 'one_time';
  costRange: string;
  sideEffects: string[];
  dosageAmount?: string;
  frequency?: string;
  form?: string;
  timeOfDay?: string;
  brandManufacturer?: string;
  productType?: string; // for beauty_skincare only
  otherInfo?: string;
}

export function DosageForm({ 
  goalId, 
  userId, 
  solutionName, 
  category,
  onBack 
}: DosageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    effectiveness: 0,
    timeToResults: '',
    costType: 'monthly',
    costRange: '',
    sideEffects: []
  });

  // Pre-seeded options based on category
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create or find the solution
      let solutionId;
      
      // Check if solution exists
      const { data: existingSolution } = await supabase
        .from('solutions')
        .select('id')
        .eq('title', solutionName)
        .eq('solution_category', category)
        .single();

      if (existingSolution) {
        solutionId = existingSolution.id;
      } else {
        // Create new solution
        const { data: newSolution, error: solutionError } = await supabase
          .from('solutions')
          .insert({
            title: solutionName,
            solution_category: category,
            created_by: userId,
            source_type: 'community_contributed',
            is_approved: true // Auto-approve for now
          })
          .select()
          .single();

        if (solutionError) throw solutionError;
        solutionId = newSolution.id;
      }

      // 2. Create implementation
      const implementationData = {
        solution_id: solutionId,
        name: `${formData.dosageAmount || 'Standard'} - ${formData.frequency || 'As directed'}`,
        effectiveness: formData.effectiveness,
        time_to_results: formData.timeToResults,
        cost_type: formData.costType,
        cost_range: formData.costRange,
        side_effects: formData.sideEffects.filter(e => e !== 'None'),
        challenges: [],
        other_important_information: formData.otherInfo || null,
        category_fields: {
          dosage_amount: formData.dosageAmount,
          frequency: formData.frequency,
          form: formData.form,
          time_of_day: formData.timeOfDay,
          brand_manufacturer: formData.brandManufacturer,
          product_type: formData.productType
        },
        created_by: userId,
        source_type: 'community_contributed'
      };

      const { data: implementation, error: implError } = await supabase
        .from('solution_implementations')
        .insert(implementationData)
        .select()
        .single();

      if (implError) throw implError;

      // 3. Link to goal
      const { error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: goalId,
          implementation_id: implementation.id
        });

      if (linkError) throw linkError;

      // 4. Create rating
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          implementation_id: implementation.id,
          goal_id: goalId,
          effectiveness: formData.effectiveness
        });

      if (ratingError) throw ratingError;

      // Success! Redirect back to goal page
      router.push(`/goal/${goalId}?added=true`);
      
    } catch (error) {
      console.error('Error submitting solution:', error);
      alert('Error saving solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSideEffect = (effect: string) => {
    if (effect === 'None') {
      setFormData({ ...formData, sideEffects: ['None'] });
    } else {
      const newEffects = formData.sideEffects.includes(effect)
        ? formData.sideEffects.filter(e => e !== effect)
        : [...formData.sideEffects.filter(e => e !== 'None'), effect];
      setFormData({ ...formData, sideEffects: newEffects });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Effectiveness Rating */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block mb-4">
          <span className="text-lg font-medium mb-2 block">
            How well did it work? *
          </span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, effectiveness: rating })}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  formData.effectiveness === rating
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Not effective</span>
            <span>Very effective</span>
          </div>
        </label>
      </div>

      {/* Time to Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block">
          <span className="text-lg font-medium mb-2 block">
            Time to see results? *
          </span>
          <select
            value={formData.timeToResults}
            onChange={(e) => setFormData({ ...formData, timeToResults: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select time frame</option>
            <option value="Immediately">Immediately</option>
            <option value="Within days">Within days</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="3-4 weeks">3-4 weeks</option>
            <option value="1-2 months">1-2 months</option>
            <option value="3+ months">3+ months</option>
          </select>
        </label>
      </div>

      {/* Cost */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <span className="text-lg font-medium mb-2 block">Cost? *</span>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, costType: 'monthly' })}
              className={`px-4 py-2 rounded-lg border ${
                formData.costType === 'monthly'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300'
              }`}
            >
              Monthly cost
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, costType: 'one_time' })}
              className={`px-4 py-2 rounded-lg border ${
                formData.costType === 'one_time'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300'
              }`}
            >
              One-time purchase
            </button>
          </div>
          <select
            value={formData.costRange}
            onChange={(e) => setFormData({ ...formData, costRange: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select cost range</option>
            {formData.costType === 'monthly' ? (
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
      </div>

      {/* Side Effects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <span className="text-lg font-medium mb-4 block">Side Effects *</span>
        <div className="space-y-2">
          {sideEffectOptions[category as keyof typeof sideEffectOptions]?.map((effect) => (
            <label key={effect} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sideEffects.includes(effect)}
                onChange={() => toggleSideEffect(effect)}
                className="mr-3 h-4 w-4 text-blue-600 rounded"
              />
              <span>{effect}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-medium mb-4">Optional Details</h3>
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Dosage amount</span>
          <input
            type="text"
            value={formData.dosageAmount || ''}
            onChange={(e) => setFormData({ ...formData, dosageAmount: e.target.value })}
            placeholder="e.g., 400mg, 2 tablets, 5000 IU"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Frequency</span>
          <select
            value={formData.frequency || ''}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select frequency</option>
            <option value="Once daily">Once daily</option>
            <option value="Twice daily">Twice daily</option>
            <option value="Three times daily">Three times daily</option>
            <option value="As needed">As needed</option>
            <option value="Weekly">Weekly</option>
            <option value="Other">Other</option>
          </select>
        </label>

        {/* Add more optional fields... */}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Other Important Information</span>
          <textarea
            value={formData.otherInfo || ''}
            onChange={(e) => setFormData({ ...formData, otherInfo: e.target.value })}
            placeholder="Any tips, warnings, or important notes?"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.effectiveness || !formData.timeToResults || !formData.costRange}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Share What Worked'}
        </button>
      </div>
    </form>
  );
}
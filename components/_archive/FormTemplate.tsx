// components/organisms/solutions/forms/FormTemplate.tsx

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/atoms/alert';

// We'll need to create the StarRating component or import it if it exists elsewhere
interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Temporary StarRating component - replace with actual import when created
function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="transition-colors hover:scale-110"
        >
          <svg
            className={`${sizes[size]} ${
              rating <= value ? 'fill-purple-600 text-purple-600' : 'fill-gray-200 text-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface FormTemplateProps {
  goalId: string;
  solutionTitle: string;
  solutionCategory: string;
  solutionId?: string; // If editing existing
  implementationId?: string; // If editing existing implementation
  children: React.ReactNode; // Category-specific fields
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
}

export function FormTemplate({
  goalId,
  solutionTitle,
  solutionCategory,
  solutionId, // Used for editing existing solutions
  implementationId, // Used for editing existing implementations
  children,
  onSubmit
}: FormTemplateProps) {
  console.log('solutionId passed to FormTemplate:', solutionId);
  console.log('implementationId passed to FormTemplate:', implementationId);
  const router = useRouter();
  const supabase = createClientComponentClient();
  console.log('FormTemplate initialized with:', { goalId, solutionTitle, solutionCategory, supabase: !!supabase });
  
  // Common state for all forms
  const [effectiveness, setEffectiveness] = useState<number>(0);
  const [timeToResults, setTimeToResults] = useState<string>('');
  const [otherInfo, setOtherInfo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base validation
  const validateBaseFields = () => {
    if (effectiveness === 0) {
      setError('Please rate how well this worked');
      return false;
    }
    if (!timeToResults) {
      setError('Please select when you saw results');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateBaseFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get form data from children components
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Build submission object
      const submissionData = {
        effectiveness,
        time_to_results: timeToResults,
        other_important_information: otherInfo,
        // Additional fields from child form
        ...Object.fromEntries(formData)
      };

      await onSubmit(submissionData);
      
      // Redirect to goal page on success
      router.push(`/goal/${goalId}`);
      router.refresh();
      
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Solution title display */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg">{solutionTitle}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Category: {solutionCategory.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Required Field 1: Effectiveness */}
      <div className="space-y-2">
        <label htmlFor="effectiveness" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How well did it work? <span className="text-red-500">*</span>
        </label>
        <StarRating
          value={effectiveness}
          onChange={setEffectiveness}
          size="lg"
        />
        {effectiveness === 0 && (
          <p className="text-sm text-gray-500">Click to rate</p>
        )}
      </div>

      {/* Required Field 2: Time to Results */}
      <div className="space-y-2">
        <label htmlFor="time_to_results" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time to see results? <span className="text-red-500">*</span>
        </label>
        <select
          id="time_to_results"
          value={timeToResults}
          onChange={(e) => setTimeToResults(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 
                   focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   appearance-none"
          required
        >
          <option value="">Select time frame</option>
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

      {/* Category-specific fields from children */}
      {children}

      {/* Optional: Other Important Information (all forms have this) */}
      <div className="space-y-2">
        <label htmlFor="other_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Other Important Information
        </label>
        <Textarea
          id="other_info"
          value={otherInfo}
          onChange={(e) => setOtherInfo(e.target.value)}
          placeholder="Any other important information? (e.g., specific tips, requirements, warnings)"
          rows={3}
          className="w-full"
        />
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Solution'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

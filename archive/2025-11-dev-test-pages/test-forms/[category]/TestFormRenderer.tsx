'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import all form components
import { AppForm } from '@/components/organisms/solutions/forms/AppForm';
import { DosageForm } from '@/components/organisms/solutions/forms/DosageForm';
import { SessionForm } from '@/components/organisms/solutions/forms/SessionForm';
import { PracticeForm } from '@/components/organisms/solutions/forms/PracticeForm';
import { HobbyForm } from '@/components/organisms/solutions/forms/HobbyForm';
import { LifestyleForm } from '@/components/organisms/solutions/forms/LifestyleForm';
import { CommunityForm } from '@/components/organisms/solutions/forms/CommunityForm';
import { FinancialForm } from '@/components/organisms/solutions/forms/FinancialForm';
import { PurchaseForm } from '@/components/organisms/solutions/forms/PurchaseForm';

interface TestFormRendererProps {
  category: string;
  formType: string;
  goalId: string;
  goalTitle: string;
  userId: string;
  solutionName: string;
  testMode: boolean;
}

export function TestFormRenderer({
  category,
  formType,
  goalId,
  goalTitle,
  userId,
  solutionName,
  testMode,
}: TestFormRendererProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/test-forms');
  };

  // Common props for all forms
  const commonProps = {
    goalId,
    goalTitle,
    userId,
    solutionName,
    category,
    onBack: handleBack,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Test Mode Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/test-forms"
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back to Grid</span>
            </Link>
            <div>
              <div className="text-sm opacity-90">Testing Mode</div>
              <div className="font-semibold">{formType} • {category.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            Goal: {goalTitle}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="py-8">
        {formType === 'AppForm' && <AppForm {...commonProps} />}
        {formType === 'DosageForm' && <DosageForm {...commonProps} />}
        {formType === 'SessionForm' && <SessionForm {...commonProps} />}
        {formType === 'PracticeForm' && <PracticeForm {...commonProps} />}
        {formType === 'HobbyForm' && <HobbyForm {...commonProps} />}
        {formType === 'LifestyleForm' && <LifestyleForm {...commonProps} />}
        {formType === 'CommunityForm' && <CommunityForm {...commonProps} />}
        {formType === 'FinancialForm' && <FinancialForm {...commonProps} />}
        {formType === 'PurchaseForm' && <PurchaseForm {...commonProps} />}
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface TestModeCountdownProps {
  /** Whether test mode is active */
  isTestMode?: boolean;
  /** URL to return to (default: /test-forms) */
  returnUrl?: string;
  /** Optional callback before returning (e.g., save optional fields) */
  onBeforeReturn?: () => Promise<void> | void;
}

export function TestModeCountdown({
  isTestMode = false,
  returnUrl = '/test-forms',
  onBeforeReturn
}: TestModeCountdownProps) {
  const router = useRouter();

  if (!isTestMode) return null;

  const handleReturn = async () => {
    // Call optional callback before returning (e.g., save optional fields)
    if (onBeforeReturn) {
      await onBeforeReturn();
    }
    router.push(returnUrl);
  };

  return (
    <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
            Test Mode Active
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Fill in optional fields above, then click return when ready
          </p>
        </div>
        <button
          onClick={handleReturn}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Test Grid
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface TestModeCountdownProps {
  /** Whether test mode is active */
  isTestMode?: boolean;
  /** Seconds to count down (default: 5) */
  countdown?: number;
  /** URL to return to (default: /test-forms) */
  returnUrl?: string;
}

export function TestModeCountdown({
  isTestMode = false,
  countdown = 5,
  returnUrl = '/test-forms'
}: TestModeCountdownProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(countdown);

  useEffect(() => {
    if (!isTestMode) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(returnUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestMode, router, returnUrl]);

  if (!isTestMode) return null;

  return (
    <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {secondsLeft}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Test Mode Active
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Returning to test grid in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(returnUrl)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Now
        </button>
      </div>
    </div>
  );
}

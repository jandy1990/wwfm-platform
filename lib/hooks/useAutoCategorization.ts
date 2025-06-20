// lib/hooks/useAutoCategorization.ts

import { useState, useCallback } from 'react';
import { detectCategory, CategoryMatch } from '@/lib/services/auto-categorization';
import { debounce } from '@/lib/utils';

interface UseAutoCategorization {
  matches: CategoryMatch[];
  isLoading: boolean;
  error: string | null;
  detectFromInput: (input: string) => void;
  clearMatches: () => void;
}

export function useAutoCategorization(): UseAutoCategorization {
  const [matches, setMatches] = useState<CategoryMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a debounced version of the detection function
  const debouncedDetect = useCallback(
    debounce(async (input: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await detectCategory(input);
        setMatches(results);
      } catch (err) {
        setError('Failed to detect category');
        console.error('Auto-categorization error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms delay
    []
  );

  const detectFromInput = useCallback((input: string) => {
    if (input.length < 3) {
      setMatches([]);
      return;
    }
    debouncedDetect(input);
  }, [debouncedDetect]);

  const clearMatches = useCallback(() => {
    setMatches([]);
    setError(null);
  }, []);

  return {
    matches,
    isLoading,
    error,
    detectFromInput,
    clearMatches
  };
}
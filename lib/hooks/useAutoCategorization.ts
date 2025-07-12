// lib/hooks/useAutoCategorization.ts
import { useState, useCallback, useRef } from 'react';
import { detectFromInput, DetectionResult } from '@/lib/solutions/categorization';

interface UseAutoCategorization {
  detectionResult: DetectionResult | null;
  isLoading: boolean;
  error: string | null;
  detectFromInput: (input: string) => void;
  clearResults: () => void;
}

export function useAutoCategorization(): UseAutoCategorization {
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track the latest request
  const latestRequestRef = useRef<number>(0);

  const handleDetection = useCallback(async (input: string) => {
    // Clear results if input is empty
    if (!input || input.trim().length === 0) {
      setDetectionResult(null);
      setError(null);
      return;
    }

    // Increment request counter
    const requestId = ++latestRequestRef.current;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await detectFromInput(input);
      
      // Only update if this is still the latest request
      if (requestId === latestRequestRef.current) {
        setDetectionResult(result);
      }
    } catch (err) {
      if (requestId === latestRequestRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to detect category');
        setDetectionResult(null);
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    setDetectionResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Debounced version
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const detectFromInputDebounced = useCallback((input: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set loading immediately for responsive feel
    if (input && input.trim().length > 0) {
      setIsLoading(true);
    }
    
    // Debounce the actual detection
    timeoutRef.current = setTimeout(() => {
      handleDetection(input);
    }, 300);
  }, [handleDetection]);

  return {
    detectionResult,
    isLoading,
    error,
    detectFromInput: detectFromInputDebounced,
    clearResults
  };
}
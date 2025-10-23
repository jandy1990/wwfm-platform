import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to automatically backup form data to sessionStorage
 * Prevents data loss on page refresh or browser crashes
 */
export function useFormBackup<T extends Record<string, unknown>>(
  key: string,
  formData: T,
  options?: {
    debounceMs?: number;
    excludeFields?: string[];
    onRestore?: (data: Partial<T>) => void;
  }
) {
  const { debounceMs = 500, excludeFields = [], onRestore } = options || {};
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);
  const formDataRef = useRef<T>(formData);

  // Update ref when formData changes (doesn't trigger re-renders)
  useEffect(() => {
    formDataRef.current = formData;
  });

  // Save data to sessionStorage (debounced)
  const saveBackup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        // Filter out excluded fields - use ref to access latest formData
        const dataToSave = Object.entries(formDataRef.current).reduce<Partial<T>>((acc, [field, value]) => {
          if (!excludeFields.includes(field)) {
            (acc as Record<string, unknown>)[field] = value;
          }
          return acc;
        }, {});

        // Only save if there's actual data
        const hasData = Object.values(dataToSave).some(
          value => value !== null && value !== undefined && value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true)
        );

        if (hasData) {
          sessionStorage.setItem(key, JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error('Failed to save form backup:', error);
      }
    }, debounceMs);
  }, [key, excludeFields, debounceMs]);

  // Restore data from sessionStorage
  const restoreBackup = useCallback((): Partial<T> | null => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as Partial<T>;
      }
    } catch (error) {
      console.error('Failed to restore form backup:', error);
    }
    return null;
  }, [key]);

  // Clear backup (call on successful submission)
  const clearBackup = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to clear form backup:', error);
    }
  }, [key]);

  // Check if backup exists
  const hasBackup = useCallback((): boolean => {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  // Restore on mount (only once)
  useEffect(() => {
    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true;
      const restoredData = restoreBackup();
      if (restoredData && onRestore) {
        // Delay slightly to ensure component is ready
        setTimeout(() => {
          onRestore(restoredData);
        }, 100);
      }
    }
  }, [restoreBackup, onRestore]);

  // Save backup whenever form data changes
  // Note: saveBackup is stable (doesn't depend on formData), so only formData in deps
  useEffect(() => {
    saveBackup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveBackup,
    restoreBackup,
    clearBackup,
    hasBackup
  };
}

'use client';

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { getCategoryDisplayName } from '@/lib/solutions/categorization';

interface CategoryChangeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Current category */
  currentCategory: string;
  /** New category user wants to switch to */
  newCategory: string;
  /** Callback when user confirms the switch */
  onConfirm: () => void;
}

/**
 * Confirmation modal for category switching
 *
 * Warns user that switching categories will reset their current progress.
 * Follows LoginPromptModal pattern with backdrop blur and escape handling.
 *
 * Pattern inspired by: components/ui/LoginPromptModal.tsx
 */
export function CategoryChangeModal({
  isOpen,
  onClose,
  currentCategory,
  newCategory,
  onConfirm
}: CategoryChangeModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-change-modal-title"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/10 dark:to-amber-900/10 px-6 py-5 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h3
                  id="category-change-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  Switch Category?
                </h3>
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                           transition-colors rounded-md
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Warning message */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Switching categories will reset any progress you've made on this form.
              </p>

              {/* Category change visualization */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {getCategoryDisplayName(currentCategory)}
                    </p>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">→</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To:</p>
                    <p className="font-medium text-purple-700 dark:text-purple-400">
                      {getCategoryDisplayName(newCategory)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="
                  flex-1
                  bg-white dark:bg-gray-700
                  border-2 border-gray-300 dark:border-gray-600
                  hover:border-gray-400 dark:hover:border-gray-500
                  text-gray-700 dark:text-gray-200
                  font-semibold
                  py-3 px-6
                  rounded-lg
                  transition-all duration-200
                  hover:shadow-md
                "
              >
                Cancel
              </button>

              {/* Confirm Button */}
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="
                  flex-1
                  bg-gradient-to-r from-purple-600 to-purple-600
                  hover:from-purple-700 hover:to-purple-700
                  text-white
                  font-semibold
                  py-3 px-6
                  rounded-lg
                  border-2 border-purple-700
                  transition-all duration-200
                  shadow-md hover:shadow-xl
                  transform hover:-translate-y-0.5
                "
              >
                Yes, Switch Category
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Your solution name and goal will be preserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

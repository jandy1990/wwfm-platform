'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/atoms/alert';
import { getCategoryDisplayName } from '@/lib/solutions/categorization';
import { CategoryPicker } from '@/components/organisms/solutions/CategoryPicker';
import { CategoryChangeModal } from './CategoryChangeModal';
import { getCategoryFieldHints } from './categoryFieldHints';

interface CategorySwitcherProps {
  /** Current solution category */
  category: string;
  /** Solution name for context */
  solutionName: string;
  /** Goal title for context */
  goalTitle: string;
  /** Callback when user confirms category change */
  onCategoryChange: (newCategory: string) => void;
}

/**
 * Category Switcher Component
 *
 * Allows users to correct auto-categorization errors from Step 1 of any form.
 * Shows current category with field hints and provides a way to change it.
 *
 * Design: Blue alert box with "We think this is: X" and "Not right? Change it" button
 */
export function CategorySwitcher({
  category,
  solutionName,
  goalTitle,
  onCategoryChange
}: CategorySwitcherProps) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const handleCategorySelect = (newCategory: string) => {
    // Close the category picker
    setShowCategoryPicker(false);

    // If same category, no need for confirmation
    if (newCategory === category) {
      return;
    }

    // Store the new category and show confirmation
    setPendingCategory(newCategory);
    setShowConfirmModal(true);
  };

  const handleConfirmChange = () => {
    if (pendingCategory) {
      onCategoryChange(pendingCategory);
      setPendingCategory(null);
    }
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setPendingCategory(null);
  };

  // If CategoryPicker is open, show it instead of the alert
  if (showCategoryPicker) {
    return (
      <div className="mb-6">
        <CategoryPicker
          onSelectCategory={handleCategorySelect}
          onBack={() => setShowCategoryPicker(false)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Category Alert Box */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-blue-900 dark:text-blue-100 font-medium">
                We think this is: <strong>{getCategoryDisplayName(category)}</strong>
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-0.5">
                We'll ask about {getCategoryFieldHints(category)}
              </p>
            </div>
            <button
              onClick={() => setShowCategoryPicker(true)}
              className="text-sm font-semibold text-blue-700 dark:text-blue-300
                         hover:text-blue-900 dark:hover:text-blue-100
                         underline decoration-dotted underline-offset-4 whitespace-nowrap
                         transition-colors"
            >
              Not right? Change it
            </button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Confirmation Modal */}
      {pendingCategory && (
        <CategoryChangeModal
          isOpen={showConfirmModal}
          onClose={handleCancelChange}
          currentCategory={category}
          newCategory={pendingCategory}
          onConfirm={handleConfirmChange}
        />
      )}
    </>
  );
}

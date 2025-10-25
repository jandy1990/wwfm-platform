/**
 * Shared validation utilities for WWFM forms
 * Phase 5: Best-Practice Validation UX
 */

/**
 * Marks all required fields as touched to trigger validation display
 */
export function touchAllFields(
  requiredFields: string[],
  markTouched: (field: string) => void
): void {
  requiredFields.forEach(field => markTouched(field));
}

/**
 * Scrolls to the first field with a validation error
 * Mobile-optimized: scrolls to top of viewport to avoid keyboard obstruction
 */
export function scrollToFirstError(
  validationErrors: Record<string, string>
): void {
  const firstErrorField = Object.keys(validationErrors)[0];
  if (!firstErrorField) return;

  // Detect mobile viewport
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Try multiple selector strategies to find the field
  const selectors = [
    `[name="${firstErrorField}"]`,
    `[data-field="${firstErrorField}"]`,
    `#${firstErrorField}`,
    // For star ratings and custom components
    `[data-testid="${firstErrorField}"]`,
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: isMobile ? 'start' : 'center', // Mobile: scroll to top, Desktop: center
        inline: 'nearest'
      });

      // Add visual pulse effect
      element.classList.add('validation-error-pulse');
      setTimeout(() => element.classList.remove('validation-error-pulse'), 2000);

      break;
    }
  }
}

/**
 * Handles Continue button click with validation
 * Returns true if validation passed, false if blocked
 */
export function handleContinueWithValidation(
  canProceed: boolean,
  touchAllCallback: () => void,
  validationErrors: Record<string, string>,
  onProceed: () => void,
  errorToast?: (message: string) => void
): boolean {
  if (!canProceed) {
    // Mark all fields as touched to show validation errors
    touchAllCallback();

    // Scroll to first error
    scrollToFirstError(validationErrors);

    // Optional toast notification
    if (errorToast) {
      const errorCount = Object.keys(validationErrors).length;
      errorToast(
        errorCount === 1
          ? 'Please fill the required field'
          : `Please fill all ${errorCount} required fields`
      );
    }

    return false;
  }

  // Validation passed - proceed
  onProceed();
  return true;
}

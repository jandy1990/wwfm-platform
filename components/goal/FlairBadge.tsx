import { getFlairConfig, type FlairType } from '@/lib/config/flair-types';

interface FlairBadgeProps {
  flairType: FlairType;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

/**
 * FlairBadge - Displays a flair tag with emoji, label, and optional remove button
 *
 * Used in:
 * - Discussion posts (display flairs)
 * - Flair selector (show selected flairs with remove option)
 * - Example posts (display flair types)
 */
export function FlairBadge({ flairType, size = 'md', onRemove }: FlairBadgeProps) {
  const config = getFlairConfig(flairType);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2 sm:px-2.5 py-1'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${config.bgClass} ${config.textClass} ${config.borderClass}
        ${sizeClasses[size]}
        font-medium
      `}
    >
      <span className="text-xs">{config.emoji}</span>
      <span className="whitespace-nowrap">{config.label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation w-4 h-4 flex items-center justify-center"
          aria-label={`Remove ${config.label} flair`}
        >
          ×
        </button>
      )}
    </span>
  );
}

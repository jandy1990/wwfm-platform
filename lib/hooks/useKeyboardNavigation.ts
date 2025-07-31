import { useState, useEffect, useCallback, KeyboardEvent } from 'react';

interface UseKeyboardNavigationProps {
  itemCount: number;
  isOpen: boolean;
  onSelect: (index: number) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export function useKeyboardNavigation({
  itemCount,
  isOpen,
  onSelect,
  onClose,
  onOpen
}: UseKeyboardNavigationProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Reset selection when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (!isOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      onOpen?.();
      return;
    }

    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => {
          const next = prev + 1;
          return next >= itemCount ? 0 : next;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? itemCount - 1 : next;
        });
        break;

      case 'Enter':
      case 'Tab':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < itemCount) {
          onSelect(selectedIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;

      default:
        break;
    }
  }, [isOpen, itemCount, selectedIndex, onSelect, onClose, onOpen]);

  // Mouse hover handler to update selected index
  const handleMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return {
    selectedIndex,
    handleKeyDown,
    handleMouseEnter,
    setSelectedIndex
  };
}
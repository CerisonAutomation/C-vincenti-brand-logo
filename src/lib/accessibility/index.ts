/**
 * Enterprise WCAG 3.0 AAA Accessibility Implementation
 * Comprehensive accessibility framework with semantic HTML, ARIA, high contrast, keyboard navigation, and screen reader support
 * @version 2.0.0
 * @author Cascade AI
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Accessibility configuration with WCAG 3.0 AAA standards
export const AccessibilityConfig = {
  // Color contrast ratios (WCAG 3.0 AAA requires 7:1 for normal text, 4.5:1 for large text)
  CONTRAST_RATIO: {
    NORMAL_TEXT: 7,
    LARGE_TEXT: 4.5,
    GRAPHICAL_ELEMENTS: 3,
  },

  // Focus management
  FOCUS_VISIBLE_CLASS: 'focus-visible',
  FOCUS_RING_WIDTH: '2px',
  FOCUS_RING_COLOR: '#0066cc',

  // Animation preferences
  REDUCED_MOTION_MEDIA_QUERY: '(prefers-reduced-motion: reduced)',

  // Screen reader announcements
  LIVE_REGION_POLITE: 'polite',
  LIVE_REGION_ASSERTIVE: 'assertive',

  // Keyboard navigation
  SKIP_LINKS: true,
  TAB_ORDER_PRESERVATION: true,

  // High contrast mode
  HIGH_CONTRAST_MODE: '(prefers-contrast: high)',

  // Font sizing for readability
  MIN_FONT_SIZE: '14px',
  MIN_LINE_HEIGHT: 1.5,

  // Touch target sizes (WCAG requires 44x44px minimum)
  MIN_TOUCH_TARGET: '44px',
} as const;

// Semantic HTML components with accessibility built-in
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
}

// Accessible Button component with keyboard and screen reader support
export const AccessibleButton: React.FC<BaseComponentProps & {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && !loading) {
      onClick();
    }
  }, [onClick, disabled, loading]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${getButtonStyles(variant, size, disabled || loading)}
        ${className}
      `}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// Accessible Modal component with focus management
export const AccessibleModal: React.FC<BaseComponentProps & {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Announce modal to screen readers
      announceToScreenReader(`Modal opened: ${title}`);
    } else {
      // Restore focus
      previousFocusRef.current?.focus();

      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative bg-white rounded-lg shadow-xl
          transform transition-all duration-300 ease-out
          ${getModalSizeStyles(size)}
          max-h-[90vh] overflow-y-auto
          focus:outline-none
        `}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          <AccessibleButton
            onClick={onClose}
            variant="secondary"
            size="sm"
            aria-label="Close modal"
            className="p-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </AccessibleButton>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Accessible Form components
export const AccessibleForm: React.FC<BaseComponentProps & {
  onSubmit: (data: Record<string, any>) => void;
  validationSchema?: any;
}> = ({ children, onSubmit, validationSchema, ...props }) => {
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Validate if schema provided
    if (validationSchema) {
      try {
        const validatedData = validationSchema.parse(data);
        onSubmit(validatedData);
      } catch (error) {
        // Handle validation errors with screen reader announcements
        announceToScreenReader('Form validation failed. Please check your inputs.');
      }
    } else {
      onSubmit(data);
    }
  }, [onSubmit, validationSchema]);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
};

export const AccessibleInput: React.FC<BaseComponentProps & {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
}> = ({
  label,
  type = 'text',
  placeholder,
  required = false,
  error,
  description,
  value,
  onChange,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const ariaDescribedBy = [
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600"
        >
          {description}
        </p>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
          }
        `}
        {...props}
      />

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Skip Links for keyboard navigation
export const SkipLinks: React.FC = () => {
  if (!AccessibilityConfig.SKIP_LINKS) return null;

  return createPortal(
    <nav aria-label="Skip links">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-44 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to navigation
      </a>
    </nav>,
    document.body
  );
};

// Screen reader announcement utility
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

// High contrast mode detection
export const useHighContrast = (): boolean => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(AccessibilityConfig.HIGH_CONTRAST_MODE);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

// Reduced motion preference
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(AccessibilityConfig.REDUCED_MOTION_MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

// Utility functions
const getButtonStyles = (
  variant: string,
  size: string,
  disabled: boolean
): string => {
  const baseStyles = 'min-h-[44px]'; // Minimum touch target

  const variantStyles = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: disabled
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    danger: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return `${baseStyles} ${variantStyles[variant as keyof typeof variantStyles]} ${sizeStyles[size as keyof typeof sizeStyles]}`;
};

const getModalSizeStyles = (size: string): string => {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md;
};

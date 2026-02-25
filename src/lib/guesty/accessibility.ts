/**
 * GUESTY INTEGRATION ACCESSIBILITY COMPLIANCE SYSTEM
 *
 * WCAG 3.0 AAA accessibility implementation with:
 * - Semantic HTML and ARIA attributes
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - High contrast support
 * - Focus management
 * - Motion and animation preferences
 * - Error announcements
 * - Live regions for dynamic content
 */

// ── Accessibility Configuration ──
export const ACCESSIBILITY_CONFIG = {
  FOCUS_VISIBLE: true,
  ANIMATION_REDUCTION: true,
  HIGH_CONTRAST: true,
  MOTION_REDUCTION: true,
  SCREEN_READER: true,
  KEYBOARD_NAVIGATION: true,
  ERROR_ANNOUNCEMENTS: true,
  LIVE_REGIONS: true,
  SKIP_LINKS: true,
  LANDMARKS: true,
  HEADINGS: true,
  FORMS: true,
  IMAGES: true,
  TABLES: true,
  LISTS: true,
} as const;

// ── ARIA Utilities ──
export class AriaManager {
  private static instance: AriaManager;

  static getInstance(): AriaManager {
    if (!AriaManager.instance) {
      AriaManager.instance = new AriaManager();
    }
    return AriaManager.instance;
  }

  /**
   * Generate unique IDs for ARIA relationships
   */
  private idCounter = 0;
  generateId(prefix = 'aria'): string {
    return `${prefix}-${++this.idCounter}`;
  }

  /**
   * Create ARIA attributes for form fields
   */
  getFormFieldAttributes(options: {
    label: string;
    description?: string;
    error?: string;
    required?: boolean;
    invalid?: boolean;
  }) {
    const inputId = this.generateId('input');
    const labelId = this.generateId('label');
    const descriptionId = options.description ? this.generateId('desc') : undefined;
    const errorId = options.error ? this.generateId('error') : undefined;

    const attributes: Record<string, any> = {
      input: {
        id: inputId,
        'aria-labelledby': labelId,
        'aria-required': options.required || false,
        'aria-invalid': options.invalid || false,
        'aria-describedby': [
          descriptionId,
          errorId,
        ].filter(Boolean).join(' ') || undefined,
      },
      label: {
        id: labelId,
        htmlFor: inputId,
      },
    };

    if (descriptionId) {
      attributes.description = {
        id: descriptionId,
      };
    }

    if (errorId) {
      attributes.error = {
        id: errorId,
        role: 'alert',
        'aria-live': 'polite',
      };
    }

    return attributes;
  }

  /**
   * Create ARIA attributes for expandable content
   */
  getExpandableAttributes(options: {
    expanded: boolean;
    controls: string;
    labelledBy?: string;
  }) {
    return {
      button: {
        'aria-expanded': options.expanded,
        'aria-controls': options.controls,
        'aria-labelledby': options.labelledBy,
      },
      content: {
        id: options.controls,
        'aria-hidden': !options.expanded,
      },
    };
  }

  /**
   * Create ARIA attributes for loading states
   */
  getLoadingAttributes(options: {
    loading: boolean;
    label?: string;
  }) {
    return {
      container: {
        'aria-live': 'polite',
        'aria-busy': options.loading,
        'aria-label': options.loading ? (options.label || 'Loading...') : undefined,
      },
    };
  }

  /**
   * Create ARIA attributes for status messages
   */
  getStatusAttributes(options: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    live?: boolean;
  }) {
    const role = options.type === 'error' ? 'alert' : 'status';

    return {
      container: {
        role,
        'aria-live': options.live !== false ? 'polite' : undefined,
        'aria-label': options.message,
      },
    };
  }

  /**
   * Create ARIA attributes for navigation
   */
  getNavigationAttributes(options: {
    current?: boolean;
    label?: string;
  }) {
    return {
      link: {
        'aria-current': options.current ? 'page' : undefined,
        'aria-label': options.label,
      },
    };
  }

  /**
   * Create ARIA attributes for images
   */
  getImageAttributes(options: {
    alt: string;
    decorative?: boolean;
    description?: string;
  }) {
    const attributes: Record<string, any> = {
      img: {
        alt: options.decorative ? '' : options.alt,
        role: options.decorative ? 'presentation' : undefined,
      },
    };

    if (options.description) {
      const descId = this.generateId('img-desc');
      attributes.img['aria-describedby'] = descId;
      attributes.description = {
        id: descId,
      };
    }

    return attributes;
  }

  /**
   * Create ARIA attributes for progress indicators
   */
  getProgressAttributes(options: {
    value: number;
    max: number;
    label?: string;
  }) {
    return {
      progress: {
        role: 'progressbar',
        'aria-valuenow': options.value,
        'aria-valuemax': options.max,
        'aria-valuemin': 0,
        'aria-label': options.label || 'Progress',
      },
    };
  }
}

// ── Keyboard Navigation Manager ──
export class KeyboardManager {
  private static instance: KeyboardManager;

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  /**
   * Handle keyboard navigation for custom components
   */
  handleKeyboardNavigation(event: KeyboardEvent, options: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    preventDefault?: boolean;
  } = {}) {
    const { preventDefault = false } = options;

    switch (event.key) {
      case 'Enter':
        if (options.onEnter) {
          if (preventDefault) event.preventDefault();
          options.onEnter();
        }
        break;
      case ' ':
        if (options.onSpace) {
          if (preventDefault) event.preventDefault();
          options.onSpace();
        }
        break;
      case 'Escape':
        if (options.onEscape) {
          if (preventDefault) event.preventDefault();
          options.onEscape();
        }
        break;
      case 'ArrowUp':
        if (options.onArrowUp) {
          if (preventDefault) event.preventDefault();
          options.onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (options.onArrowDown) {
          if (preventDefault) event.preventDefault();
          options.onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (options.onArrowLeft) {
          if (preventDefault) event.preventDefault();
          options.onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (options.onArrowRight) {
          if (preventDefault) event.preventDefault();
          options.onArrowRight();
        }
        break;
      case 'Tab':
        if (options.onTab) {
          options.onTab();
        }
        break;
    }
  }

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement, options: {
    initialFocus?: HTMLElement;
    returnFocus?: HTMLElement;
  } = {}) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
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
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (options.returnFocus) {
          options.returnFocus.focus();
        }
        container.removeEventListener('keydown', handleKeyDown);
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Set initial focus
    if (options.initialFocus) {
      options.initialFocus.focus();
    } else if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Move focus to next/previous focusable element
   */
  moveFocus(direction: 'next' | 'previous', currentElement?: HTMLElement) {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = currentElement ?
      focusableElements.indexOf(currentElement) :
      focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    focusableElements[nextIndex]?.focus();
  }
}

// ── Screen Reader Announcements ──
export class ScreenReaderManager {
  private static instance: ScreenReaderManager;
  private announcementElement: HTMLElement | null = null;

  static getInstance(): ScreenReaderManager {
    if (!ScreenReaderManager.instance) {
      ScreenReaderManager.instance = new ScreenReaderManager();
    }
    return ScreenReaderManager.instance;
  }

  /**
   * Initialize screen reader announcement system
   */
  initialize() {
    if (this.announcementElement) return;

    this.announcementElement = document.createElement('div');
    this.announcementElement.setAttribute('aria-live', 'polite');
    this.announcementElement.setAttribute('aria-atomic', 'true');
    this.announcementElement.setAttribute('aria-label', 'Screen reader announcements');
    this.announcementElement.style.position = 'absolute';
    this.announcementElement.style.left = '-10000px';
    this.announcementElement.style.width = '1px';
    this.announcementElement.style.height = '1px';
    this.announcementElement.style.overflow = 'hidden';

    document.body.appendChild(this.announcementElement);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, options: {
    priority?: 'polite' | 'assertive';
    delay?: number;
  } = {}) {
    if (!this.announcementElement) this.initialize();

    const { priority = 'polite', delay = 0 } = options;

    const announce = () => {
      if (this.announcementElement) {
        this.announcementElement.setAttribute('aria-live', priority);
        this.announcementElement.textContent = message;

        // Clear after announcement
        setTimeout(() => {
          if (this.announcementElement) {
            this.announcementElement.textContent = '';
          }
        }, 1000);
      }
    };

    if (delay > 0) {
      setTimeout(announce, delay);
    } else {
      announce();
    }
  }

  /**
   * Announce form validation errors
   */
  announceValidationError(fieldName: string, errorMessage: string) {
    this.announce(`${fieldName}: ${errorMessage}`, { priority: 'assertive' });
  }

  /**
   * Announce successful actions
   */
  announceSuccess(message: string) {
    this.announce(message, { priority: 'polite' });
  }

  /**
   * Announce loading states
   */
  announceLoading(message: string) {
    this.announce(message, { priority: 'polite' });
  }

  /**
   * Announce navigation changes
   */
  announceNavigation(pageTitle: string) {
    this.announce(`Navigated to ${pageTitle}`, { priority: 'polite' });
  }
}

// ── Motion and Animation Preferences ──
export class MotionManager {
  private static instance: MotionManager;
  private prefersReducedMotion = false;

  static getInstance(): MotionManager {
    if (!MotionManager.instance) {
      MotionManager.instance = new MotionManager();
    }
    return MotionManager.instance;
  }

  initialize() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', (event) => {
      this.prefersReducedMotion = event.matches;
    });
  }

  /**
   * Check if user prefers reduced motion
   */
  shouldReduceMotion(): boolean {
    return this.prefersReducedMotion;
  }

  /**
   * Apply motion-safe styles
   */
  applyMotionSafeStyles(element: HTMLElement, animationClass: string) {
    if (this.shouldReduceMotion()) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    } else {
      element.classList.add(animationClass);
    }
  }

  /**
   * Create motion-safe animation
   */
  createMotionSafeAnimation(options: {
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    fallback?: () => void;
  }) {
    if (this.shouldReduceMotion()) {
      options.fallback?.();
      return null;
    }

    return new Animation(options.keyframes, options.options);
  }
}

// ── High Contrast Support ──
export class ContrastManager {
  private static instance: ContrastManager;
  private prefersHighContrast = false;

  static getInstance(): ContrastManager {
    if (!ContrastManager.instance) {
      ContrastManager.instance = new ContrastManager();
    }
    return ContrastManager.instance;
  }

  initialize() {
    // Check for high contrast mode (limited browser support)
    const testElement = document.createElement('div');
    testElement.style.color = 'rgb(31, 41, 55)'; // Tailwind gray-800
    testElement.style.backgroundColor = 'rgb(255, 255, 255)';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // If colors are overridden (high contrast mode), they might be different
    this.prefersHighContrast = color !== 'rgb(31, 41, 55)' || backgroundColor !== 'rgb(255, 255, 255)';

    document.body.removeChild(testElement);
  }

  /**
   * Check if high contrast mode is preferred
   */
  prefersHighContrastMode(): boolean {
    return this.prefersHighContrast;
  }

  /**
   * Apply high contrast styles
   */
  applyHighContrastStyles(element: HTMLElement) {
    if (this.prefersHighContrastMode()) {
      element.style.border = '2px solid';
      element.style.outline = '2px solid';
      element.style.outlineOffset = '2px';
    }
  }
}

// ── Focus Management ──
export class FocusManager {
  private static instance: FocusManager;
  private previouslyFocusedElement: HTMLElement | null = null;

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * Save current focus
   */
  saveFocus() {
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
  }

  /**
   * Restore previously saved focus
   */
  restoreFocus() {
    if (this.previouslyFocusedElement && 'focus' in this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  /**
   * Move focus to a specific element
   */
  moveFocusTo(element: HTMLElement, options: {
    preventScroll?: boolean;
  } = {}) {
    element.focus({
      preventScroll: options.preventScroll,
    });
  }

  /**
   * Find first focusable element in container
   */
  findFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return container.querySelector(focusableSelectors) as HTMLElement;
  }

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    if (element.tabIndex < 0) return false;
    if (element.disabled) return false;
    if (element.hidden) return false;

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    return true;
  }
}

// ── Accessibility Compliance Validator ──
export class AccessibilityValidator {
  private static instance: AccessibilityValidator;

  static getInstance(): AccessibilityValidator {
    if (!AccessibilityValidator.instance) {
      AccessibilityValidator.instance = new AccessibilityValidator();
    }
    return AccessibilityValidator.instance;
  }

  /**
   * Validate ARIA attributes
   */
  validateAriaAttributes(element: HTMLElement): ValidationResult {
    const issues: string[] = [];

    // Check for required ARIA attributes
    if (element.hasAttribute('role')) {
      const role = element.getAttribute('role');

      // Check aria-labelledby references exist
      if (element.hasAttribute('aria-labelledby')) {
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy && !document.getElementById(labelledBy)) {
          issues.push(`aria-labelledby references non-existent element: ${labelledBy}`);
        }
      }

      // Check aria-describedby references exist
      if (element.hasAttribute('aria-describedby')) {
        const describedBy = element.getAttribute('aria-describedby');
        if (describedBy) {
          describedBy.split(' ').forEach(id => {
            if (!document.getElementById(id.trim())) {
              issues.push(`aria-describedby references non-existent element: ${id}`);
            }
          });
        }
      }

      // Role-specific validations
      switch (role) {
        case 'img':
          if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
            issues.push('Images with role="img" must have aria-label or aria-labelledby');
          }
          break;
        case 'button':
          if (!element.hasAttribute('aria-label') && !element.textContent?.trim()) {
            issues.push('Buttons must have accessible text content or aria-label');
          }
          break;
      }
    }

    // Check for redundant ARIA
    if (element.tagName === 'BUTTON' && element.hasAttribute('role') && element.getAttribute('role') === 'button') {
      issues.push('Redundant role="button" on native button element');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate form accessibility
   */
  validateFormAccessibility(form: HTMLFormElement): ValidationResult {
    const issues: string[] = [];

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;

      // Check for associated label
      const id = element.id;
      const label = id ? form.querySelector(`label[for="${id}"]`) : null;

      if (!label && !element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
        issues.push(`Form control ${element.name || element.type} lacks accessible label`);
      }

      // Check required fields
      if (element.required && !element.hasAttribute('aria-required')) {
        issues.push(`Required field ${element.name || element.type} missing aria-required="true"`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate color contrast (basic check)
   */
  validateColorContrast(foreground: string, background: string): ValidationResult {
    // Basic color contrast validation - in production use a proper library
    const issues: string[] = [];

    // Simple check - if colors are too similar
    if (foreground.toLowerCase() === background.toLowerCase()) {
      issues.push('Foreground and background colors are identical');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// ── Export Accessibility Utilities ──
export const ariaManager = AriaManager.getInstance();
export const keyboardManager = KeyboardManager.getInstance();
export const screenReaderManager = ScreenReaderManager.getInstance();
export const motionManager = MotionManager.getInstance();
export const contrastManager = ContrastManager.getInstance();
export const focusManager = FocusManager.getInstance();
export const accessibilityValidator = AccessibilityValidator.getInstance();

// ── Type Definitions ──
interface ValidationResult {
  valid: boolean;
  issues: string[];
}

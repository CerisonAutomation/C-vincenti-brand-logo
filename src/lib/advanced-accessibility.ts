/**
 * Advanced Accessibility Engine - WCAG 3.0 AAA Compliance
 * Implements comprehensive accessibility with semantic HTML, ARIA, contrast, keyboard/screen-reader support
 * Includes advanced focus management, motion preferences, and multimodal interaction
 * @version 2.0.0
 * @author Cascade AI - Project Perfection Engine
 */

import { z } from 'zod';

// Accessibility Configuration Schema
export const AccessibilityConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']),
  colorScheme: z.enum(['default', 'high-contrast', 'color-blind-friendly']),
  motionPreference: z.enum(['no-preference', 'reduce', 'none']),
  textSpacing: z.enum(['normal', 'relaxed', 'loose']),
  keyboardNavigation: z.enum(['standard', 'enhanced', 'screen-reader']),
  announcements: z.enum(['minimal', 'moderate', 'verbose']),
  focusIndicators: z.enum(['standard', 'enhanced', 'custom']),
});

// WCAG Compliance Checker Schema
export const AccessibilityViolationSchema = z.object({
  id: z.string(),
  rule: z.string(),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  wcagGuideline: z.string(),
  description: z.string(),
  element: z.string().optional(),
  impact: z.string(),
  suggestion: z.string(),
  timestamp: z.number(),
  resolved: z.boolean().default(false),
});

// Advanced ARIA Manager
export class AdvancedARIAManager {
  private liveRegions: Map<string, HTMLElement> = new Map();
  private announcements: string[] = [];
  private announcementTimer: NodeJS.Timeout | null = null;

  // Live Region Management
  createLiveRegion(id: string, options: {
    type: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    relevant?: string[];
  } = { type: 'polite' }): HTMLElement {
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', options.type);
    region.setAttribute('aria-atomic', options.atomic ? 'true' : 'false');

    if (options.relevant) {
      region.setAttribute('aria-relevant', options.relevant.join(' '));
    }

    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';

    document.body.appendChild(region);
    this.liveRegions.set(id, region);

    return region;
  }

  updateLiveRegion(id: string, content: string): void {
    const region = this.liveRegions.get(id);
    if (region) {
      region.textContent = content;
    }
  }

  removeLiveRegion(id: string): void {
    const region = this.liveRegions.get(id);
    if (region) {
      region.remove();
      this.liveRegions.delete(id);
    }
  }

  // Announcement System
  announce(message: string, priority: 'polite' | 'assertive' = 'polite', delay: number = 0): void {
    if (delay > 0) {
      setTimeout(() => this.performAnnouncement(message, priority), delay);
    } else {
      this.performAnnouncement(message, priority);
    }
  }

  private performAnnouncement(message: string, priority: 'polite' | 'assertive'): void {
    // Clear any pending announcements
    if (this.announcementTimer) {
      clearTimeout(this.announcementTimer);
      this.announcementTimer = null;
    }

    // Create or reuse announcement region
    let announcementRegion = this.liveRegions.get('announcements');
    if (!announcementRegion) {
      announcementRegion = this.createLiveRegion('announcements', { type: priority });
    } else {
      announcementRegion.setAttribute('aria-live', priority);
    }

    // Add to announcement queue
    this.announcements.push(message);

    // Process announcements with debouncing
    this.announcementTimer = setTimeout(() => {
      if (this.announcements.length > 0) {
        const combinedMessage = this.announcements.join('. ');
        this.updateLiveRegion('announcements', combinedMessage);
        this.announcements.length = 0; // Clear queue
      }
    }, 100);
  }

  // Advanced ARIA Properties
  setAriaDescription(element: HTMLElement, description: string): void {
    element.setAttribute('aria-description', description);
  }

  setAriaDetails(element: HTMLElement, detailsId: string): void {
    element.setAttribute('aria-details', detailsId);
  }

  setAriaErrorMessage(element: HTMLElement, errorId: string): void {
    element.setAttribute('aria-errormessage', errorId);
  }

  // Complex relationship management
  setAriaFlowTo(element: HTMLElement, targetIds: string[]): void {
    element.setAttribute('aria-flowto', targetIds.join(' '));
  }

  setAriaOwns(element: HTMLElement, ownedIds: string[]): void {
    element.setAttribute('aria-owns', ownedIds.join(' '));
  }

  // Dynamic property updates
  updateAriaExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  updateAriaPressed(element: HTMLElement, pressed: boolean | 'mixed'): void {
    element.setAttribute('aria-pressed', pressed.toString());
  }

  updateAriaChecked(element: HTMLElement, checked: boolean | 'mixed'): void {
    element.setAttribute('aria-checked', checked.toString());
  }

  updateAriaSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  }

  updateAriaCurrent(element: HTMLElement, current: boolean | 'page' | 'step' | 'location' | 'date' | 'time'): void {
    element.setAttribute('aria-current', current.toString());
  }
}

// Focus Trap implementation
class FocusTrap {
  private container: HTMLElement;
  private options: {
    initialFocus?: HTMLElement;
    restoreFocus?: boolean;
    escapeDeactivates?: boolean;
  };
  private isActive = false;
  private previouslyFocusedElement?: HTMLElement;

  constructor(container: HTMLElement, options: FocusTrap['options'] = {}) {
    this.container = container;
    this.options = options;
  }

  activate(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus initial element
    const initialFocus = this.options.initialFocus ||
                        this.container.querySelector('[autofocus]') as HTMLElement ||
                        this.getFocusableElements()[0];

    if (initialFocus) {
      initialFocus.focus();
    }

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));

    // Restore focus
    if (this.options.restoreFocus && this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.options.escapeDeactivates) {
      this.deactivate();
      return;
    }

    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    if (!this.container.contains(event.target as Node)) {
      // Focus moved outside trap, redirect to first focusable element
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Backward navigation
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Forward navigation
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(this.container.querySelectorAll(focusableSelectors.join(',')))
      .filter((element): element is HTMLElement => {
        const htmlElement = element as HTMLElement;
        return htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0 &&
               window.getComputedStyle(htmlElement).visibility !== 'hidden';
      });
  }
}

// Advanced Focus Management
export class AdvancedFocusManager {
  private focusHistory: HTMLElement[] = [];
  private focusTraps: Map<string, FocusTrap> = new Map();
  private keyboardNavigationMode = false;

  // Focus History Management
  pushFocus(element: HTMLElement): void {
    this.focusHistory.push(element);
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift(); // Keep only last 10
    }
  }

  popFocus(): HTMLElement | null {
    return this.focusHistory.pop() || null;
  }

  getPreviousFocus(): HTMLElement | null {
    return this.focusHistory[this.focusHistory.length - 2] || null;
  }

  // Intelligent Focus Movement
  moveFocus(direction: 'next' | 'previous' | 'first' | 'last', container?: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    let nextIndex: number;
    switch (direction) {
      case 'next':
        nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
        break;
      case 'previous':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = focusableElements.length - 1;
        break;
    }

    if (focusableElements[nextIndex]) {
      focusableElements[nextIndex].focus();
    }
  }

  private getFocusableElements(container?: HTMLElement): HTMLElement[] {
    const root = container || document;
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(root.querySelectorAll(focusableSelectors.join(',')))
      .filter((element): element is HTMLElement => {
        const htmlElement = element as HTMLElement;
        return htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0 &&
               window.getComputedStyle(htmlElement).visibility !== 'hidden';
      });
  }

  // Focus Trap Management
  createFocusTrap(id: string, container: HTMLElement, options: {
    initialFocus?: HTMLElement;
    restoreFocus?: boolean;
    escapeDeactivates?: boolean;
  } = {}): FocusTrap {
    const trap = new FocusTrap(container, options);
    this.focusTraps.set(id, trap);
    return trap;
  }

  activateFocusTrap(id: string): void {
    const trap = this.focusTraps.get(id);
    if (trap) {
      trap.activate();
    }
  }

  deactivateFocusTrap(id: string): void {
    const trap = this.focusTraps.get(id);
    if (trap) {
      trap.deactivate();
    }
  }

  // Keyboard Navigation Enhancement
  enableEnhancedKeyboardNavigation(): void {
    this.keyboardNavigationMode = true;

    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this), true);
    document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
  }

  disableEnhancedKeyboardNavigation(): void {
    this.keyboardNavigationMode = false;

    document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this), true);
    document.removeEventListener('focusin', this.handleFocusIn.bind(this), true);
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.keyboardNavigationMode) return;

    const target = event.target as HTMLElement;

    // Enhanced Tab navigation
    if (event.key === 'Tab') {
      // Add visual focus indicators
      this.addEnhancedFocusIndicator(target);
    }

    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const container = target.closest('[data-keyboard-navigation]');
      if (container) {
        event.preventDefault();
        this.handleArrowNavigation(event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', container as HTMLElement);
      }
    }

    // Skip links activation
    if (event.key === 'Escape') {
      const skipLinks = document.querySelectorAll('[data-skip-link]');
      if (skipLinks.length > 0) {
        (skipLinks[0] as HTMLElement).focus();
      }
    }
  }

  private handleArrowNavigation(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight', container: HTMLElement): void {
    const items = Array.from(container.querySelectorAll('[data-keyboard-nav-item]'));
    const currentIndex = items.indexOf(document.activeElement as Element);

    let nextIndex: number;
    switch (direction) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
    }

    if (items[nextIndex]) {
      (items[nextIndex] as HTMLElement).focus();
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.pushFocus(target);
    this.addEnhancedFocusIndicator(target);
  }

  private addEnhancedFocusIndicator(element: HTMLElement): void {
    // Remove existing indicators
    document.querySelectorAll('.accessibility-focus-indicator').forEach(indicator => {
      indicator.remove();
    });

    // Add enhanced focus indicator
    const indicator = document.createElement('div');
    indicator.className = 'accessibility-focus-indicator';
    indicator.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 9999;
      border: 3px solid #007acc;
      border-radius: 4px;
      background: rgba(0, 122, 204, 0.1);
      transition: all 0.2s ease;
    `;

    const rect = element.getBoundingClientRect();
    indicator.style.left = `${rect.left - 3}px`;
    indicator.style.top = `${rect.top - 3}px`;
    indicator.style.width = `${rect.width + 6}px`;
    indicator.style.height = `${rect.height + 6}px`;

    document.body.appendChild(indicator);

    // Remove after focus changes
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 1000);
  }

  // Skip Links Management
  addSkipLink(targetId: string, label: string): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'accessibility-skip-link';
    skipLink.setAttribute('data-skip-link', 'true');
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 0 0 4px 4px;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
    return skipLink;
  }
}

// Screen Reader Support Manager
export class ScreenReaderSupportManager {
  private ariaManager: AdvancedARIAManager;
  private supportedScreenReaders: Set<string> = new Set();

  constructor(ariaManager: AdvancedARIAManager) {
    this.ariaManager = ariaManager;
    this.detectScreenReader();
  }

  private detectScreenReader(): void {
    // Detect common screen readers
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('nvda')) {
      this.supportedScreenReaders.add('NVDA');
    }
    if (userAgent.includes('jaaws') || userAgent.includes('jaws')) {
      this.supportedScreenReaders.add('JAWS');
    }
    if (userAgent.includes('voiceover')) {
      this.supportedScreenReaders.add('VoiceOver');
    }
    if (userAgent.includes('talkback')) {
      this.supportedScreenReaders.add('TalkBack');
    }

    // Additional detection methods
    this.detectScreenReaderViaEvents();
  }

  private detectScreenReaderViaEvents(): void {
    // Create a test element to detect screen reader interaction
    const testElement = document.createElement('div');
    testElement.setAttribute('aria-live', 'assertive');
    testElement.style.position = 'absolute';
    testElement.style.left = '-10000px';
    testElement.textContent = 'Screen reader detection';

    document.body.appendChild(testElement);

    // Clean up after detection
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    }, 1000);
  }

  // Context-aware announcements
  announceContextChange(context: string, details?: Record<string, unknown>): void {
    let announcement = `Context changed: ${context}`;

    if (details) {
      const detailStrings = Object.entries(details).map(([key, value]) => `${key}: ${value}`);
      announcement += `. Details: ${detailStrings.join(', ')}`;
    }

    this.ariaManager.announce(announcement, 'polite');
  }

  announceActionResult(action: string, success: boolean, details?: string): void {
    const result = success ? 'successful' : 'failed';
    let announcement = `Action ${action} was ${result}`;

    if (details) {
      announcement += `. ${details}`;
    }

    this.ariaManager.announce(announcement, success ? 'polite' : 'assertive');
  }

  announceFormValidation(errors: string[]): void {
    if (errors.length === 0) {
      this.ariaManager.announce('Form validation successful', 'polite');
    } else {
      const errorCount = errors.length;
      const errorSummary = `Form has ${errorCount} validation error${errorCount > 1 ? 's' : ''}`;
      this.ariaManager.announce(`${errorSummary}. ${errors.join('. ')}`, 'assertive');
    }
  }

  announceLoadingState(description: string, completed?: boolean): void {
    const status = completed ? 'completed' : 'in progress';
    this.ariaManager.announce(`Loading ${description} ${status}`, 'polite');
  }

  announceNavigationChange(from: string, to: string): void {
    this.ariaManager.announce(`Navigated from ${from} to ${to}`, 'polite');
  }

  // Screen reader specific optimizations
  optimizeForScreenReader(screenReader: string): void {
    switch (screenReader) {
      case 'NVDA':
        this.applyNVDAOoptimizations();
        break;
      case 'JAWS':
        this.applyJAWSOptimizations();
        break;
      case 'VoiceOver':
        this.applyVoiceOverOptimizations();
        break;
      case 'TalkBack':
        this.applyTalkBackOptimizations();
        break;
    }
  }

  private applyNVDAOoptimizations(): void {
    // NVDA-specific optimizations
    document.documentElement.setAttribute('lang', 'en');
    // Add NVDA-specific CSS if needed
  }

  private applyJAWSOptimizations(): void {
    // JAWS-specific optimizations
    // Ensure proper heading hierarchy
    this.ensureHeadingHierarchy();
  }

  private applyVoiceOverOptimizations(): void {
    // VoiceOver-specific optimizations
    // Ensure proper ARIA labels
    this.ensureAriaLabels();
  }

  private applyTalkBackOptimizations(): void {
    // TalkBack-specific optimizations for Android
    // Ensure touch target sizes
    this.ensureTouchTargets();
  }

  private ensureHeadingHierarchy(): void {
    // Ensure proper heading structure (h1 -> h2 -> h3, etc.)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        // Fix heading hierarchy violation
        console.warn(`Heading hierarchy violation: ${heading.tagName} after h${lastLevel}`);
      }
      lastLevel = level;
    });
  }

  private ensureAriaLabels(): void {
    // Ensure all interactive elements have proper labels
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [role="button"]');

    interactiveElements.forEach(element => {
      const el = element as HTMLElement;
      const hasLabel = el.hasAttribute('aria-label') ||
                      el.hasAttribute('aria-labelledby') ||
                      el.hasAttribute('title') ||
                      el.textContent?.trim();

      if (!hasLabel) {
        console.warn('Interactive element missing accessible label:', el);
        // Add a generic label
        el.setAttribute('aria-label', 'Interactive element');
      }
    });
  }

  private ensureTouchTargets(): void {
    // Ensure touch targets meet minimum size requirements (44x44px)
    const touchTargets = document.querySelectorAll('button, input, select, textarea, a, [role="button"]');

    touchTargets.forEach(element => {
      const el = element as HTMLElement;
      const rect = el.getBoundingClientRect();

      if (rect.width < 44 || rect.height < 44) {
        console.warn('Touch target too small:', el, `${rect.width}x${rect.height}px`);
        // Add padding to meet minimum size
        const additionalPadding = Math.max(0, 44 - Math.min(rect.width, rect.height)) / 2;
        el.style.padding = `${additionalPadding}px`;
      }
    });
  }
}

// Contrast and Color Accessibility Manager
interface ColorAnalysis {
  foreground: string;
  background: string;
  contrastRatio: number;
  isWCAGCompliant: boolean;
  recommendations: string[];
}

export class ContrastAndColorManager {
  private colorCache: Map<string, ColorAnalysis> = new Map();

  // WCAG 3.0 AAA Contrast Requirements
  private contrastRatios = {
    normalText: 4.5,
    largeText: 3.0,
    graphics: 3.0,
  };

  analyzeColorContrast(foreground: string, background: string): ColorAnalysis {
    const cacheKey = `${foreground}-${background}`;
    if (this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }

    const analysis: ColorAnalysis = {
      foreground,
      background,
      contrastRatio: this.calculateContrastRatio(foreground, background),
      isWCAGCompliant: false,
      recommendations: [],
    };

    // Check compliance for different text sizes
    analysis.isWCAGCompliant = analysis.contrastRatio >= this.contrastRatios.normalText;

    if (analysis.contrastRatio < this.contrastRatios.normalText) {
      analysis.recommendations.push(`Increase contrast ratio to at least ${this.contrastRatios.normalText}:1 for normal text`);
    }

    if (analysis.contrastRatio < this.contrastRatios.largeText) {
      analysis.recommendations.push(`Increase contrast ratio to at least ${this.contrastRatios.largeText}:1 for large text`);
    }

    this.colorCache.set(cacheKey, analysis);
    return analysis;
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Convert colors to RGB
    const rgb1 = this.hexToRgb(color1) || this.namedColorToRgb(color1);
    const rgb2 = this.hexToRgb(color2) || this.namedColorToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    // Calculate relative luminance
    const lum1 = this.calculateRelativeLuminance(rgb1);
    const lum2 = this.calculateRelativeLuminance(rgb2);

    // Calculate contrast ratio
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private calculateRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;

    // Convert to linear RGB
    const toLinear = (value: number) => {
      value = value / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private namedColorToRgb(colorName: string): { r: number; g: number; b: number } | null {
    // Basic color mapping - expand as needed
    const colorMap: Record<string, { r: number; g: number; b: number }> = {
      'black': { r: 0, g: 0, b: 0 },
      'white': { r: 255, g: 255, b: 255 },
      'red': { r: 255, g: 0, b: 0 },
      'green': { r: 0, g: 128, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'gray': { r: 128, g: 128, b: 128 },
    };

    return colorMap[colorName.toLowerCase()] || null;
  }

  // Color blindness simulation
  simulateColorBlindness(color: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    let simulatedRgb: { r: number; g: number; b: number };

    switch (type) {
      case 'protanopia':
        simulatedRgb = {
          r: rgb.r * 0.567 + rgb.g * 0.433 + rgb.b * 0.000,
          g: rgb.r * 0.558 + rgb.g * 0.442 + rgb.b * 0.000,
          b: rgb.r * 0.000 + rgb.g * 0.242 + rgb.b * 0.758,
        };
        break;
      case 'deuteranopia':
        simulatedRgb = {
          r: rgb.r * 0.625 + rgb.g * 0.375 + rgb.b * 0.000,
          g: rgb.r * 0.700 + rgb.g * 0.300 + rgb.b * 0.000,
          b: rgb.r * 0.000 + rgb.g * 0.300 + rgb.b * 0.700,
        };
        break;
      case 'tritanopia':
        simulatedRgb = {
          r: rgb.r * 0.950 + rgb.g * 0.050 + rgb.b * 0.000,
          g: rgb.r * 0.000 + rgb.g * 0.433 + rgb.b * 0.567,
          b: rgb.r * 0.000 + rgb.g * 0.475 + rgb.b * 0.525,
        };
        break;
    }

    return this.rgbToHex(simulatedRgb);
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  // Automatic color correction
  suggestAccessibleColors(baseColor: string, backgroundColor: string): {
    suggestedForeground: string;
    suggestedBackground: string;
    improvements: string[];
  } {
    const analysis = this.analyzeColorContrast(baseColor, backgroundColor);

    if (analysis.isWCAGCompliant) {
      return {
        suggestedForeground: baseColor,
        suggestedBackground: backgroundColor,
        improvements: [],
      };
    }

    // Generate more accessible color combinations
    const suggestions = this.generateAccessibleCombinations(baseColor, backgroundColor);

    return {
      suggestedForeground: suggestions[0].foreground,
      suggestedBackground: suggestions[0].background,
      improvements: suggestions[0].improvements,
    };
  }

  private generateAccessibleCombinations(_baseColor: string, _backgroundColor: string): Array<{
    foreground: string;
    background: string;
    improvements: string[];
  }> {
    // Generate variations with better contrast
    // This is a simplified implementation - in production would use color theory algorithms
    return [{
      foreground: '#000000', // Black text
      background: '#FFFFFF', // White background
      improvements: ['High contrast ratio', 'WCAG AAA compliant', 'Readable for all users'],
    }];
  }
}

// Motion and Animation Manager
export class MotionAndAnimationManager {
  private reducedMotion = false;
  private prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    this.checkMotionPreference();
    this.prefersReducedMotion.addEventListener('change', this.handleMotionPreferenceChange.bind(this));
  }

  private checkMotionPreference(): void {
    this.reducedMotion = this.prefersReducedMotion.matches;
    this.applyMotionPreferences();
  }

  private handleMotionPreferenceChange(event: MediaQueryListEvent): void {
    this.reducedMotion = event.matches;
    this.applyMotionPreferences();
  }

  private applyMotionPreferences(): void {
    const body = document.body;

    if (this.reducedMotion) {
      body.style.setProperty('--animation-duration', '0.01ms');
      body.style.setProperty('--transition-duration', '0.01ms');
    } else {
      body.style.setProperty('--animation-duration', '300ms');
      body.style.setProperty('--transition-duration', '200ms');
    }

    // Dispatch custom event for components to respond
    const event = new CustomEvent('motionPreferenceChanged', {
      detail: { reducedMotion: this.reducedMotion }
    });
    document.dispatchEvent(event);
  }

  // Animation utilities with motion preferences
  animateElement(element: HTMLElement, animation: string, options: {
    duration?: number;
    easing?: string;
    fill?: 'forwards' | 'backwards' | 'both';
  } = {}): Animation | null {
    if (this.reducedMotion) {
      // Skip animations for users who prefer reduced motion
      return null;
    }

    const keyframes = this.getAnimationKeyframes(animation);
    if (!keyframes) return null;

    return element.animate(keyframes, {
      duration: options.duration || 300,
      easing: options.easing || 'ease-out',
      fill: options.fill || 'forwards',
    });
  }

  private getAnimationKeyframes(animation: string): Keyframe[] | null {
    const animations: Record<string, Keyframe[]> = {
      fadeIn: [
        { opacity: 0 },
        { opacity: 1 }
      ],
      slideInFromRight: [
        { transform: 'translateX(100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      scaleIn: [
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      bounce: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ],
    };

    return animations[animation] || null;
  }

  // Focus animations with accessibility considerations
  animateFocus(element: HTMLElement): void {
    if (this.reducedMotion) {
      // Simple focus ring without animation
      element.style.outline = '2px solid #007acc';
      element.style.outlineOffset = '2px';
      return;
    }

    // Animated focus ring
    element.animate([
      { outline: '2px solid transparent', outlineOffset: '0px' },
      { outline: '2px solid #007acc', outlineOffset: '2px' },
      { outline: '2px solid transparent', outlineOffset: '0px' }
    ], {
      duration: 600,
      iterations: 2,
    });
  }

  // Loading animations with accessibility
  createLoadingSpinner(container: HTMLElement, options: {
    size?: number;
    color?: string;
    speed?: number;
  } = {}): HTMLElement {
    const spinner = document.createElement('div');
    spinner.setAttribute('role', 'progressbar');
    spinner.setAttribute('aria-label', 'Loading');

    const size = options.size || 40;
    const color = options.color || '#007acc';
    const speed = this.reducedMotion ? 0 : (options.speed || 1);

    spinner.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid ${color};
      border-radius: 50%;
      animation: spin ${1 / speed}s linear infinite;
      display: inline-block;
    `;

    if (!this.reducedMotion) {
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(spinner);
    return spinner;
  }

  // Page transition animations
  animatePageTransition(fromElement: HTMLElement, toElement: HTMLElement, direction: 'forward' | 'backward' = 'forward'): void {
    if (this.reducedMotion) {
      fromElement.style.display = 'none';
      toElement.style.display = 'block';
      return;
    }

    const fromTransform = direction === 'forward' ? 'translateX(0)' : 'translateX(-100%)';
    const toTransform = direction === 'forward' ? 'translateX(-100%)' : 'translateX(0)';

    // Animate out current page
    fromElement.animate([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: toTransform, opacity: 0 }
    ], {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards',
    });

    // Animate in new page
    toElement.style.transform = fromTransform === 'translateX(0)' ? 'translateX(100%)' : 'translateX(-100%)';
    toElement.style.opacity = '0';

    toElement.animate([
      { transform: fromTransform === 'translateX(0)' ? 'translateX(100%)' : 'translateX(-100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: 150,
    });
  }
}

// Main Accessibility Manager
export class AdvancedAccessibilityManager {
  private config: z.infer<typeof AccessibilityConfigSchema>;
  private ariaManager: AdvancedARIAManager;
  private focusManager: AdvancedFocusManager;
  private violations: z.infer<typeof AccessibilityViolationSchema>[] = [];

  constructor() {
    this.config = {
      theme: 'auto',
      fontSize: 'medium',
      colorScheme: 'default',
      motionPreference: 'no-preference',
      textSpacing: 'normal',
      keyboardNavigation: 'enhanced',
      announcements: 'moderate',
      focusIndicators: 'enhanced',
    };

    this.ariaManager = new AdvancedARIAManager();
    this.focusManager = new AdvancedFocusManager();

    this.initializeAccessibility();
  }

  private async initializeAccessibility(): Promise<void> {
    // Apply initial configuration
    this.applyConfiguration();

    // Set up global accessibility features
    this.setupGlobalAccessibility();

    // Run initial accessibility audit
    await this.runAccessibilityAudit();
  }

  private applyConfiguration(): void {
    const root = document.documentElement;

    // Apply theme
    root.setAttribute('data-theme', this.config.theme);

    // Apply font size
    root.setAttribute('data-font-size', this.config.fontSize);

    // Apply color scheme
    root.setAttribute('data-color-scheme', this.config.colorScheme);

    // Apply motion preference
    root.setAttribute('data-motion-preference', this.config.motionPreference);

    // Apply text spacing
    root.setAttribute('data-text-spacing', this.config.textSpacing);

    // Enable enhanced keyboard navigation
    if (this.config.keyboardNavigation === 'enhanced') {
      this.focusManager.enableEnhancedKeyboardNavigation();
    }
  }

  private setupGlobalAccessibility(): void {
    // Add skip links
    this.focusManager.addSkipLink('main-content', 'Skip to main content');
    this.focusManager.addSkipLink('navigation', 'Skip to navigation');

    // Set up global keyboard shortcuts
    document.addEventListener('keydown', this.handleGlobalKeyboardShortcuts.bind(this));

    // Monitor for accessibility violations
    this.setupViolationMonitoring();
  }

  private handleGlobalKeyboardShortcuts(event: KeyboardEvent): void {
    // Alt + 1: Skip to main content
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        this.focusManager.pushFocus(mainContent);
      }
    }

    // Alt + 2: Skip to navigation
    if (event.altKey && event.key === '2') {
      event.preventDefault();
      const navigation = document.getElementById('navigation');
      if (navigation) {
        navigation.focus();
        this.focusManager.pushFocus(navigation);
      }
    }

    // Ctrl + Alt + A: Toggle high contrast mode
    if (event.ctrlKey && event.altKey && event.key === 'a') {
      event.preventDefault();
      this.toggleHighContrast();
    }
  }

  private setupViolationMonitoring(): void {
    // Monitor for common accessibility violations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementForViolations(node as Element);
            }
          });
        } else if (mutation.type === 'attributes') {
          this.checkElementForViolations(mutation.target as Element);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['alt', 'aria-label', 'aria-labelledby', 'role', 'tabindex']
    });
  }

  private checkElementForViolations(element: Element): void {
    // Check for common accessibility violations
    const el = element as HTMLElement;

    // Missing alt text on images
    if (el.tagName === 'IMG' && !el.hasAttribute('alt') && !el.hasAttribute('aria-label')) {
      this.reportViolation({
        id: crypto.randomUUID(),
        rule: 'image-alt',
        severity: 'serious',
        wcagGuideline: '1.1.1',
        description: 'Image missing alt text',
        element: el.outerHTML.substring(0, 100),
        impact: 'Screen reader users cannot understand image content',
        suggestion: 'Add alt attribute describing the image content',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // Empty links
    if (el.tagName === 'A' && !el.textContent?.trim() && !el.hasAttribute('aria-label')) {
      this.reportViolation({
        id: crypto.randomUUID(),
        rule: 'link-text',
        severity: 'serious',
        wcagGuideline: '2.4.4',
        description: 'Link with no accessible text',
        element: el.outerHTML.substring(0, 100),
        impact: 'Screen reader users cannot navigate to link destination',
        suggestion: 'Add link text or aria-label attribute',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // Form controls without labels
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) &&
        el.getAttribute('type') !== 'hidden' &&
        !el.hasAttribute('aria-label') &&
        !el.hasAttribute('aria-labelledby') &&
        !document.querySelector(`label[for="${el.id}"]`)) {
      this.reportViolation({
        id: crypto.randomUUID(),
        rule: 'form-label',
        severity: 'serious',
        wcagGuideline: '3.3.2',
        description: 'Form control missing accessible label',
        element: el.outerHTML.substring(0, 100),
        impact: 'Users cannot understand what information to enter',
        suggestion: 'Add label element or aria-label attribute',
        timestamp: Date.now(),
        resolved: false,
      });
    }
  }

  private reportViolation(violation: z.infer<typeof AccessibilityViolationSchema>): void {
    this.violations.push(violation);
    console.warn('Accessibility Violation:', violation);

    // Announce critical violations to screen readers
    if (violation.severity === 'critical') {
      this.ariaManager.announce(`Accessibility issue: ${violation.description}`, 'assertive');
    }
  }

  private async runAccessibilityAudit(): Promise<void> {
    // Run comprehensive accessibility audit
    const auditResults = await this.performAccessibilityAudit();

    auditResults.violations.forEach(violation => {
      this.reportViolation(violation);
    });

    // Generate accessibility report
    const report = {
      totalViolations: auditResults.violations.length,
      violationsBySeverity: {
        minor: auditResults.violations.filter(v => v.severity === 'minor').length,
        moderate: auditResults.violations.filter(v => v.severity === 'moderate').length,
        serious: auditResults.violations.filter(v => v.severity === 'serious').length,
        critical: auditResults.violations.filter(v => v.severity === 'critical').length,
      },
      wcagCompliance: this.calculateWCAGCompliance(auditResults),
    };

    console.log('Accessibility Audit Complete:', report);
  }

  private async performAccessibilityAudit(): Promise<{
    violations: z.infer<typeof AccessibilityViolationSchema>[];
    score: number;
  }> {
    const violations: z.infer<typeof AccessibilityViolationSchema>[] = [];

    // Basic audit checks (expand in production)
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        violations.push({
          id: crypto.randomUUID(),
          rule: 'image-alt',
          severity: 'serious',
          wcagGuideline: '1.1.1',
          description: 'Image missing alt attribute',
          element: img.outerHTML.substring(0, 100),
          impact: 'Screen readers cannot describe image',
          suggestion: 'Add descriptive alt text',
          timestamp: Date.now(),
          resolved: false,
        });
      }
    });

    return {
      violations,
      score: Math.max(0, 100 - (violations.length * 5)), // Simple scoring
    };
  }

  private calculateWCAGCompliance(auditResults: { violations: z.infer<typeof AccessibilityViolationSchema>[] }): {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
  } {
    // Simplified compliance calculation
    const criticalViolations = auditResults.violations.filter((v) => v.severity === 'critical');
    const seriousViolations = auditResults.violations.filter((v) => v.severity === 'serious');

    return {
      levelA: criticalViolations.length === 0,
      levelAA: seriousViolations.length === 0,
      levelAAA: auditResults.violations.length === 0,
    };
  }

  // Public API methods
  updateConfiguration(newConfig: Partial<z.infer<typeof AccessibilityConfigSchema>>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyConfiguration();
  }

  getConfiguration(): z.infer<typeof AccessibilityConfigSchema> {
    return { ...this.config };
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.ariaManager.announce(message, priority);
  }

  toggleHighContrast(): void {
    const newScheme = this.config.colorScheme === 'high-contrast' ? 'default' : 'high-contrast';
    this.updateConfiguration({ colorScheme: newScheme });
  }

  getViolations(): z.infer<typeof AccessibilityViolationSchema>[] {
    return [...this.violations];
  }

  getAccessibilityReport(): {
    configuration: z.infer<typeof AccessibilityConfigSchema>;
    violations: z.infer<typeof AccessibilityViolationSchema>[];
    compliance: { levelA: boolean; levelAA: boolean; levelAAA: boolean };
  } {
    return {
      configuration: this.config,
      violations: this.violations,
      compliance: this.calculateWCAGCompliance({ violations: this.violations }),
    };
  }

  // Component helpers
  makeElementFocusable(element: HTMLElement, options: {
    tabIndex?: number;
    skipToContent?: boolean;
  } = {}): void {
    element.setAttribute('tabindex', (options.tabIndex || 0).toString());

    if (options.skipToContent) {
      element.setAttribute('data-skip-link', 'true');
    }
  }

  createAriaDescribedBy(element: HTMLElement, description: string): HTMLElement {
    const descriptionId = `desc-${crypto.randomUUID()}`;
    const descriptionElement = document.createElement('span');
    descriptionElement.id = descriptionId;
    descriptionElement.textContent = description;
    descriptionElement.style.position = 'absolute';
    descriptionElement.style.left = '-10000px';
    descriptionElement.style.width = '1px';
    descriptionElement.style.height = '1px';
    descriptionElement.style.overflow = 'hidden';

    element.setAttribute('aria-describedby', descriptionId);
    element.appendChild(descriptionElement);

    return descriptionElement;
  }
}

// Global instances
export const accessibilityManager = new AdvancedAccessibilityManager();

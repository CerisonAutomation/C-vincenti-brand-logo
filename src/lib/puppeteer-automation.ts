/**
 * MCP Puppeteer Headless Automation Infrastructure
 * Provides production-ready headless automation capabilities
 * Integrates with logging system for comprehensive monitoring
 */

import puppeteer from 'puppeteer-core';
import { logger } from './logger';

export interface PuppeteerConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  timeout?: number;
  slowMo?: number;
  devtools?: boolean;
}

export interface AutomationTask {
  id: string;
  name: string;
  url: string;
  actions: AutomationAction[];
  expectedResults?: ExpectedResult[];
  timeout?: number;
  retries?: number;
}

export interface AutomationAction {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot' | 'evaluate' | 'scroll' | 'hover';
  selector?: string;
  value?: string;
  timeout?: number;
  options?: Record<string, unknown>;
}

export interface ExpectedResult {
  type: 'element' | 'text' | 'url' | 'performance' | 'accessibility';
  selector?: string;
  value?: string;
  condition: 'exists' | 'visible' | 'contains' | 'equals' | 'greater_than' | 'less_than';
  threshold?: number;
}

export interface AutomationResult {
  taskId: string;
  success: boolean;
  duration: number;
  screenshots?: string[];
  performance?: PerformanceMetrics;
  errors?: string[];
  accessibility?: AccessibilityReport;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize?: number;
  memoryUsage?: number;
}

export interface AccessibilityReport {
  violations: number;
  warnings: number;
  passes: number;
  incomplete: number;
}

class PuppeteerAutomation {
  private static instance: PuppeteerAutomation;
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private config: PuppeteerConfig;

  constructor(config: PuppeteerConfig = {}) {
    this.config = {
      headless: true,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: 30000,
      slowMo: 0,
      devtools: false,
      ...config,
    };
  }

  static getInstance(config?: PuppeteerConfig): PuppeteerAutomation {
    if (!PuppeteerAutomation.instance) {
      PuppeteerAutomation.instance = new PuppeteerAutomation(config);
    }
    return PuppeteerAutomation.instance;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Puppeteer browser');

      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport(this.config.viewport);
      await this.page.setUserAgent(this.config.userAgent!);
      await this.page.setDefaultTimeout(this.config.timeout!);

      // Enable performance monitoring
      await this.page.coverage.startJSCoverage();
      await this.page.coverage.startCSSCoverage();

      logger.info('Puppeteer browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Puppeteer browser', { error });
      throw error;
    }
  }

  async executeTask(task: AutomationTask): Promise<AutomationResult> {
    const startTime = performance.now();
    const result: AutomationResult = {
      taskId: task.id,
      success: false,
      duration: 0,
      screenshots: [],
      errors: [],
    };

    try {
      if (!this.page) {
        throw new Error('Puppeteer not initialized');
      }

      logger.info(`Executing automation task: ${task.name}`, { taskId: task.id });

      // Navigate to initial URL
      await this.page.goto(task.url, { waitUntil: 'networkidle2' });

      // Execute actions
      for (const action of task.actions) {
        await this.executeAction(action);
      }

      // Take final screenshot
      const screenshot = await this.page.screenshot({
        type: 'png',
        fullPage: true,
        encoding: 'base64',
      });
      result.screenshots.push(screenshot as string);

      // Collect performance metrics
      result.performance = await this.collectPerformanceMetrics();

      // Run accessibility audit
      result.accessibility = await this.runAccessibilityAudit();

      // Validate expected results
      if (task.expectedResults) {
        await this.validateExpectedResults(task.expectedResults);
      }

      result.success = true;
      logger.info(`Automation task completed successfully: ${task.name}`, {
        taskId: task.id,
        duration: performance.now() - startTime,
      });

    } catch (error) {
      result.success = false;
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
      logger.error(`Automation task failed: ${task.name}`, {
        taskId: task.id,
        error,
        duration: performance.now() - startTime,
      });
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  private async executeAction(action: AutomationAction): Promise<void> {
    const timeout = action.timeout || this.config.timeout!;

    switch (action.type) {
      case 'navigate': {
        if (!action.url) throw new Error('URL required for navigate action');
        await this.page!.goto(action.url, { waitUntil: 'networkidle2', timeout });
        break;
      }

      case 'click': {
        if (!action.selector) throw new Error('Selector required for click action');
        await this.page!.click(action.selector, { timeout });
        break;
      }

      case 'type': {
        if (!action.selector || !action.value) throw new Error('Selector and value required for type action');
        await this.page!.type(action.selector, action.value, { timeout });
        break;
      }

      case 'wait': {
        const waitTime = action.value ? parseInt(action.value) : 1000;
        await this.page!.waitForTimeout(waitTime);
        break;
      }

      case 'screenshot': {
        const screenshot = await this.page!.screenshot({
          type: 'png',
          fullPage: true,
          encoding: 'base64',
        });
        logger.debug('Screenshot captured', { size: screenshot.length });
        break;
      }

      case 'evaluate': {
        if (!action.value) throw new Error('Script required for evaluate action');
        await this.page!.evaluate(action.value);
        break;
      }

      case 'scroll': {
        await this.page!.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await this.page!.waitForTimeout(1000);
        break;
      }

      case 'hover': {
        if (!action.selector) throw new Error('Selector required for hover action');
        await this.page!.hover(action.selector, { timeout });
        break;
      }

      default: {
        // Use type assertion for exhaustive checking
        throw new Error(`Unknown action type: ${(action as { type: string }).type}`);
      }
    }
  }

  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics = await this.page!.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: 0, // Will be populated by PerformanceObserver
        largestContentfulPaint: 0, // Will be populated by PerformanceObserver
        cumulativeLayoutShift: 0, // Will be populated by PerformanceObserver
        firstInputDelay: 0, // Will be populated by PerformanceObserver
      };
    });

    // Get Web Vitals
    const webVitals = await this.page!.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {};

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals.firstContentfulPaint = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.largestContentfulPaint = entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cumulativeLayoutShift = (vitals.cumulativeLayoutShift || 0) + (entry as unknown as { value: number }).value;
            }
            if (entry.entryType === 'first-input') {
              vitals.firstInputDelay = (entry as unknown as { processingStart: number }).processingStart - entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });

        setTimeout(() => resolve(vitals), 3000);
      });
    });

    // Get bundle coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
      this.page!.coverage.stopJSCoverage(),
      this.page!.coverage.stopCSSCoverage(),
    ]);

    const bundleSize = [...jsCoverage, ...cssCoverage].reduce(
      (total, entry) => total + entry.text.length,
      0
    ) / 1024; // Convert to KB

    // Get memory usage
    const pageMetrics = this.page!.metrics();
    const memoryUsage = (pageMetrics as { JSHeapUsedSize: number }).JSHeapUsedSize / 1024 / 1024; // Convert to MB

    return {
      ...metrics,
      ...webVitals,
      bundleSize,
      memoryUsage,
    };
  }

  private async runAccessibilityReport(): Promise<AccessibilityReport> {
    const report = await this.page!.evaluate(() => {
      // Basic accessibility check
      const images = Array.from(document.querySelectorAll('img'));
      const imagesWithoutAlt = images.filter(img => !img.alt);

      const links = Array.from(document.querySelectorAll('a'));
      const linksWithoutText = links.filter(link => !link.textContent?.trim());

      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasHeadingStructure = headings.length > 0;

      const forms = document.querySelectorAll('form');
      const formsWithoutLabels = Array.from(forms).filter(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        return Array.from(inputs).some(input => {
          const id = input.id;
          const label = document.querySelector(`label[for="${id}"]`);
          return !label && !input.getAttribute('aria-label') && !input.getAttribute('title');
        });
      });

      return {
        violations: imagesWithoutAlt.length + linksWithoutText.length + formsWithoutLabels.length,
        warnings: hasHeadingStructure ? 0 : 1,
        passes: images.length - imagesWithoutAlt.length + links.length - linksWithoutText.length,
        incomplete: 0,
      };
    });

    return report;
  }

  private async validateExpectedResults(expectedResults: ExpectedResult[]): Promise<void> {
    for (const result of expectedResults) {
      const isValid = await this.page!.evaluate((expected) => {
        switch (expected.type) {
          case 'element': {
            const element = document.querySelector(expected.selector!);
            switch (expected.condition) {
              case 'exists':
                return element !== null;
              case 'visible':
                return element !== null && element.offsetParent !== null;
              default:
                return false;
            }
          }

          case 'text': {
            const textElement = document.querySelector(expected.selector!);
            if (!textElement) return false;
            const text = textElement.textContent || '';
            switch (expected.condition) {
              case 'contains':
                return text.includes(expected.value!);
              case 'equals':
                return text === expected.value;
              default:
                return false;
            }
          }

          case 'url': {
            const currentUrl = window.location.href;
            switch (expected.condition) {
              case 'contains':
                return currentUrl.includes(expected.value!);
              case 'equals':
                return currentUrl === expected.value;
              default:
                return false;
            }
          }

          default:
            return false;
        }
      }, result);

      if (!isValid) {
        throw new Error(`Expected result validation failed: ${result.type} ${result.condition}`);
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      logger.info('Puppeteer browser cleaned up successfully');
    } catch (error) {
      logger.error('Error during Puppeteer cleanup', { error });
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.browser || !this.browser.isConnected()) {
        return false;
      }

      if (!this.page || this.page.isClosed()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Puppeteer health check failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const puppeteerAutomation = PuppeteerAutomation.getInstance();

// Export convenience functions
export const automation = {
  initialize: () => puppeteerAutomation.initialize(),
  executeTask: (task: AutomationTask) => puppeteerAutomation.executeTask(task),
  cleanup: () => puppeteerAutomation.cleanup(),
  healthCheck: () => puppeteerAutomation.healthCheck(),
};

export default puppeteerAutomation;

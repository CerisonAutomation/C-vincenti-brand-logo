/**
 * Observability & Monitoring System
 * Comprehensive logging, metrics, and distributed tracing
 */

// Structured Logging
export class Logger {
  private static level = import.meta.env.PROD ? 'info' : 'debug';
  private static context: Record<string, any> = {};

  static setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  static clearContext(): void {
    this.context = {};
  }

  static log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: this.context,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    // Console output
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');

    // Send to monitoring service
    if (level === 'error' || level === 'warn') {
      this.sendToMonitoring(logEntry);
    }

    // Store in local storage for debugging
    if (import.meta.env.DEV) {
      this.storeInLocalStorage(logEntry);
    }
  }

  static debug(message: string, data?: any): void {
    if (this.level === 'debug') this.log('debug', message, data);
  }

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  static error(message: string, error?: Error, data?: any): void {
    const errorData = error ? {
      ...data,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      }
    } : data;

    this.log('error', message, errorData);
  }

  private static sendToMonitoring(logEntry: any): void {
    if (import.meta.env.PROD) {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(() => {
        // Ignore errors to prevent infinite loops
      });
    }
  }

  private static storeInLocalStorage(logEntry: any): void {
    try {
      const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('debug_logs', JSON.stringify(logEntry));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

// Metrics Collection
export class Metrics {
  private static counters = new Map<string, number>();
  private static gauges = new Map<string, number>();
  private static histograms = new Map<string, number[]>();

  static increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
    this.reportMetric('counter', name, current + value);
  }

  static gauge(name: string, value: number): void {
    this.gauges.set(name, value);
    this.reportMetric('gauge', name, value);
  }

  static histogram(name: string, value: number): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);
    this.reportMetric('histogram', name, value);
  }

  static startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.histogram(`${name}_duration`, duration);
    };
  }

  private static reportMetric(type: string, name: string, value: number): void {
    const metric = {
      type,
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Send to metrics service
    if (import.meta.env.PROD) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(() => {
        // Ignore errors
      });
    }
  }

  static getMetrics(): { counters: Record<string, number>; gauges: Record<string, number>; histograms: Record<string, number[]> } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms)
    };
  }
}

// Distributed Tracing
export class Tracer {
  private static traces = new Map<string, any[]>();
  private static currentSpan: any = null;

  static startSpan(operationName: string, tags?: Record<string, any>): string {
    const spanId = crypto.randomUUID();
    const traceId = this.currentSpan?.traceId || crypto.randomUUID();
    const parentId = this.currentSpan?.spanId || null;

    const span = {
      spanId,
      traceId,
      parentId,
      operationName,
      startTime: performance.now(),
      tags: { ...tags, url: window.location.href },
      logs: []
    };

    this.currentSpan = span;
    
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    
    this.traces.get(traceId)!.push(span);

    return spanId;
  }

  static addTag(spanId: string, key: string, value: any): void {
    const span = this.findSpan(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  static addLog(spanId: string, message: string, data?: any): void {
    const span = this.findSpan(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        message,
        data
      });
    }
  }

  static finishSpan(spanId: string): void {
    const span = this.findSpan(spanId);
    if (span) {
      span.endTime = performance.now();
      span.duration = span.endTime - span.startTime;
      
      if (this.currentSpan?.spanId === spanId) {
        this.currentSpan = null;
      }
    }
  }

  private static findSpan(spanId: string): any {
    for (const trace of this.traces.values()) {
      const span = trace.find(s => s.spanId === spanId);
      if (span) return span;
    }
    return null;
  }

  static getTrace(traceId: string): any[] {
    return this.traces.get(traceId) || [];
  }

  static getAllTraces(): Record<string, any[]> {
    return Object.fromEntries(this.traces);
  }
}

// Health Checks
export class HealthChecker {
  private static checks = new Map<string, () => Promise<boolean>>();
  private static status = new Map<string, { status: 'healthy' | 'unhealthy'; lastCheck: number; error?: string }>();

  static addCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }

  static async runChecks(): Promise<Record<string, { status: string; lastCheck: number; error?: string }>> {
    const results: Record<string, { status: string; lastCheck: number; error?: string }> = {};

    for (const [name, checkFn] of this.checks) {
      try {
        const startTime = performance.now();
        const healthy = await checkFn();
        const duration = performance.now() - startTime;

        this.status.set(name, {
          status: healthy ? 'healthy' : 'unhealthy',
          lastCheck: Date.now(),
          error: healthy ? undefined : `Check failed after ${duration.toFixed(2)}ms`
        });

        results[name] = this.status.get(name)!;
      } catch (error) {
        this.status.set(name, {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        results[name] = this.status.get(name)!;
      }
    }

    return results;
  }

  static getStatus(): Record<string, { status: string; lastCheck: number; error?: string }> {
    return Object.fromEntries(this.status);
  }
}

// Error Tracking
export class ErrorTracker {
  private static errorCounts = new Map<string, number>();
  private static errorThresholds = new Map<string, { count: number; window: number }>();

  static trackError(error: Error, context?: Record<string, any>): void {
    const errorKey = `${error.name}:${error.message}`;
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    Logger.error('Application error', error, context);

    // Check thresholds
    const threshold = this.errorThresholds.get(errorKey);
    if (threshold && count >= threshold.count) {
      this.reportCriticalError(error, context);
    }
  }

  static setErrorThreshold(errorKey: string, count: number, windowMs: number): void {
    this.errorThresholds.set(errorKey, { count, window: windowMs });
  }

  private static reportCriticalError(error: Error, context?: Record<string, any>): void {
    const criticalError = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (import.meta.env.PROD) {
      fetch('/api/critical-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criticalError)
      }).catch(() => {
        // Ignore errors
      });
    }
  }
}

// User Analytics
export class Analytics {
  private static sessionId = crypto.randomUUID();
  private static userId: string | null = null;

  static setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('user_id', userId);
  }

  static getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('user_id');
    }
    return this.userId;
  }

  static trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event = {
      eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.getUserId(),
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer
      }
    };

    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    if (import.meta.env.PROD) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Ignore errors
      });
    }
  }

  static trackPageView(page: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', {
      page,
      ...properties
    });
  }

  static trackUserAction(action: string, element: string, properties?: Record<string, any>): void {
    this.trackEvent('user_action', {
      action,
      element,
      ...properties
    });
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  static init(): void {
    // Monitor resource loading
    this.monitorResourceLoading();

    // Monitor navigation timing
    this.monitorNavigationTiming();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor long tasks
    this.monitorLongTasks();
  }

  private static monitorResourceLoading(): void {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach(resource => {
        if (resource.duration > 1000) { // Slow resources
          Logger.warn('Slow resource loading', {
            url: resource.name,
            duration: resource.duration,
            type: resource.initiatorType
          });
        }
      });
    });
  }

  private static monitorNavigationTiming(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      Metrics.histogram('page_load_time', navigation.loadEventEnd - navigation.navigationStart);
      Metrics.histogram('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
      Metrics.histogram('first_paint', navigation.responseEnd - navigation.requestStart);
    });
  }

  private static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        Metrics.gauge('memory_used', memory.usedJSHeapSize);
        Metrics.gauge('memory_total', memory.totalJSHeapSize);
        Metrics.gauge('memory_limit', memory.jsHeapSizeLimit);
      }, 30000);
    }
  }

  private static monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Long tasks > 50ms
            Logger.warn('Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }
}

export default {
  Logger,
  Metrics,
  Tracer,
  HealthChecker,
  ErrorTracker,
  Analytics,
  PerformanceMonitor
};
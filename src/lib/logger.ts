/**
 * Production-Grade Logger Utility
 * Replaces all console.log statements with structured logging
 * Implements zero-trust logging principles with performance optimization
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown> | undefined;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  performance?: {
    duration?: number;
    memory?: number;
    bundleSize?: number;
  };
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.setupErrorHandling();
  }

  private getLogLevel(): LogLevel {
    if (typeof window === 'undefined') return LogLevel.INFO;

    const env = import.meta.env.MODE;
    switch (env) {
      case 'development': return LogLevel.DEBUG;
      case 'test': return LogLevel.WARN;
      case 'production': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private setupErrorHandling(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Unhandled Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: event.reason,
          stack: event.reason?.stack,
        });
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
    };
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      // Polyfill for crypto.randomUUID if not available
      sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'fallback-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getRequestId(): string {
    // Polyfill for crypto.randomUUID if not available
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'req-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private output(entry: LogEntry): void {
    // Performance optimization: batch logs in production
    if (import.meta.env.PROD) {
      this.logs.push(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Send to monitoring service in production
      this.sendToMonitoring(entry);
    } else {
      // Development: immediate output
      this.writeToConsole(entry);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    const method = this.getConsoleMethod(entry.level);
    const args = [entry.message];

    if (entry.context) {
      args.push(JSON.stringify(entry.context, null, 2));
    }

    method.apply(console, args);
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG: return console.debug.bind(console);
      case LogLevel.INFO: return console.info.bind(console);
      case LogLevel.WARN: return console.warn.bind(console);
      case LogLevel.ERROR:
      case LogLevel.FATAL: return console.error.bind(console);
      default: return console.log.bind(console);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    // Send to monitoring service (Sentry, LogRocket, etc.)
    try {
      if (entry.level >= LogLevel.ERROR) {
        // Send critical errors to monitoring
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      // Fail silently to avoid infinite loops
    }
  }

  // Public API methods
  public debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createEntry(LogLevel.DEBUG, message, context);
    this.output(entry);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createEntry(LogLevel.INFO, message, context);
    this.output(entry);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createEntry(LogLevel.WARN, message, context);
    this.output(entry);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createEntry(LogLevel.ERROR, message, context);
    this.output(entry);
  }

  public fatal(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;

    const entry = this.createEntry(LogLevel.FATAL, message, context);
    this.output(entry);
  }

  // Performance logging
  public performance(operation: string, duration: number, context?: Record<string, unknown>): void {
    const entry = this.createEntry(LogLevel.INFO, `Performance: ${operation}`, {
      ...context,
      performance: { duration },
    });
    this.output(entry);
  }

  // Bundle size logging
  public bundleSize(size: number, chunk?: string): void {
    const entry = this.createEntry(LogLevel.INFO, `Bundle size: ${size}KB`, {
      performance: { bundleSize: size },
      chunk,
    });
    this.output(entry);
  }

  // Memory usage logging
  public memory(context?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (memory) {
      const entry = this.createEntry(LogLevel.DEBUG, 'Memory usage', {
        ...context,
        performance: {
          memory: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          },
        },
      });
      this.output(entry);
    }
  }

  // Get recent logs for debugging
  public getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs (useful for testing)
  public clearLogs(): void {
    this.logs = [];
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
  debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
  error: (message: string, context?: Record<string, unknown>) => logger.error(message, context),
  fatal: (message: string, context?: Record<string, unknown>) => logger.fatal(message, context),
  performance: (operation: string, duration: number, context?: Record<string, unknown>) =>
    logger.performance(operation, duration, context),
  bundleSize: (size: number, chunk?: string) => logger.bundleSize(size, chunk),
  memory: (context?: Record<string, unknown>) => logger.memory(context),
};

export default logger;

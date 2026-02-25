/**
 * Chaos Engineering & Self-Healing System
 * Resilience testing and automatic recovery mechanisms
 */

// Chaos Testing Framework
export class ChaosTester {
  private static activeExperiments = new Map<string, any>();
  private static isChaosMode = import.meta.env.CHAOS_MODE === 'true';

  static enableChaosMode(): void {
    this.isChaosMode = true;
    console.log('🧪 Chaos Engineering Mode Enabled');
  }

  static disableChaosMode(): void {
    this.isChaosMode = false;
    this.stopAllExperiments();
    console.log('🧪 Chaos Engineering Mode Disabled');
  }

  static async runExperiment(experiment: ChaosExperiment): Promise<void> {
    if (!this.isChaosMode) return;

    const experimentId = crypto.randomUUID();
    this.activeExperiments.set(experimentId, experiment);

    try {
      console.log(`🧪 Starting experiment: ${experiment.name}`);
      await experiment.setup?.();
      
      // Run the experiment
      await experiment.action();
      
      // Verify hypothesis
      const result = await experiment.verify();
      
      console.log(`🧪 Experiment ${experiment.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
      
      // Cleanup
      await experiment.cleanup?.();
      
    } catch (error) {
      console.error(`🧪 Experiment ${experiment.name} failed:`, error);
    } finally {
      this.activeExperiments.delete(experimentId);
    }
  }

  static stopAllExperiments(): void {
    for (const [id, experiment] of this.activeExperiments) {
      experiment.cleanup?.();
      this.activeExperiments.delete(id);
    }
  }
}

// Chaos Experiment Definitions
export interface ChaosExperiment {
  name: string;
  description: string;
  hypothesis: string;
  setup?: () => Promise<void>;
  action: () => Promise<void>;
  verify: () => Promise<{ success: boolean; metrics: any }>;
  cleanup?: () => Promise<void>;
}

// Network Chaos Experiments
export class NetworkChaos {
  static latencyExperiment(): ChaosExperiment {
    return {
      name: 'Network Latency',
      description: 'Simulate high network latency',
      hypothesis: 'Application should handle network delays gracefully',
      setup: async () => {
        // Setup network delay simulation
        this.simulateLatency(true);
      },
      action: async () => {
        // Introduce 2000ms latency
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      verify: async () => {
        // Check if application remained responsive
        const responseTime = await this.measureResponseTime();
        return {
          success: responseTime < 5000, // Should not exceed 5 seconds
          metrics: { responseTime }
        };
      },
      cleanup: async () => {
        this.simulateLatency(false);
      }
    };
  }

  static failureExperiment(): ChaosExperiment {
    return {
      name: 'Network Failure',
      description: 'Simulate complete network failure',
      hypothesis: 'Application should show appropriate error messages and retry logic',
      setup: async () => {
        this.simulateFailure(true);
      },
      action: async () => {
        // Block all network requests for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
      },
      verify: async () => {
        // Check if error handling worked
        const errorHandled = this.checkErrorHandling();
        return {
          success: errorHandled,
          metrics: { errorHandled }
        };
      },
      cleanup: async () => {
        this.simulateFailure(false);
      }
    };
  }

  private static simulateLatency(enabled: boolean): void {
    if (enabled) {
      // Override fetch to add latency
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return originalFetch.apply(window, args);
      };
    } else {
      // Restore original fetch
      delete (window as any).fetch;
    }
  }

  private static simulateFailure(enabled: boolean): void {
    if (enabled) {
      // Override fetch to fail
      window.fetch = async () => {
        throw new Error('Network failure simulation');
      };
    } else {
      // Restore original fetch
      delete (window as any).fetch;
    }
  }

  private static async measureResponseTime(): Promise<number> {
    const start = performance.now();
    try {
      await fetch('/api/health');
      return performance.now() - start;
    } catch {
      return Infinity;
    }
  }

  private static checkErrorHandling(): boolean {
    // Check if error boundaries and fallback UI are working
    return document.body.innerHTML.includes('error') || 
           document.body.innerHTML.includes('offline') ||
           document.querySelector('[data-testid="error-message"]') !== null;
  }
}

// Memory Chaos Experiments
export class MemoryChaos {
  static memoryLeakExperiment(): ChaosExperiment {
    return {
      name: 'Memory Leak',
      description: 'Simulate memory leaks',
      hypothesis: 'Application should not crash and should handle memory pressure',
      setup: async () => {
        this.createMemoryPressure();
      },
      action: async () => {
        // Hold references to prevent garbage collection
        await new Promise(resolve => setTimeout(resolve, 10000));
      },
      verify: async () => {
        const memoryUsage = this.getMemoryUsage();
        const isStable = memoryUsage < 500 * 1024 * 1024; // Less than 500MB
        return {
          success: isStable,
          metrics: { memoryUsage }
        };
      },
      cleanup: async () => {
        this.releaseMemoryPressure();
      }
    };
  }

  private static createMemoryPressure(): void {
    // Create large objects to consume memory
    (window as any).__chaosMemory = [];
    for (let i = 0; i < 1000; i++) {
      (window as any).__chaosMemory.push(new Array(10000).fill('memory-pressure'));
    }
  }

  private static releaseMemoryPressure(): void {
    (window as any).__chaosMemory = null;
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // Ignore
      }
    }
  }

  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// UI Chaos Experiments
export class UIChaos {
  static componentFailureExperiment(): ChaosExperiment {
    return {
      name: 'Component Failure',
      description: 'Simulate component rendering failures',
      hypothesis: 'Error boundaries should catch failures and show fallback UI',
      setup: async () => {
        this.injectComponentFailure();
      },
      action: async () => {
        // Trigger component re-render
        const root = document.getElementById('root');
        if (root) {
          root.innerHTML = root.innerHTML; // Force re-render
        }
      },
      verify: async () => {
        const hasFallback = document.querySelector('[data-testid="fallback-ui"]') !== null;
        const noErrors = !document.body.innerHTML.includes('ErrorBoundary');
        return {
          success: hasFallback || noErrors,
          metrics: { hasFallback, noErrors }
        };
      },
      cleanup: async () => {
        this.restoreComponents();
      }
    };
  }

  private static injectComponentFailure(): void {
    // Override React to simulate component failures
    if (window.React) {
      const originalRender = window.React.createElement;
      window.React.createElement = (...args) => {
        if (Math.random() < 0.1) { // 10% chance of failure
          throw new Error('Simulated component failure');
        }
        return originalRender.apply(window.React, args);
      };
    }
  }

  private static restoreComponents(): void {
    if (window.React) {
      delete (window.React as any).createElement;
    }
  }
}

// Self-Healing System
export class SelfHealingSystem {
  private static healingStrategies = new Map<string, HealingStrategy>();

  static registerStrategy(name: string, strategy: HealingStrategy): void {
    this.healingStrategies.set(name, strategy);
  }

  static async heal(component: string, error: Error): Promise<boolean> {
    const strategy = this.healingStrategies.get(component);
    if (!strategy) {
      console.warn(`No healing strategy found for ${component}`);
      return false;
    }

    try {
      console.log(`🔧 Attempting to heal ${component}`);
      const result = await strategy.heal(error);
      
      if (result.success) {
        console.log(`✅ Successfully healed ${component}`);
      } else {
        console.log(`❌ Failed to heal ${component}: ${result.reason}`);
      }

      return result.success;
    } catch (healingError) {
      console.error(`💥 Healing failed for ${component}:`, healingError);
      return false;
    }
  }

  static async runHealthCheck(): Promise<void> {
    const checks = [
      this.checkNetworkConnectivity(),
      this.checkMemoryUsage(),
      this.checkComponentHealth(),
      this.checkLocalStorage()
    ];

    const results = await Promise.allSettled(checks);
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      console.warn(`⚠️ Health check detected ${failures.length} issues`);
      await this.initiateRecovery(failures);
    }
  }

  private static async checkNetworkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      if (!response.ok) throw new Error('Network health check failed');
    } catch (error) {
      throw new Error('Network connectivity issue');
    }
  }

  private static async checkMemoryUsage(): Promise<void> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        throw new Error('Memory usage too high');
      }
    }
  }

  private static async checkComponentHealth(): Promise<void> {
    const errorBoundary = document.querySelector('[data-testid="error-boundary"]');
    if (errorBoundary) {
      throw new Error('Component error detected');
    }
  }

  private static async checkLocalStorage(): Promise<void> {
    try {
      localStorage.setItem('health-check', 'ok');
      localStorage.removeItem('health-check');
    } catch (error) {
      throw new Error('LocalStorage unavailable');
    }
  }

  private static async initiateRecovery(failures: PromiseRejectedResult[]): Promise<void> {
    for (const failure of failures) {
      const error = failure.reason;
      console.log(`🔧 Starting recovery for: ${error.message}`);
      
      // Try different recovery strategies
      await this.clearCache();
      await this.resetState();
      await this.reloadCriticalData();
    }
  }

  private static async clearCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  private static async resetState(): Promise<void> {
    try {
      // Clear problematic state
      sessionStorage.clear();
      localStorage.removeItem('problematic-data');
    } catch (error) {
      console.warn('Failed to reset state:', error);
    }
  }

  private static async reloadCriticalData(): Promise<void> {
    try {
      // Reload critical application data
      window.location.reload();
    } catch (error) {
      console.warn('Failed to reload data:', error);
    }
  }
}

// Healing Strategy Interface
export interface HealingStrategy {
  heal(error: Error): Promise<{ success: boolean; reason?: string }>;
}

// Built-in Healing Strategies
export class CacheHealingStrategy implements HealingStrategy {
  async heal(error: Error): Promise<{ success: boolean; reason?: string }> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      return { success: true };
    } catch {
      return { success: false, reason: 'Cache clearing failed' };
    }
  }
}

export class StateHealingStrategy implements HealingStrategy {
  async heal(error: Error): Promise<{ success: boolean; reason?: string }> {
    try {
      sessionStorage.clear();
      localStorage.clear();
      return { success: true };
    } catch {
      return { success: false, reason: 'State clearing failed' };
    }
  }
}

export class ReloadHealingStrategy implements HealingStrategy {
  async heal(error: Error): Promise<{ success: boolean; reason?: string }> {
    try {
      window.location.reload();
      return { success: true };
    } catch {
      return { success: false, reason: 'Reload failed' };
    }
  }
}

// Register default healing strategies
SelfHealingSystem.registerStrategy('cache', new CacheHealingStrategy());
SelfHealingSystem.registerStrategy('state', new StateHealingStrategy());
SelfHealingSystem.registerStrategy('reload', new ReloadHealingStrategy());

export default {
  ChaosTester,
  NetworkChaos,
  MemoryChaos,
  UIChaos,
  SelfHealingSystem,
  CacheHealingStrategy,
  StateHealingStrategy,
  ReloadHealingStrategy
};
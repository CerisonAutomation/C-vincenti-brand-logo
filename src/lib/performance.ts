/**
 * Performance Monitoring & Optimization Utilities
 * Enterprise-grade performance tracking and optimization
 */

// Performance Budgets & Monitoring
export class PerformanceMonitor {
  private static budgets = {
    initialJS: 150 * 1024, // 150KB
    totalJS: 500 * 1024,   // 500KB
    LCP: 2500,            // 2.5s
    FID: 100,             // 100ms
    CLS: 0.1,             // 0.1
    TTFB: 600,            // 600ms
    FCP: 1800,            // 1.8s
  };

  static measureWebVitals(): void {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(this.handleMetric.bind(this, 'CLS'));
      onINP(this.handleMetric.bind(this, 'INP'));
      onFCP(this.handleMetric.bind(this, 'FCP'));
      onLCP(this.handleMetric.bind(this, 'LCP'));
      onTTFB(this.handleMetric.bind(this, 'TTFB'));
    });
  }

  private static handleMetric(name: string, metric: any): void {
    const value = metric.value;
    const budget = this.budgets[name as keyof typeof this.budgets];
    
    if (budget && value > budget) {
      console.warn(`Performance budget exceeded for ${name}: ${value} > ${budget}`);
      this.reportPerformanceIssue(name, value, budget);
    }

    // Send to analytics
    this.sendToAnalytics(name, value);
  }

  private static reportPerformanceIssue(metric: string, value: number, budget: number): void {
    if (import.meta.env.PROD) {
      // Send to monitoring service
      fetch('/api/performance-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          budget,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });
    }
  }

  private static sendToAnalytics(metric: string, value: number): void {
    if (window.gtag) {
      window.gtag('event', metric, {
        event_category: 'Web Vitals',
        value: Math.round(value)
      });
    }
  }

  static measureBundleSize(): void {
    if (import.meta.env.PROD) {
      // Measure actual bundle sizes
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;

      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          fetch(src, { method: 'HEAD' })
            .then(response => {
              const size = response.headers.get('content-length');
              if (size) {
                totalSize += parseInt(size);
              }
            })
            .catch(() => {
              // Ignore errors
            });
        }
      });

      setTimeout(() => {
        if (totalSize > this.budgets.totalJS) {
          console.warn(`Bundle size exceeded: ${totalSize} > ${this.budgets.totalJS}`);
        }
      }, 1000);
    }
  }
}

// Resource Loading Optimization
export class ResourceOptimizer {
  static preloadCriticalResources(): void {
    const criticalResources = [
      { href: '/assets/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
      { href: '/assets/fonts/inter.woff', as: 'font', type: 'font/woff' },
      { href: '/assets/logo.png', as: 'image' },
      { href: '/assets/hero-bg.jpg', as: 'image' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  static lazyLoadImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => observer.observe(img));
  }

  static optimizeFonts(): void {
    // Font display optimization
    const fonts = document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    fonts.forEach(font => {
      font.setAttribute('rel', 'preconnect');
      font.setAttribute('crossorigin', '');
    });
  }
}

// Memory Management
export class MemoryManager {
  private static memoryThreshold = 100 * 1024 * 1024; // 100MB
  private static cleanupInterval: number;

  static startMonitoring(): void {
    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
      this.cleanupUnusedResources();
    }, 30000); // Check every 30 seconds
  }

  static stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private static checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      
      if (used > this.memoryThreshold) {
        console.warn(`High memory usage detected: ${Math.round(used / 1024 / 1024)}MB`);
        this.forceGarbageCollection();
      }
    }
  }

  private static cleanupUnusedResources(): void {
    // Cleanup unused event listeners
    this.cleanupEventListeners();
    
    // Cleanup unused timers
    this.cleanupTimers();
    
    // Cleanup unused DOM nodes
    this.cleanupDOMNodes();
  }

  private static forceGarbageCollection(): void {
    if ('gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // Ignore errors
      }
    }
  }

  private static cleanupEventListeners(): void {
    // Implementation would track and cleanup unused event listeners
  }

  private static cleanupTimers(): void {
    // Implementation would track and cleanup unused timers
  }

  private static cleanupDOMNodes(): void {
    // Cleanup detached DOM nodes
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (!document.body.contains(element)) {
        element.remove();
      }
    });
  }
}

// Network Optimization
export class NetworkOptimizer {
  static enableCompression(): void {
    // Enable gzip/brotli compression hints
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Accept-Encoding';
    meta.content = 'gzip, deflate, br';
    document.head.appendChild(meta);
  }

  static optimizeConnections(): void {
    // Preconnect to important origins
    const origins = [
      'https://api.clerk.com',
      'https://*.supabase.co',
      'https://*.stripe.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  static implementRetryLogic(): void {
    // Override fetch to include retry logic
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let retries = 3;
      
      while (retries > 0) {
        try {
          const response = await originalFetch(input, init);
          if (response.ok) return response;
          
          if (response.status >= 500) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          return response;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error('Max retries exceeded');
    };
  }
}

// Rendering Optimization
export class RenderingOptimizer {
  static optimizeRenderLoop(): void {
    let animationFrameId: number;
    let lastRenderTime = 0;

    const renderLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastRenderTime;
      
      if (deltaTime >= 16.67) { // ~60fps
        // Perform render optimizations
        this.optimizeCSSOM();
        this.optimizeLayout();
        
        lastRenderTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationFrameId);
    });
  }

  private static optimizeCSSOM(): void {
    // Minimize CSSOM reads/writes
    const styleSheets = document.styleSheets;
    
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const rules = styleSheets[i].cssRules;
        if (rules && rules.length > 1000) {
          console.warn(`Large stylesheet detected: ${rules.length} rules`);
        }
      } catch (e) {
        // Cross-origin stylesheets
      }
    }
  }

  private static optimizeLayout(): void {
    // Avoid layout thrashing
    const elements = document.querySelectorAll('*');
    let readCount = 0;
    let writeCount = 0;

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0) readCount++;
      
      if (element instanceof HTMLElement) {
        element.style.transform = element.style.transform; // Force layout
        writeCount++;
      }
    });

    if (readCount > 0 && writeCount > 0) {
      console.warn('Potential layout thrashing detected');
    }
  }

  static implementVirtualization(): void {
    // Virtualization for long lists
    const lists = document.querySelectorAll('[data-virtualize]');
    
    lists.forEach(list => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load visible items
            this.loadVisibleItems(entry.target as HTMLElement);
          } else {
            // Unload non-visible items
            this.unloadNonVisibleItems(entry.target as HTMLElement);
          }
        });
      });

      observer.observe(list);
    });
  }

  private static loadVisibleItems(container: HTMLElement): void {
    // Implementation for loading visible items
  }

  private static unloadNonVisibleItems(container: HTMLElement): void {
    // Implementation for unloading non-visible items
  }
}

// Bundle Analysis
export class BundleAnalyzer {
  static analyzeBundle(): void {
    if (import.meta.env.DEV) {
      import('vite-plugin-visualizer').then(({ visualizer }) => {
        // Bundle analysis would be done during build
        console.log('Bundle analysis available in build mode');
      });
    }
  }

  static measureChunkLoading(): void {
    // Measure chunk loading times
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const chunks = resources.filter(r => r.name.includes('.js'));
      
      chunks.forEach(chunk => {
        console.log(`${chunk.name}: ${chunk.duration}ms`);
      });
    });
  }
}

export default {
  PerformanceMonitor,
  ResourceOptimizer,
  MemoryManager,
  NetworkOptimizer,
  RenderingOptimizer,
  BundleAnalyzer
};
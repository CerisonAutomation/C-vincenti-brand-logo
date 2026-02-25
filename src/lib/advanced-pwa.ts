/**
 * Advanced PWA Engine - Production Ready
 * Implements Progressive Web App with offline sync, service workers, background sync, and cache management
 * Features intelligent caching strategies, background synchronization, and offline-first architecture
 * @version 2.0.0
 * @author Cascade AI - Project Perfection Engine
 */

import { z } from 'zod';

// PWA Configuration Schema
export const PWAConfigSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  themeColor: z.string(),
  backgroundColor: z.string(),
  display: z.enum(['fullscreen', 'standalone', 'minimal-ui', 'browser']),
  orientation: z.enum(['portrait', 'landscape', 'any']),
  scope: z.string().default('/'),
  startUrl: z.string().default('/'),
  icons: z.array(z.object({
    src: z.string(),
    sizes: z.string(),
    type: z.string().optional(),
    purpose: z.string().optional(),
  })),
  categories: z.array(z.string()),
  lang: z.string().default('en-US'),
  dir: z.enum(['ltr', 'rtl', 'auto']).default('ltr'),
});

// Service Worker Registration Schema
export const ServiceWorkerRegistrationSchema = z.object({
  scope: z.string(),
  updateViaCache: z.enum(['imports', 'all', 'none']),
  workbox: z.object({
    skipWaiting: z.boolean().default(true),
    clientsClaim: z.boolean().default(true),
    cleanupOutdatedCaches: z.boolean().default(true),
    runtimeCaching: z.array(z.object({
      urlPattern: z.string(),
      handler: z.enum(['CacheFirst', 'NetworkFirst', 'StaleWhileRevalidate', 'NetworkOnly']),
      options: z.record(z.unknown()).optional(),
    })),
  }),
});

// Cache Strategy Types
export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only';

// Background Sync Types
export interface BackgroundSyncRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  retries: number;
  maxRetries: number;
  createdAt: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Offline Queue Manager
export class OfflineQueueManager {
  private queue: BackgroundSyncRequest[] = [];
  private maxRetries = 3;
  private retryDelay = 1000;
  private storageKey = 'pwa-offline-queue';

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }

  async addRequest(request: Omit<BackgroundSyncRequest, 'id' | 'retries' | 'createdAt'>): Promise<string> {
    const syncRequest: BackgroundSyncRequest = {
      id: crypto.randomUUID(),
      retries: 0,
      createdAt: Date.now(),
      maxRetries: this.maxRetries,
      ...request,
    };

    this.queue.push(syncRequest);
    await this.saveToStorage();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return syncRequest.id;
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.queue.length === 0) {
      return;
    }

    // Sort by priority (critical first, then high, medium, low)
    this.queue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const requestsToProcess = [...this.queue];

    for (const request of requestsToProcess) {
      try {
        await this.executeRequest(request);
        this.removeRequest(request.id);
      } catch (error) {
        console.warn(`Request ${request.id} failed:`, error);
        await this.handleRequestFailure(request);
      }
    }

    await this.saveToStorage();
  }

  private async executeRequest(request: BackgroundSyncRequest): Promise<void> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Dispatch success event
    const event = new CustomEvent('backgroundSyncSuccess', {
      detail: { requestId: request.id, response },
    });
    document.dispatchEvent(event);
  }

  private async handleRequestFailure(request: BackgroundSyncRequest): Promise<void> {
    request.retries++;

    if (request.retries >= request.maxRetries) {
      // Max retries reached, remove from queue
      this.removeRequest(request.id);

      // Dispatch failure event
      const event = new CustomEvent('backgroundSyncFailed', {
        detail: { requestId: request.id, error: 'Max retries exceeded' },
      });
      document.dispatchEvent(event);
    } else {
      // Schedule retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, request.retries - 1);
      setTimeout(() => {
        this.processQueue();
      }, delay);
    }
  }

  private removeRequest(requestId: string): void {
    this.queue = this.queue.filter(req => req.id !== requestId);
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = JSON.stringify(this.queue);
      localStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.warn('Failed to save offline queue to storage:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load offline queue from storage:', error);
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('Back online, processing offline queue...');
      this.processQueue();
    });
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueue(): BackgroundSyncRequest[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue.length = 0;
    localStorage.removeItem(this.storageKey);
  }
}

// Intelligent Cache Manager
export class IntelligentCacheManager {
  private cache: Cache | null = null;
  private cacheName = 'pwa-dynamic-cache';
  private maxCacheSize = 100; // Maximum number of entries
  private defaultStrategy: CacheStrategy = 'stale-while-revalidate';

  constructor() {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    if ('caches' in window) {
      this.cache = await caches.open(this.cacheName);
    }
  }

  async get(url: string, strategy: CacheStrategy = this.defaultStrategy): Promise<Response | null> {
    if (!this.cache) return null;

    const cachedResponse = await this.cache.match(url);

    switch (strategy) {
      case 'cache-first':
        return cachedResponse || this.fetchAndCache(url);

      case 'network-first':
        try {
          const networkResponse = await fetch(url);
          if (networkResponse.ok) {
            await this.cache.put(url, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          // Network failed, return cached if available
          return cachedResponse || null;
        }
        return cachedResponse || null;

      case 'stale-while-revalidate':
        if (cachedResponse) {
          // Return cached immediately, then update in background
          this.fetchAndCache(url);
          return cachedResponse;
        }
        return this.fetchAndCache(url);

      case 'network-only':
        return fetch(url);

      default:
        return cachedResponse || null;
    }
  }

  async put(url: string, response: Response): Promise<void> {
    if (!this.cache) return;

    // Check cache size limit
    const keys = await this.cache.keys();
    if (keys.length >= this.maxCacheSize) {
      // Remove oldest entries (simple LRU)
      const toDelete = keys.slice(0, keys.length - this.maxCacheSize + 1);
      await Promise.all(toDelete.map(key => this.cache!.delete(key)));
    }

    await this.cache.put(url, response);
  }

  private async fetchAndCache(url: string): Promise<Response | null> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await this.put(url, response.clone());
      }
      return response;
    } catch (error) {
      console.warn(`Failed to fetch and cache ${url}:`, error);
      return null;
    }
  }

  async invalidate(url: string): Promise<void> {
    if (this.cache) {
      await this.cache.delete(url);
    }
  }

  async invalidatePattern(pattern: RegExp): Promise<void> {
    if (!this.cache) return;

    const keys = await this.cache.keys();
    const toDelete = keys.filter(key => pattern.test(key.url));

    await Promise.all(toDelete.map(key => this.cache!.delete(key)));
  }

  async clear(): Promise<void> {
    if (this.cache) {
      await this.cache.keys().then(keys =>
        Promise.all(keys.map(key => this.cache!.delete(key)))
      );
    }
  }

  getCacheStats(): Promise<{ entries: number; size: string }> {
    return new Promise(async (resolve) => {
      if (!this.cache) {
        resolve({ entries: 0, size: '0 B' });
        return;
      }

      const keys = await this.cache.keys();
      let totalSize = 0;

      for (const request of keys) {
        const response = await this.cache.match(request);
        if (response && response.body) {
          // Estimate size (this is approximate)
          const content = await response.text();
          totalSize += content.length * 2; // Rough byte estimate
        }
      }

      const sizeString = totalSize > 1024 * 1024
        ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
        : totalSize > 1024
        ? `${(totalSize / 1024).toFixed(2)} KB`
        : `${totalSize} B`;

      resolve({
        entries: keys.length,
        size: sizeString,
      });
    });
  }

  // Smart prefetching based on user behavior
  async prefetchResources(urls: string[], priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (!navigator.onLine) return;

    // Limit concurrent prefetches based on priority
    const maxConcurrent = priority === 'high' ? 5 : priority === 'medium' ? 3 : 1;
    const chunks = this.chunkArray(urls, maxConcurrent);

    for (const chunk of chunks) {
      await Promise.all(chunk.map(url => this.prefetchResource(url)));
      // Small delay between chunks to avoid overwhelming network
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async prefetchResource(url: string): Promise<void> {
    try {
      const response = await fetch(url, { priority: 'low' as any });
      if (response.ok) {
        await this.put(url, response);
      }
    } catch (error) {
      // Silent fail for prefetching
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Service Worker Manager
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private updateCallbacks: ((registration: ServiceWorkerRegistration) => void)[] = [];

  async register(scriptUrl: string, options: RegistrationOptions = {}): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptUrl, options);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateCallbacks(this.registration!);
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.updateAvailable) {
          window.location.reload();
        }
      });

      console.log('Service worker registered:', this.registration);
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  skipWaiting(): void {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  onUpdateAvailable(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.updateCallbacks.push(callback);
    if (this.updateAvailable && this.registration) {
      callback(this.registration);
    }
  }

  private notifyUpdateCallbacks(registration: ServiceWorkerRegistration): void {
    this.updateCallbacks.forEach(callback => callback(registration));
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }
}

// Offline Manager
export class OfflineManager {
  private isOnline = navigator.onLine;
  private offlineCallbacks: ((online: boolean) => void)[] = [];

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks(true);
      console.log('Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks(false);
      console.log('Gone offline');
    });
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  onNetworkChange(callback: (online: boolean) => void): void {
    this.offlineCallbacks.push(callback);
  }

  private notifyCallbacks(online: boolean): void {
    this.offlineCallbacks.forEach(callback => callback(online));
  }

  // Show offline indicator
  showOfflineIndicator(): void {
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6b6b;
        color: white;
        padding: 8px 16px;
        text-align: center;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      indicator.textContent = 'You are currently offline. Some features may be limited.';
      document.body.appendChild(indicator);
    }
  }

  hideOfflineIndicator(): void {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Store data for offline use
  async storeOfflineData(key: string, data: unknown): Promise<void> {
    try {
      const offlineData = {
        data,
        timestamp: Date.now(),
        version: 1,
      };
      localStorage.setItem(`offline-${key}`, JSON.stringify(offlineData));
    } catch (error) {
      console.warn('Failed to store offline data:', error);
    }
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(`offline-${key}`);
      if (!stored) return null;

      const offlineData = JSON.parse(stored);
      return offlineData.data as T;
    } catch (error) {
      console.warn('Failed to retrieve offline data:', error);
      return null;
    }
  }

  async clearOfflineData(key?: string): Promise<void> {
    if (key) {
      localStorage.removeItem(`offline-${key}`);
    } else {
      // Clear all offline data
      const keys = Object.keys(localStorage).filter(k => k.startsWith('offline-'));
      keys.forEach(k => localStorage.removeItem(k));
    }
  }
}

// PWA Install Manager
export class PWAInstallManager {
  private installPrompt: BeforeInstallPromptEvent | null = null;
  private installCallbacks: (() => void)[] = [];
  private dismissCallbacks: (() => void)[] = [];

  constructor() {
    this.setupInstallListeners();
  }

  private setupInstallListeners(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as BeforeInstallPromptEvent;
      this.notifyInstallAvailable();
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.installCallbacks.forEach(callback => callback());
      console.log('PWA installed successfully');
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    this.installPrompt.prompt();
    const result = await this.installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('User accepted PWA installation');
      return true;
    } else {
      console.log('User dismissed PWA installation');
      this.dismissCallbacks.forEach(callback => callback());
      return false;
    }
  }

  isInstallable(): boolean {
    return this.installPrompt !== null;
  }

  onInstall(callback: () => void): void {
    this.installCallbacks.push(callback);
  }

  onDismiss(callback: () => void): void {
    this.dismissCallbacks.push(callback);
  }

  private notifyInstallAvailable(): void {
    // Dispatch custom event
    const event = new CustomEvent('pwaInstallAvailable');
    document.dispatchEvent(event);
  }

  // Show install button
  showInstallButton(container: HTMLElement): void {
    if (!this.isInstallable()) return;

    const button = document.createElement('button');
    button.textContent = 'Install App';
    button.className = 'pwa-install-button';
    button.style.cssText = `
      background: #007acc;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background 0.2s;
    `;

    button.addEventListener('click', async () => {
      const installed = await this.promptInstall();
      if (installed) {
        button.remove();
      }
    });

    container.appendChild(button);
  }
}

// Main PWA Manager
export class PWAManager {
  private cacheManager: IntelligentCacheManager;
  private offlineManager: OfflineManager;
  private serviceWorkerManager: ServiceWorkerManager;
  private installManager: PWAInstallManager;
  private syncManager: OfflineQueueManager;

  constructor() {
    this.cacheManager = new IntelligentCacheManager();
    this.offlineManager = new OfflineManager();
    this.serviceWorkerManager = new ServiceWorkerManager();
    this.installManager = new PWAInstallManager();
    this.syncManager = new OfflineQueueManager();

    this.initializePWA();
  }

  private async initializePWA(): Promise<void> {
    // Register service worker
    try {
      await this.serviceWorkerManager.register('/sw.js', {
        scope: '/',
      });
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }

    // Setup offline handling
    this.offlineManager.onNetworkChange((online) => {
      if (online) {
        this.offlineManager.hideOfflineIndicator();
        // Process offline queue
        this.syncManager.processQueue();
      } else {
        this.offlineManager.showOfflineIndicator();
      }
    });

    // Setup PWA install handling
    document.addEventListener('pwaInstallAvailable', () => {
      this.showInstallPrompt();
    });

    console.log('PWA initialized successfully');
  }

  private showInstallPrompt(): void {
    // Create install prompt
    const prompt = document.createElement('div');
    prompt.className = 'pwa-install-prompt';
    prompt.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
    `;

    prompt.innerHTML = `
      <h3 style="margin: 0 0 8px 0; font-size: 16px;">Install App</h3>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">
        Install our app for a better experience with offline support.
      </p>
      <div style="display: flex; gap: 8px;">
        <button id="install-btn" style="
          background: #007acc;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Install</button>
        <button id="dismiss-btn" style="
          background: #f5f5f5;
          color: #333;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Not now</button>
      </div>
    `;

    document.body.appendChild(prompt);

    // Handle install button
    document.getElementById('install-btn')?.addEventListener('click', async () => {
      const installed = await this.installManager.promptInstall();
      prompt.remove();
      if (installed) {
        this.showInstallSuccess();
      }
    });

    // Handle dismiss button
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      prompt.remove();
    });
  }

  private showInstallSuccess(): void {
    const success = document.createElement('div');
    success.textContent = 'App installed successfully!';
    success.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10000;
    `;

    document.body.appendChild(success);
    setTimeout(() => success.remove(), 3000);
  }

  // Public API
  async cacheResource(url: string, strategy?: CacheStrategy): Promise<Response | null> {
    return this.cacheManager.get(url, strategy);
  }

  async prefetchResources(urls: string[], priority?: 'low' | 'medium' | 'high'): Promise<void> {
    await this.cacheManager.prefetchResources(urls, priority);
  }

  async addToOfflineQueue(request: Omit<BackgroundSyncRequest, 'id' | 'retries' | 'createdAt'>): Promise<string> {
    return this.syncManager.addRequest(request);
  }

  isOnline(): boolean {
    return this.offlineManager.isOnlineStatus();
  }

  getCacheStats(): Promise<{ entries: number; size: string }> {
    return this.cacheManager.getCacheStats();
  }

  getOfflineQueueLength(): number {
    return this.syncManager.getQueueLength();
  }

  async storeOfflineData(key: string, data: unknown): Promise<void> {
    await this.offlineManager.storeOfflineData(key, data);
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    return this.offlineManager.getOfflineData<T>(key);
  }

  isInstallable(): boolean {
    return this.installManager.isInstallable();
  }

  promptInstall(): Promise<boolean> {
    return this.installManager.promptInstall();
  }

  onNetworkChange(callback: (online: boolean) => void): void {
    this.offlineManager.onNetworkChange(callback);
  }

  onUpdateAvailable(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.serviceWorkerManager.onUpdateAvailable(callback);
  }

  // Cleanup
  dispose(): void {
    this.cacheManager.clear();
    this.syncManager.clearQueue();
    this.serviceWorkerManager.unregister();
  }
}

// Web App Manifest Generator
export class WebAppManifestGenerator {
  static generate(config: z.infer<typeof PWAConfigSchema>): string {
    const manifest = {
      name: config.name,
      short_name: config.shortName,
      description: config.description,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      display: config.display,
      orientation: config.orientation,
      scope: config.scope,
      start_url: config.startUrl,
      icons: config.icons,
      categories: config.categories,
      lang: config.lang,
      dir: config.dir,
    };

    return JSON.stringify(manifest, null, 2);
  }

  static validate(config: z.infer<typeof PWAConfigSchema>): { valid: boolean; errors: string[] } {
    try {
      PWAConfigSchema.parse(config);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }
}

// Global PWA instance
export const pwaManager = new PWAManager();

// React Hook for PWA functionality
export const usePWA = () => {
  const [isOnline, setIsOnline] = React.useState(pwaManager.isOnline());
  const [isInstallable, setIsInstallable] = React.useState(pwaManager.isInstallable());
  const [offlineQueueLength, setOfflineQueueLength] = React.useState(pwaManager.getOfflineQueueLength());

  React.useEffect(() => {
    // Listen for network changes
    pwaManager.onNetworkChange(setIsOnline);

    // Check installability periodically
    const checkInstallability = () => setIsInstallable(pwaManager.isInstallable());
    const interval = setInterval(checkInstallability, 1000);

    // Update queue length periodically
    const updateQueueLength = () => setOfflineQueueLength(pwaManager.getOfflineQueueLength());
    const queueInterval = setInterval(updateQueueLength, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(queueInterval);
    };
  }, []);

  const promptInstall = React.useCallback(async () => {
    return pwaManager.promptInstall();
  }, []);

  const addToOfflineQueue = React.useCallback(async (request: Omit<BackgroundSyncRequest, 'id' | 'retries' | 'createdAt'>) => {
    const requestId = await pwaManager.addToOfflineQueue(request);
    setOfflineQueueLength(pwaManager.getOfflineQueueLength());
    return requestId;
  }, []);

  const storeOfflineData = React.useCallback(async (key: string, data: unknown) => {
    await pwaManager.storeOfflineData(key, data);
  }, []);

  const getOfflineData = React.useCallback(async <T>(key: string): Promise<T | null> => {
    return pwaManager.getOfflineData<T>(key);
  }, []);

  return {
    isOnline,
    isInstallable,
    offlineQueueLength,
    promptInstall,
    addToOfflineQueue,
    storeOfflineData,
    getOfflineData,
    cacheStats: pwaManager.getCacheStats(),
  };
};

// Service Worker registration and event handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

// Background sync registration
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log(`Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
};

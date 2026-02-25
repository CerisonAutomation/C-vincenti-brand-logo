/**
 * Progressive Web App (PWA) with Offline Sync, Real-time Collaboration, Voice/Spatial UX, and 3D/Visual Integration
 * Implements modern web app capabilities with enterprise-grade features
 * @version 2.0.0
 * @author Cascade AI
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// PWA Configuration
export const PWAConfig = {
  CACHE_NAMES: {
    STATIC: 'guesty-static-v1',
    DYNAMIC: 'guesty-dynamic-v1',
    IMAGES: 'guesty-images-v1',
    API: 'guesty-api-v1',
  },

  OFFLINE_FALLBACKS: {
    PAGE: '/offline.html',
    IMAGE: '/offline-image.png',
  },

  SYNC_INTERVALS: {
    BACKGROUND_SYNC: 30000, // 30 seconds
    REAL_TIME_UPDATES: 5000, // 5 seconds
    OFFLINE_QUEUE_PROCESSING: 10000, // 10 seconds
  },

  VOICE_COMMANDS: {
    BOOK_PROPERTY: ['book', 'reserve', 'rent'],
    SEARCH_LOCATION: ['find', 'search', 'look for'],
    CHECK_AVAILABILITY: ['available', 'check dates', 'when is it free'],
    GET_DIRECTIONS: ['directions', 'how to get there', 'navigate'],
  },

  SPATIAL_ZONES: {
    IMMERSIVE_RADIUS: 50, // meters
    NOTIFICATION_RADIUS: 100, // meters
    BOOKING_RADIUS: 10, // meters
  },
} as const;

// Service Worker Registration and Management
export class PWAServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'SYNC_COMPLETED':
        this.handleSyncCompleted(data);
        break;
      case 'SYNC_FAILED':
        this.handleSyncFailed(data);
        break;
      case 'CACHE_UPDATED':
        this.handleCacheUpdated(data);
        break;
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private handleSyncCompleted(data: any): void {
    console.log('Background sync completed:', data);
    window.dispatchEvent(new CustomEvent('pwa-sync-completed', { detail: data }));
  }

  private handleSyncFailed(data: any): void {
    console.error('Background sync failed:', data);
    window.dispatchEvent(new CustomEvent('pwa-sync-failed', { detail: data }));
  }

  private handleCacheUpdated(data: any): void {
    console.log('Cache updated:', data);
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

// Offline Sync Manager
export class OfflineSyncManager {
  private queue: SyncItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.loadQueueFromStorage();
    this.setupOnlineOfflineListeners();
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async addToQueue(item: SyncItem): Promise<void> {
    this.queue.push({
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      retries: 0,
    });

    await this.saveQueueToStorage();

    if (this.isOnline && !this.syncInProgress) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const item = this.queue[0];

      await this.syncItem(item);

      // Remove successful item from queue
      this.queue.shift();
      await this.saveQueueToStorage();

      // Process next item
      setTimeout(() => this.processQueue(), 1000);

    } catch (error) {
      const item = this.queue[0];
      item.retries++;

      if (item.retries >= 3) {
        // Remove failed item after max retries
        this.queue.shift();
        await this.saveQueueToStorage();
        console.error('Sync item failed permanently:', item);
      } else {
        // Retry with exponential backoff
        setTimeout(() => this.processQueue(), Math.pow(2, item.retries) * 1000);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    switch (item.type) {
      case 'CREATE_BOOKING':
        await this.syncCreateBooking(item);
        break;
      case 'UPDATE_PROFILE':
        await this.syncUpdateProfile(item);
        break;
      case 'ADD_TO_FAVORITES':
        await this.syncAddToFavorites(item);
        break;
    }
  }

  private async syncCreateBooking(item: SyncItem): Promise<void> {
    // Implementation would sync booking creation
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error('Failed to sync booking');
    }
  }

  private async syncUpdateProfile(item: SyncItem): Promise<void> {
    // Implementation would sync profile updates
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error('Failed to sync profile');
    }
  }

  private async syncAddToFavorites(item: SyncItem): Promise<void> {
    // Implementation would sync favorites
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error('Failed to sync favorites');
    }
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline-sync-queue');
      if (stored) {
        this.queue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load sync queue from storage:', error);
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    try {
      localStorage.setItem('offline-sync-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save sync queue to storage:', error);
    }
  }

  getQueueStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      syncInProgress: this.syncInProgress,
    };
  }
}

// Real-time Collaboration Manager
export class RealTimeCollaborationManager {
  private supabase;
  private channel: any = null;
  private collaborators = new Map<string, Collaborator>();

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );
  }

  async joinSession(sessionId: string, userId: string, userName: string): Promise<void> {
    this.channel = this.supabase.channel(`session-${sessionId}`);

    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState();
        this.updateCollaborators(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handleCollaboratorJoined(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handleCollaboratorLeft(key, leftPresences);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        this.handleCursorUpdate(payload);
      })
      .on('broadcast', { event: 'selection' }, ({ payload }) => {
        this.handleSelectionUpdate(payload);
      })
      .subscribe();

    // Join presence
    await this.channel.track({
      user_id: userId,
      name: userName,
      cursor: null,
      selection: null,
      last_active: new Date().toISOString(),
    });
  }

  async leaveSession(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.collaborators.clear();
    }
  }

  async updateCursor(position: { x: number; y: number }): Promise<void> {
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { position, timestamp: Date.now() },
      });
    }
  }

  async updateSelection(range: any): Promise<void> {
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'selection',
        payload: { range, timestamp: Date.now() },
      });
    }
  }

  private updateCollaborators(state: any): void {
    this.collaborators.clear();

    Object.entries(state).forEach(([key, presences]: [string, any]) => {
      presences.forEach((presence: any) => {
        this.collaborators.set(key, {
          id: presence.user_id,
          name: presence.name,
          cursor: presence.cursor,
          selection: presence.selection,
          lastActive: new Date(presence.last_active),
        });
      });
    });

    // Notify UI of collaborator updates
    window.dispatchEvent(new CustomEvent('collaborators-updated', {
      detail: Array.from(this.collaborators.values())
    }));
  }

  private handleCollaboratorJoined(key: string, newPresences: any[]): void {
    newPresences.forEach((presence) => {
      console.log('Collaborator joined:', presence.name);
      window.dispatchEvent(new CustomEvent('collaborator-joined', {
        detail: {
          id: presence.user_id,
          name: presence.name,
        }
      }));
    });
  }

  private handleCollaboratorLeft(key: string, leftPresences: any[]): void {
    leftPresences.forEach((presence) => {
      console.log('Collaborator left:', presence.name);
      window.dispatchEvent(new CustomEvent('collaborator-left', {
        detail: {
          id: presence.user_id,
          name: presence.name,
        }
      }));
    });
  }

  private handleCursorUpdate(payload: any): void {
    window.dispatchEvent(new CustomEvent('collaborator-cursor-update', {
      detail: payload
    }));
  }

  private handleSelectionUpdate(payload: any): void {
    window.dispatchEvent(new CustomEvent('collaborator-selection-update', {
      detail: payload
    }));
  }

  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }
}

// Voice and Spatial UX Manager
export class VoiceSpatialUXManager {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private spatialAudioContext: AudioContext | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.initializeSpatialAudio();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private initializeSpatialAudio(): void {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.spatialAudioContext = new AudioContext();
    }
  }

  async startListening(): Promise<void> {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();

      // Provide audio feedback
      await this.playAudioCue('listening');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async speak(text: string): Promise<void> {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      return new Promise((resolve) => {
        utterance.onend = () => resolve();
        this.synthesis!.speak(utterance);
      });
    }
  }

  private async processVoiceCommand(transcript: string): Promise<void> {
    console.log('Voice command received:', transcript);

    // Process booking commands
    if (PWAConfig.VOICE_COMMANDS.BOOK_PROPERTY.some(cmd => transcript.includes(cmd))) {
      await this.handleBookPropertyCommand(transcript);
    }
    // Process search commands
    else if (PWAConfig.VOICE_COMMANDS.SEARCH_LOCATION.some(cmd => transcript.includes(cmd))) {
      await this.handleSearchCommand(transcript);
    }
    // Process availability commands
    else if (PWAConfig.VOICE_COMMANDS.CHECK_AVAILABILITY.some(cmd => transcript.includes(cmd))) {
      await this.handleAvailabilityCommand(transcript);
    }
    // Process navigation commands
    else if (PWAConfig.VOICE_COMMANDS.GET_DIRECTIONS.some(cmd => transcript.includes(cmd))) {
      await this.handleDirectionsCommand(transcript);
    }
    else {
      await this.speak("I'm sorry, I didn't understand that command. You can say things like 'book a property', 'search for locations', 'check availability', or 'get directions'.");
    }
  }

  private async handleBookPropertyCommand(transcript: string): Promise<void> {
    await this.speak("I'll help you book a property. What type of property are you looking for?");
    // Implementation would navigate to booking flow
  }

  private async handleSearchCommand(transcript: string): Promise<void> {
    await this.speak("Let me help you find the perfect location. What city or area are you interested in?");
    // Implementation would open search interface
  }

  private async handleAvailabilityCommand(transcript: string): Promise<void> {
    await this.speak("I'll check availability for you. Which dates are you interested in?");
    // Implementation would open calendar
  }

  private async handleDirectionsCommand(transcript: string): Promise<void> {
    await this.speak("I'll show you how to get there. Please select a property first.");
    // Implementation would open maps/navigation
  }

  async playSpatialAudio(audioUrl: string, position: { x: number; y: number; z: number }): Promise<void> {
    if (!this.spatialAudioContext) return;

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.spatialAudioContext.decodeAudioData(arrayBuffer);

      const source = this.spatialAudioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create spatial audio panner
      const panner = this.spatialAudioContext.createPanner();
      panner.positionX.setValueAtTime(position.x, this.spatialAudioContext.currentTime);
      panner.positionY.setValueAtTime(position.y, this.spatialAudioContext.currentTime);
      panner.positionZ.setValueAtTime(position.z, this.spatialAudioContext.currentTime);

      source.connect(panner);
      panner.connect(this.spatialAudioContext.destination);

      source.start();
    } catch (error) {
      console.error('Spatial audio playback failed:', error);
    }
  }

  private async playAudioCue(type: string): Promise<void> {
    // Implementation would play subtle audio cues
    console.log('Playing audio cue:', type);
  }

  getCapabilities() {
    return {
      speechRecognition: !!this.recognition,
      speechSynthesis: !!this.synthesis,
      spatialAudio: !!this.spatialAudioContext,
      isListening: this.isListening,
    };
  }
}

// 3D/Visual Integration Manager
export class VisualIntegrationManager {
  private scene: any = null;
  private renderer: any = null;
  private camera: any = null;
  private models: Map<string, any> = new Map();

  async initialize3DScene(container: HTMLElement): Promise<void> {
    if (!this.checkWebGLSupport()) {
      console.warn('WebGL not supported, falling back to 2D experience');
      return;
    }

    try {
      // Dynamic import for Three.js to avoid bundle bloat
      const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight } = await import('three');

      this.scene = new Scene();
      this.camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.renderer = new WebGLRenderer({ antialias: true, alpha: true });

      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);

      // Add basic lighting
      const ambientLight = new AmbientLight(0x404040, 0.6);
      this.scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      this.scene.add(directionalLight);

      this.camera.position.z = 5;
      this.animate();

    } catch (error) {
      console.error('3D scene initialization failed:', error);
    }
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;

    requestAnimationFrame(this.animate);

    // Rotate models for visual interest
    this.models.forEach((model) => {
      if (model.rotation) {
        model.rotation.y += 0.01;
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  async loadPropertyModel(propertyId: string, modelUrl: string): Promise<void> {
    if (!this.scene) return;

    try {
      // Dynamic import for GLTF loader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          modelUrl,
          resolve,
          undefined,
          reject
        );
      });

      this.models.set(propertyId, gltf.scene);
      this.scene.add(gltf.scene);

      // Position the model
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.scale.set(1, 1, 1);

    } catch (error) {
      console.error('Failed to load 3D model:', error);
    }
  }

  removePropertyModel(propertyId: string): void {
    const model = this.models.get(propertyId);
    if (model && this.scene) {
      this.scene.remove(model);
      this.models.delete(propertyId);
    }
  }

  updateCameraPosition(position: { x: number; y: number; z: number }): void {
    if (this.camera) {
      this.camera.position.set(position.x, position.y, position.z);
      this.camera.lookAt(0, 0, 0);
    }
  }

  takeScreenshot(): string | null {
    if (!this.renderer) return null;

    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }

  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }

    this.models.forEach((model) => {
      // Dispose of model resources
      if (model.geometry) model.geometry.dispose();
      if (model.material) model.material.dispose();
    });

    this.models.clear();
  }
}

// React Hooks for PWA Features
export const usePWAServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const swManager = new PWAServiceWorkerManager();

    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleSyncCompleted = (event: CustomEvent) => {
      console.log('Sync completed:', event.detail);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('pwa-sync-completed', handleSyncCompleted);

    swManager.register().then(setRegistration);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('pwa-sync-completed', handleSyncCompleted);
    };
  }, []);

  const updateApp = useCallback(async () => {
    if (registration?.waiting) {
      await registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { updateAvailable, updateApp, registration };
};

export const useOfflineSync = () => {
  const [syncManager] = useState(() => new OfflineSyncManager());
  const [status, setStatus] = useState(syncManager.getQueueStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(syncManager.getQueueStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [syncManager]);

  const addToQueue = useCallback(async (item: SyncItem) => {
    await syncManager.addToQueue(item);
  }, [syncManager]);

  return { status, addToQueue };
};

export const useRealTimeCollaboration = (sessionId: string, userId: string, userName: string) => {
  const [collaborationManager] = useState(() => new RealTimeCollaborationManager());
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    collaborationManager.joinSession(sessionId, userId, userName);

    const handleCollaboratorsUpdate = (event: CustomEvent) => {
      setCollaborators(event.detail);
    };

    window.addEventListener('collaborators-updated', handleCollaboratorsUpdate);

    return () => {
      collaborationManager.leaveSession();
      window.removeEventListener('collaborators-updated', handleCollaboratorsUpdate);
    };
  }, [collaborationManager, sessionId, userId, userName]);

  const updateCursor = useCallback((position: { x: number; y: number }) => {
    collaborationManager.updateCursor(position);
  }, [collaborationManager]);

  const updateSelection = useCallback((range: any) => {
    collaborationManager.updateSelection(range);
  }, [collaborationManager]);

  return { collaborators, updateCursor, updateSelection };
};

export const useVoiceSpatialUX = () => {
  const [voiceManager] = useState(() => new VoiceSpatialUXManager());
  const [capabilities, setCapabilities] = useState(voiceManager.getCapabilities());

  const startListening = useCallback(() => {
    voiceManager.startListening();
  }, [voiceManager]);

  const stopListening = useCallback(() => {
    voiceManager.stopListening();
  }, [voiceManager]);

  const speak = useCallback((text: string) => {
    return voiceManager.speak(text);
  }, [voiceManager]);

  const playSpatialAudio = useCallback((audioUrl: string, position: { x: number; y: number; z: number }) => {
    return voiceManager.playSpatialAudio(audioUrl, position);
  }, [voiceManager]);

  return {
    capabilities,
    startListening,
    stopListening,
    speak,
    playSpatialAudio,
  };
};

export const use3DVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visualManager] = useState(() => new VisualIntegrationManager());

  useEffect(() => {
    if (containerRef.current) {
      visualManager.initialize3DScene(containerRef.current);
    }

    return () => {
      visualManager.dispose();
    };
  }, [visualManager]);

  const loadModel = useCallback((propertyId: string, modelUrl: string) => {
    return visualManager.loadPropertyModel(propertyId, modelUrl);
  }, [visualManager]);

  const removeModel = useCallback((propertyId: string) => {
    visualManager.removePropertyModel(propertyId);
  }, [visualManager]);

  const updateCamera = useCallback((position: { x: number; y: number; z: number }) => {
    visualManager.updateCameraPosition(position);
  }, [visualManager]);

  const takeScreenshot = useCallback(() => {
    return visualManager.takeScreenshot();
  }, [visualManager]);

  return {
    containerRef,
    loadModel,
    removeModel,
    updateCamera,
    takeScreenshot,
  };
};

// Type definitions
export interface SyncItem {
  id: string;
  type: 'CREATE_BOOKING' | 'UPDATE_PROFILE' | 'ADD_TO_FAVORITES';
  data: Record<string, any>;
  timestamp: Date;
  retries: number;
}

export interface Collaborator {
  id: string;
  name: string;
  cursor: { x: number; y: number } | null;
  selection: any;
  lastActive: Date;
}

/**
 * Real-Time Collaboration & Communication System
 * WebSocket-based real-time features and collaborative editing
 */

// WebSocket Manager
import { log } from '@/lib/logger';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          this.stopHeartbeat();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  send(event: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
    }
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      const listeners = this.listeners.get(message.event);

      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(message.data);
          } catch (error) {
            console.error('Error in event listener:', error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

setTimeout(() => {
      log.info('Attempting reconnection', { attempt: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts });
      // Reconnection logic would go here
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Real-Time Collaboration
export class RealTimeCollaboration {
  private wsManager = WebSocketManager.getInstance();
  private collaborators = new Map<string, Collaborator>();
  private documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
    this.setupCollaboration();
  }

  private setupCollaboration(): void {
    this.wsManager.subscribe('collaborator-joined', (data) => {
      this.collaborators.set(data.userId, data);
      this.onCollaboratorJoined(data);
    });

    this.wsManager.subscribe('collaborator-left', (data) => {
      this.collaborators.delete(data.userId);
      this.onCollaboratorLeft(data);
    });

    this.wsManager.subscribe('cursor-update', (data) => {
      this.onCursorUpdate(data);
    });

    this.wsManager.subscribe('selection-update', (data) => {
      this.onSelectionUpdate(data);
    });

    this.wsManager.subscribe('content-update', (data) => {
      this.onContentUpdate(data);
    });
  }

  joinSession(userId: string, userName: string): void {
    this.wsManager.send('join-collaboration', {
      documentId: this.documentId,
      userId,
      userName,
      timestamp: Date.now()
    });
  }

  updateCursor(position: { x: number; y: number }): void {
    this.wsManager.send('cursor-update', {
      documentId: this.documentId,
      position,
      timestamp: Date.now()
    });
  }

  updateSelection(range: { start: number; end: number }): void {
    this.wsManager.send('selection-update', {
      documentId: this.documentId,
      range,
      timestamp: Date.now()
    });
  }

  updateContent(content: string, operation: 'insert' | 'delete' | 'replace'): void {
    this.wsManager.send('content-update', {
      documentId: this.documentId,
      content,
      operation,
      timestamp: Date.now()
    });
  }

  private onCollaboratorJoined(data: { userName: string }): void {
    log.info('Collaborator joined', { userName: data.userName });
    // Update UI to show collaborator presence
  }

  private onCollaboratorLeft(data: { userName: string }): void {
    log.info('Collaborator left', { userName: data.userName });
    // Update UI to remove collaborator presence
  }

  private onCursorUpdate(data: any): void {
    // Update cursor position in UI
  }

  private onSelectionUpdate(data: any): void {
    // Update selection highlighting in UI
  }

  private onContentUpdate(data: any): void {
    // Apply content changes with conflict resolution
  }
}

// Live Notifications
export class LiveNotifications {
  private wsManager = WebSocketManager.getInstance();
  private notifications: Notification[] = [];
  private maxNotifications = 100;

  constructor() {
    this.setupNotifications();
  }

  private setupNotifications(): void {
    this.wsManager.subscribe('notification', (data) => {
      this.addNotification(data);
    });

    this.wsManager.subscribe('notification-read', (data) => {
      this.markAsRead(data.notificationId);
    });

    this.wsManager.subscribe('notification-cleared', (data) => {
      this.clearNotification(data.notificationId);
    });
  }

  sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    this.wsManager.send('send-notification', {
      ...notification,
      timestamp: Date.now()
    });
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.wsManager.send('notification-read', { notificationId });
    }
  }

  clearNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.wsManager.send('notification-cleared', { notificationId });
  }

  clearAll(): void {
    this.notifications = [];
    this.wsManager.send('clear-all-notifications', {});
  }

  private addNotification(notification: any): void {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(newNotification);

    // Keep only last 100 notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.body,
        icon: newNotification.icon
      });
    }
  }
}

// Real-Time Analytics
export class RealTimeAnalytics {
  private wsManager = WebSocketManager.getInstance();
  private metrics = new Map<string, number>();
  private startTime = Date.now();

  constructor() {
    this.setupAnalytics();
  }

  private setupAnalytics(): void {
    // Track page views
    this.trackPageView();

    // Track user interactions
    document.addEventListener('click', (event) => {
      this.trackEvent('click', {
        target: (event.target as Element).tagName,
        timestamp: Date.now()
      });
    });

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Send analytics data periodically
    setInterval(() => {
      this.sendAnalyticsData();
    }, 30000); // Every 30 seconds
  }

  trackEvent(eventName: string, data?: any): void {
    const count = this.metrics.get(eventName) || 0;
    this.metrics.set(eventName, count + 1);

    this.wsManager.send('analytics-event', {
      eventName,
      data,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });
  }

  trackPageView(): void {
    this.trackEvent('page_view', {
      url: window.location.href,
      referrer: document.referrer
    });
  }

  trackPerformanceMetrics(): void {
    // Track Web Vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => this.trackEvent('web-vital', { name: 'CLS', value: metric.value }));
      onINP((metric) => this.trackEvent('web-vital', { name: 'INP', value: metric.value }));
      onFCP((metric) => this.trackEvent('web-vital', { name: 'FCP', value: metric.value }));
      onLCP((metric) => this.trackEvent('web-vital', { name: 'LCP', value: metric.value }));
      onTTFB((metric) => this.trackEvent('web-vital', { name: 'TTFB', value: metric.value }));
    });
  }

  private sendAnalyticsData(): void {
    const data = {
      metrics: Object.fromEntries(this.metrics),
      sessionDuration: Date.now() - this.startTime,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.wsManager.send('analytics-data', data);
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

// Collaborative Editing with Operational Transformation
export class CollaborativeEditor {
  private operations: Operation[] = [];
  private document: string = '';
  private wsManager = WebSocketManager.getInstance();

  constructor(documentId: string) {
    this.setupEditor(documentId);
  }

  private setupEditor(documentId: string): void {
    this.wsManager.subscribe('operation', (data) => {
      this.applyOperation(data);
    });
  }

  insert(position: number, text: string): void {
    const operation: Operation = {
      type: 'insert',
      position,
      text,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.applyLocalOperation(operation);
    this.wsManager.send('operation', operation);
  }

  delete(position: number, length: number): void {
    const operation: Operation = {
      type: 'delete',
      position,
      length,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.applyLocalOperation(operation);
    this.wsManager.send('operation', operation);
  }

  private applyLocalOperation(operation: Operation): void {
    switch (operation.type) {
      case 'insert':
        this.document = this.document.slice(0, operation.position) +
                       operation.text +
                       this.document.slice(operation.position);
        break;
      case 'delete':
        this.document = this.document.slice(0, operation.position) +
                       this.document.slice(operation.position + operation.length);
        break;
    }
  }

  private applyOperation(operation: Operation): void {
    // Transform operation against existing operations
    const transformedOperation = this.transformOperation(operation);
    this.applyLocalOperation(transformedOperation);
  }

  private transformOperation(operation: Operation): Operation {
    // Operational transformation logic
    // This would implement the OT algorithm to resolve conflicts
    return operation;
  }

  getDocument(): string {
    return this.document;
  }
}

// Types
interface Collaborator {
  userId: string;
  userName: string;
  lastSeen: number;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
}

interface Operation {
  id: string;
  type: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
  timestamp: number;
}

export default {
  WebSocketManager,
  RealTimeCollaboration,
  LiveNotifications,
  RealTimeAnalytics,
  CollaborativeEditor
};
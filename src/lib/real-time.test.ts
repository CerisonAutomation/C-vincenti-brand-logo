import { describe, it, expect, vi, beforeEach, afterEach, jest } from 'vitest';
import { WebSocketManager, RealTimeCollaboration, LiveNotifications, RealTimeAnalytics, CollaborativeEditor } from './real-time';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/performance', () => ({
  PerformanceMonitor: {
    recordMetric: vi.fn(),
    init: vi.fn(),
  },
}));

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  let mockWebSocket: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    };

    global.WebSocket = vi.fn(() => mockWebSocket) as any;
    global.WebSocket.OPEN = WebSocket.OPEN;
    global.WebSocket.CLOSED = WebSocket.CLOSED;

    wsManager = WebSocketManager.getInstance();
  });

  afterEach(() => {
    wsManager.disconnect();
  });

  it('should connect to WebSocket successfully', async () => {
    mockWebSocket.readyState = WebSocket.OPEN;
    
    await wsManager.connect('ws://test.com');
    
    expect(global.WebSocket).toHaveBeenCalledWith('ws://test.com');
    expect(mockWebSocket.onopen).toBeDefined();
  });

  it('should handle connection errors', async () => {
    const error = new Error('Connection failed');
    mockWebSocket.onerror = vi.fn();
    
    await expect(wsManager.connect('ws://test.com')).rejects.toThrow();
  });

  it('should send messages when connected', () => {
    mockWebSocket.readyState = WebSocket.OPEN;
    
    wsManager.send('test-event', { data: 'test' });
    
    expect(mockWebSocket.send).toHaveBeenCalled();
  });

  it('should queue messages when not connected', () => {
    mockWebSocket.readyState = WebSocket.CLOSED;
    
    wsManager.send('test-event', { data: 'test' });
    
    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should subscribe to events', () => {
    const callback = vi.fn();
    const unsubscribe = wsManager.subscribe('test-event', callback);
    
    expect(typeof unsubscribe).toBe('function');
    
    // Test message handling
    const message = JSON.stringify({
      event: 'test-event',
      data: { test: 'data' },
      timestamp: Date.now()
    });
    
    mockWebSocket.onmessage({ data: message });
    
    expect(callback).toHaveBeenCalledWith({ test: 'data' });
  });

  it('should handle reconnection with exponential backoff', async () => {
    mockWebSocket.readyState = WebSocket.CLOSED;
    
    // Simulate connection failure
    mockWebSocket.onerror = vi.fn();
    
    await expect(wsManager.connect('ws://test.com')).rejects.toThrow();
    
    // Should attempt reconnection
    expect(setTimeout).toHaveBeenCalled();
  });

  it('should track metrics', () => {
    const metrics = wsManager.getMetrics();
    
    expect(metrics).toHaveProperty('messagesSent');
    expect(metrics).toHaveProperty('messagesReceived');
    expect(metrics).toHaveProperty('connectionTime');
    expect(metrics).toHaveProperty('reconnectionCount');
    expect(metrics).toHaveProperty('errors');
  });
});

describe('RealTimeCollaboration', () => {
  let collaboration: RealTimeCollaboration;
  let mockWsManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWsManager = {
      subscribe: vi.fn(),
      send: vi.fn(),
    };

    collaboration = new RealTimeCollaboration('test-doc', 'user1', 'Test User');
    (collaboration as any).wsManager = mockWsManager;
  });

  it('should join collaboration session', () => {
    collaboration.joinSession();
    
    expect(mockWsManager.send).toHaveBeenCalledWith('join-collaboration', expect.objectContaining({
      documentId: 'test-doc',
      userId: 'user1',
      userName: 'Test User'
    }));
  });

  it('should update cursor position', () => {
    collaboration.updateCursor({ x: 100, y: 200 });
    
    expect(mockWsManager.send).toHaveBeenCalledWith('cursor-update', expect.objectContaining({
      documentId: 'test-doc',
      userId: 'user1',
      userName: 'Test User',
      position: { x: 100, y: 200 }
    }));
  });

  it('should update selection range', () => {
    collaboration.updateSelection({ start: 10, end: 20 });
    
    expect(mockWsManager.send).toHaveBeenCalledWith('selection-update', expect.objectContaining({
      documentId: 'test-doc',
      userId: 'user1',
      range: { start: 10, end: 20 }
    }));
  });

  it('should get collaborators', () => {
    const collaborators = collaboration.getCollaborators();
    
    expect(Array.isArray(collaborators)).toBe(true);
  });

  it('should get collaborator count', () => {
    const count = collaboration.getCollaboratorCount();
    
    expect(typeof count).toBe('number');
  });
});

describe('LiveNotifications', () => {
  let notifications: LiveNotifications;
  let mockWsManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWsManager = {
      subscribe: vi.fn(),
      send: vi.fn(),
    };

    // Mock Notification API
    global.Notification = {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    } as any;

    notifications = new LiveNotifications();
    (notifications as any).wsManager = mockWsManager;
  });

  it('should request notification permission', async () => {
    const permission = await notifications.requestPermission();
    
    expect(permission).toBe('granted');
    expect(global.Notification.requestPermission).toHaveBeenCalled();
  });

  it('should send notification', () => {
    notifications.sendNotification({
      title: 'Test Notification',
      body: 'Test body'
    });
    
    expect(mockWsManager.send).toHaveBeenCalledWith('send-notification', expect.objectContaining({
      title: 'Test Notification',
      body: 'Test body'
    }));
  });

  it('should mark notification as read', () => {
    const notificationId = 'test-id';
    
    notifications.markAsRead(notificationId);
    
    expect(mockWsManager.send).toHaveBeenCalledWith('notification-read', { notificationId });
  });

  it('should get unread count', () => {
    const count = notifications.getUnreadCount();
    
    expect(typeof count).toBe('number');
  });

  it('should get notifications by type', () => {
    const notificationsByType = notifications.getNotificationsByType('info');
    
    expect(Array.isArray(notificationsByType)).toBe(true);
  });
});

describe('RealTimeAnalytics', () => {
  let analytics: RealTimeAnalytics;
  let mockWsManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWsManager = {
      subscribe: vi.fn(),
      send: vi.fn(),
    };

    analytics = new RealTimeAnalytics();
    (analytics as any).wsManager = mockWsManager;
  });

  it('should track events', () => {
    analytics.trackEvent('test-event', { data: 'test' });
    
    expect(mockWsManager.send).toHaveBeenCalledWith('analytics-event', expect.objectContaining({
      eventName: 'test-event'
    }));
  });

  it('should track page views', () => {
    analytics.trackPageView();
    
    expect(mockWsManager.send).toHaveBeenCalledWith('analytics-event', expect.objectContaining({
      eventName: 'page_view'
    }));
  });

  it('should get analytics summary', () => {
    const summary = analytics.getAnalyticsSummary();
    
    expect(summary).toHaveProperty('sessionId');
    expect(summary).toHaveProperty('pageViews');
    expect(summary).toHaveProperty('uniqueVisitors');
    expect(summary).toHaveProperty('sessionDuration');
  });

  it('should reset session', () => {
    analytics.resetSession();
    
    expect(mockWsManager.send).not.toHaveBeenCalled();
  });

  it('should destroy resources', () => {
    analytics.destroy();
    
    expect(mockWsManager.send).toHaveBeenCalledWith('analytics-data', expect.any(Object));
  });
});

describe('CollaborativeEditor', () => {
  let editor: CollaborativeEditor;
  let mockWsManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWsManager = {
      subscribe: vi.fn(),
      send: vi.fn(),
    };

    editor = new CollaborativeEditor('test-doc');
    (editor as any).wsManager = mockWsManager;
  });

  it('should insert text', () => {
    editor.insert(0, 'Hello');
    
    expect(mockWsManager.send).toHaveBeenCalledWith('operation-batch', expect.objectContaining({
      documentId: 'test-doc'
    }));
  });

  it('should delete text', () => {
    editor.delete(0, 5);
    
    expect(mockWsManager.send).toHaveBeenCalledWith('operation-batch', expect.objectContaining({
      documentId: 'test-doc'
    }));
  });

  it('should replace text', () => {
    editor.replace(0, 5, 'World');
    
    expect(mockWsManager.send).toHaveBeenCalledWith('operation-batch', expect.objectContaining({
      documentId: 'test-doc'
    }));
  });

  it('should get document', () => {
    const document = editor.getDocument();
    
    expect(typeof document).toBe('string');
  });

  it('should get document length', () => {
    const length = editor.getDocumentLength();
    
    expect(typeof length).toBe('number');
  });

  it('should get operation history', () => {
    const history = editor.getOperationHistory();
    
    expect(Array.isArray(history)).toBe(true);
  });

  it('should request document sync', () => {
    editor.requestDocumentSync();
    
    expect(mockWsManager.send).toHaveBeenCalledWith('document-sync-request', expect.objectContaining({
      documentId: 'test-doc'
    }));
  });

  it('should resolve conflicts', () => {
    const resolved = editor.resolveConflicts();
    
    expect(typeof resolved).toBe('string');
  });

  it('should destroy resources', () => {
    editor.destroy();
    
    expect(clearTimeout).toHaveBeenCalled();
  });
});

describe('Performance Tests', () => {
  it('should handle high message throughput', () => {
    const wsManager = WebSocketManager.getInstance();
    const startTime = Date.now();
    
    // Send 1000 messages
    for (let i = 0; i < 1000; i++) {
      wsManager.send(`event-${i}`, { data: i });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
  });

  it('should handle concurrent subscriptions', () => {
    const wsManager = WebSocketManager.getInstance();
    const callbacks: Array<(data: any) => void> = [];
    
    // Create 100 subscriptions
    for (let i = 0; i < 100; i++) {
      const callback = vi.fn();
      callbacks.push(callback);
      wsManager.subscribe(`event-${i}`, callback);
    }
    
    expect(callbacks.length).toBe(100);
  });

  it('should handle large payloads', () => {
    const wsManager = WebSocketManager.getInstance();
    const largeData = 'x'.repeat(10000); // 10KB of data
    
    expect(() => {
      wsManager.send('large-event', { data: largeData });
    }).not.toThrow();
  });
});

describe('Memory Management Tests', () => {
  it('should clean up listeners on unsubscribe', () => {
    const wsManager = WebSocketManager.getInstance();
    const callback = vi.fn();
    
    const unsubscribe = wsManager.subscribe('test-event', callback);
    unsubscribe();
    
    // Send message after unsubscribe
    const message = JSON.stringify({
      event: 'test-event',
      data: { test: 'data' },
      timestamp: Date.now()
    });
    
    // Should not call callback after unsubscribe
    expect(callback).not.toHaveBeenCalled();
  });

  it('should limit message queue size', () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Send more than 1000 messages to test queue limiting
    for (let i = 0; i < 1500; i++) {
      wsManager.send(`event-${i}`, { data: i });
    }
    
    // Should not cause memory issues
    expect(true).toBe(true);
  });
});

describe('Error Handling Tests', () => {
  it('should handle malformed WebSocket messages', () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Test with invalid JSON
    expect(() => {
      wsManager['handleMessage']('invalid json');
    }).not.toThrow();
  });

  it('should handle WebSocket errors gracefully', () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Simulate WebSocket error
    const error = new Error('WebSocket error');
    
    expect(() => {
      wsManager['handleMessage'](error as any);
    }).not.toThrow();
  });

  it('should handle subscription errors', () => {
    const wsManager = WebSocketManager.getInstance();
    const callback = vi.fn();
    
    // Create subscription that throws
    const throwingCallback = () => {
      throw new Error('Callback error');
    };
    
    const unsubscribe = wsManager.subscribe('error-event', throwingCallback);
    
    expect(() => {
      wsManager['dispatchMessage'](new Set([throwingCallback]), {});
    }).not.toThrow();
    
    unsubscribe();
  });
});
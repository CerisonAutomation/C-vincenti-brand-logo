import { bench, describe } from 'vitest';
import { WebSocketManager, RealTimeCollaboration, LiveNotifications, RealTimeAnalytics, CollaborativeEditor } from './real-time';

// Mock dependencies for benchmarks
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

describe('Real-Time System Benchmarks', () => {
  bench('WebSocketManager - Connect', async () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Mock WebSocket for benchmarking
    global.WebSocket = class {
      readyState = WebSocket.OPEN;
      send = vi.fn();
      close = vi.fn();
      onopen = null;
      onmessage = null;
      onclose = null;
      onerror = null;
    } as any;

    await wsManager.connect('ws://test.com');
    wsManager.disconnect();
  });

  bench('WebSocketManager - Send 1000 messages', () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Mock WebSocket
    global.WebSocket = class {
      readyState = WebSocket.OPEN;
      send = vi.fn();
      close = vi.fn();
      onopen = null;
      onmessage = null;
      onclose = null;
      onerror = null;
    } as any;

    for (let i = 0; i < 1000; i++) {
      wsManager.send(`event-${i}`, { data: i });
    }
  });

  bench('WebSocketManager - Subscribe 1000 callbacks', () => {
    const wsManager = WebSocketManager.getInstance();
    const callbacks: Array<(data: any) => void> = [];
    
    for (let i = 0; i < 1000; i++) {
      const callback = () => {};
      callbacks.push(callback);
      wsManager.subscribe(`event-${i}`, callback);
    }
    
    // Cleanup
    callbacks.forEach((_, i) => {
      wsManager.subscribe(`event-${i}`, () => {});
    });
  });

  bench('RealTimeCollaboration - Update cursor 1000 times', () => {
    const collaboration = new RealTimeCollaboration('test-doc', 'user1', 'Test User');
    
    for (let i = 0; i < 1000; i++) {
      collaboration.updateCursor({ x: i, y: i });
    }
  });

  bench('RealTimeCollaboration - Update selection 1000 times', () => {
    const collaboration = new RealTimeCollaboration('test-doc', 'user1', 'Test User');
    
    for (let i = 0; i < 1000; i++) {
      collaboration.updateSelection({ start: i, end: i + 10 });
    }
  });

  bench('LiveNotifications - Add 1000 notifications', () => {
    const notifications = new LiveNotifications();
    
    for (let i = 0; i < 1000; i++) {
      notifications.sendNotification({
        title: `Notification ${i}`,
        body: `Body ${i}`,
        type: i % 2 === 0 ? 'info' : 'warning'
      });
    }
  });

  bench('LiveNotifications - Get unread count', () => {
    const notifications = new LiveNotifications();
    
    // Add some notifications
    for (let i = 0; i < 100; i++) {
      notifications.sendNotification({
        title: `Notification ${i}`,
        body: `Body ${i}`
      });
    }
    
    notifications.getUnreadCount();
  });

  bench('RealTimeAnalytics - Track 1000 events', () => {
    const analytics = new RealTimeAnalytics();
    
    for (let i = 0; i < 1000; i++) {
      analytics.trackEvent(`event-${i}`, { data: i, timestamp: Date.now() });
    }
  });

  bench('RealTimeAnalytics - Get analytics summary', () => {
    const analytics = new RealTimeAnalytics();
    
    // Track some events
    for (let i = 0; i < 100; i++) {
      analytics.trackEvent(`event-${i}`, { data: i });
    }
    
    analytics.getAnalyticsSummary();
  });

  bench('CollaborativeEditor - Insert 1000 operations', () => {
    const editor = new CollaborativeEditor('test-doc');
    
    for (let i = 0; i < 1000; i++) {
      editor.insert(i * 10, `Text ${i}`);
    }
  });

  bench('CollaborativeEditor - Delete 1000 operations', () => {
    const editor = new CollaborativeEditor('test-doc');
    
    // First insert some text
    for (let i = 0; i < 1000; i++) {
      editor.insert(i * 10, `Text ${i}`);
    }
    
    // Then delete
    for (let i = 0; i < 1000; i++) {
      editor.delete(i * 10, 5);
    }
  });

  bench('CollaborativeEditor - Get document', () => {
    const editor = new CollaborativeEditor('test-doc');
    
    // Insert some text
    for (let i = 0; i < 100; i++) {
      editor.insert(i * 10, `Text ${i}`);
    }
    
    editor.getDocument();
  });

  bench('CollaborativeEditor - Resolve conflicts', () => {
    const editor = new CollaborativeEditor('test-doc');
    
    // Insert operations
    for (let i = 0; i < 100; i++) {
      editor.insert(i * 10, `Text ${i}`);
    }
    
    editor.resolveConflicts();
  });

  bench('Memory Usage - Large message handling', () => {
    const wsManager = WebSocketManager.getInstance();
    const largeMessage = {
      event: 'large-data',
      data: 'x'.repeat(100000), // 100KB of data
      timestamp: Date.now()
    };
    
    wsManager.send('large-event', largeMessage);
  });

  bench('Memory Usage - Many small messages', () => {
    const wsManager = WebSocketManager.getInstance();
    
    for (let i = 0; i < 10000; i++) {
      wsManager.send(`small-event-${i}`, { data: i });
    }
  });

  bench('Error Handling - Malformed messages', () => {
    const wsManager = WebSocketManager.getInstance();
    
    // Test with various malformed messages
    const malformedMessages = [
      'invalid json',
      '{ invalid json }',
      '{"missing": "quotes',
      '{"extra": "commas",}',
      null,
      undefined,
      123,
      true
    ];
    
    malformedMessages.forEach(message => {
      try {
        wsManager['handleMessage'](message);
      } catch (error) {
        // Expected to handle gracefully
      }
    });
  });

  bench('Concurrency - Multiple operations', () => {
    const editor = new CollaborativeEditor('test-doc');
    
    // Simulate concurrent operations
    const operations = [
      () => editor.insert(0, 'Hello'),
      () => editor.insert(5, ' World'),
      () => editor.delete(0, 5),
      () => editor.replace(5, 5, 'Universe'),
      () => editor.getDocument(),
      () => editor.getDocumentLength(),
      () => editor.getOperationHistory()
    ];
    
    operations.forEach(op => op());
  });

  bench('Real-time throughput - 1000 operations per second', () => {
    const editor = new CollaborativeEditor('test-doc');
    const startTime = Date.now();
    
    // Simulate high throughput
    for (let i = 0; i < 1000; i++) {
      editor.insert(i, `Op ${i}`);
    }
    
    const duration = Date.now() - startTime;
    // Should complete in under 100ms for 1000 operations
    expect(duration).toBeLessThan(100);
  });

  bench('Analytics batch processing', () => {
    const analytics = new RealTimeAnalytics();
    
    // Track many events quickly
    for (let i = 0; i < 1000; i++) {
      analytics.trackEvent(`batch-event-${i}`, {
        data: i,
        timestamp: Date.now(),
        metadata: { batch: true, index: i }
      });
    }
    
    // Flush analytics
    analytics['flushAnalyticsData']();
  });

  bench('Notification deduplication', () => {
    const notifications = new LiveNotifications();
    
    // Send duplicate notifications
    for (let i = 0; i < 1000; i++) {
      notifications.sendNotification({
        title: 'Duplicate Notification',
        body: 'This is a duplicate notification',
        type: 'info'
      });
    }
  });

  bench('Collaboration presence tracking', () => {
    const collaboration = new RealTimeCollaboration('test-doc', 'user1', 'Test User');
    
    // Simulate presence updates
    for (let i = 0; i < 1000; i++) {
      collaboration.updateCursor({ x: i % 100, y: i % 100 });
    }
  });
});
/**
 * Real-Time Collaboration Engine
 * Enables live collaboration features for property management and bookings
 * Implements WebSocket-based real-time updates, presence indicators, and conflict resolution
 * @version 1.0.0
 * @author Cascade AI
 */

import { z } from 'zod';

// Collaboration Schemas
export const UserPresenceSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  location: z.string(),
  activity: z.enum(['viewing', 'editing', 'booking', 'support']),
  lastSeen: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export const CollaborationEventSchema = z.object({
  id: z.string(),
  type: z.enum(['join', 'leave', 'update', 'action', 'conflict', 'sync']),
  userId: z.string(),
  sessionId: z.string(),
  resourceId: z.string(),
  resourceType: z.enum(['property', 'booking', 'calendar', 'pricing']),
  data: z.record(z.unknown()),
  timestamp: z.number(),
});

export const ConflictResolutionSchema = z.object({
  conflictId: z.string(),
  resourceId: z.string(),
  resourceType: z.string(),
  conflictingUsers: z.array(z.string()),
  originalValue: z.unknown(),
  conflictingValues: z.array(z.object({
    userId: z.string(),
    value: z.unknown(),
    timestamp: z.number(),
  })),
  resolution: z.enum(['manual', 'automatic', 'merge', 'discard']).optional(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.number().optional(),
});

// WebSocket Manager
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, token: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.getWebSocketUrl()}/collaboration?userId=${userId}&token=${token}`;

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`WebSocket connected for user ${userId}`);
          this.connections.set(userId, ws);
          this.reconnectAttempts.delete(userId);
          resolve(ws);
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed for user ${userId}:`, event.code, event.reason);
          this.connections.delete(userId);
          this.handleReconnect(userId, token);
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          reject(error);
        };

        ws.onmessage = (event) => {
          this.handleMessage(userId, event.data);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
  }

  private handleReconnect(userId: string, token: string) {
    const attempts = this.reconnectAttempts.get(userId) || 0;

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(userId, attempts + 1);

      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket for user ${userId} (attempt ${attempts + 1})`);
        this.connect(userId, token).catch(() => {
          // Reconnection will be handled by the close event if it fails again
        });
      }, this.reconnectDelay * Math.pow(2, attempts)); // Exponential backoff
    } else {
      console.error(`Max reconnection attempts reached for user ${userId}`);
      this.reconnectAttempts.delete(userId);
    }
  }

  private handleMessage(userId: string, data: string) {
    try {
      const message = JSON.parse(data);
      // Dispatch to collaboration manager
      CollaborationManager.getInstance().handleMessage(userId, message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  send(userId: string, message: unknown) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn(`Cannot send message: WebSocket not connected for user ${userId}`);
    }
  }

  disconnect(userId: string) {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.close();
      this.connections.delete(userId);
    }
    this.reconnectAttempts.delete(userId);
  }
}

// Presence Manager
export class PresenceManager {
  private presence: Map<string, z.infer<typeof UserPresenceSchema>> = new Map();
  private subscribers: Set<(presence: Map<string, z.infer<typeof UserPresenceSchema>>) => void> = new Set();

  updatePresence(userPresence: z.infer<typeof UserPresenceSchema>) {
    this.presence.set(userPresence.userId, {
      ...userPresence,
      lastSeen: Date.now(),
    });

    this.notifySubscribers();
    this.broadcastPresenceUpdate(userPresence);
  }

  removePresence(userId: string) {
    this.presence.delete(userId);
    this.notifySubscribers();
    this.broadcastPresenceLeave(userId);
  }

  getPresence(userId: string): z.infer<typeof UserPresenceSchema> | undefined {
    return this.presence.get(userId);
  }

  getAllPresence(): Map<string, z.infer<typeof UserPresenceSchema>> {
    return new Map(this.presence);
  }

  subscribe(callback: (presence: Map<string, z.infer<typeof UserPresenceSchema>>) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.getAllPresence()));
  }

  private broadcastPresenceUpdate(presence: z.infer<typeof UserPresenceSchema>) {
    CollaborationManager.getInstance().broadcastEvent({
      id: crypto.randomUUID(),
      type: 'update',
      userId: presence.userId,
      sessionId: presence.sessionId,
      resourceId: 'presence',
      resourceType: 'presence',
      data: { presence },
      timestamp: Date.now(),
    });
  }

  private broadcastPresenceLeave(userId: string) {
    CollaborationManager.getInstance().broadcastEvent({
      id: crypto.randomUUID(),
      type: 'leave',
      userId,
      sessionId: '',
      resourceId: 'presence',
      resourceType: 'presence',
      data: { userId },
      timestamp: Date.now(),
    });
  }
}

// Conflict Resolution Engine
export class ConflictResolutionEngine {
  private conflicts: Map<string, z.infer<typeof ConflictResolutionSchema>> = new Map();
  private resolvers: Map<string, ConflictResolver> = new Map();

  detectConflict(resourceId: string, userId: string, newValue: unknown, existingValue: unknown): boolean {
    // Simple conflict detection - values are different
    return JSON.stringify(newValue) !== JSON.stringify(existingValue);
  }

  createConflict(
    resourceId: string,
    resourceType: string,
    conflictingUsers: string[],
    originalValue: unknown,
    conflictingValues: Array<{ userId: string; value: unknown; timestamp: number }>
  ): string {
    const conflictId = crypto.randomUUID();

    const conflict: z.infer<typeof ConflictResolutionSchema> = {
      conflictId,
      resourceId,
      resourceType,
      conflictingUsers,
      originalValue,
      conflictingValues,
    };

    this.conflicts.set(conflictId, conflict);

    // Notify conflict resolver if registered
    const resolver = this.resolvers.get(resourceType);
    if (resolver) {
      resolver.onConflict(conflict);
    }

    return conflictId;
  }

  resolveConflict(conflictId: string, resolution: z.infer<typeof ConflictResolutionSchema>['resolution'], resolvedBy: string) {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;

    conflict.resolution = resolution;
    conflict.resolvedBy = resolvedBy;
    conflict.resolvedAt = Date.now();

    // Apply resolution
    this.applyResolution(conflict);

    // Clean up
    this.conflicts.delete(conflictId);
  }

  registerResolver(resourceType: string, resolver: ConflictResolver) {
    this.resolvers.set(resourceType, resolver);
  }

  private applyResolution(conflict: z.infer<typeof ConflictResolutionSchema>) {
    // Apply the resolution strategy
    switch (conflict.resolution) {
      case 'automatic':
        // Auto-merge if possible
        this.autoMerge(conflict);
        break;
      case 'manual':
        // Wait for manual resolution
        break;
      case 'merge':
        // Merge conflicting values
        this.mergeValues(conflict);
        break;
      case 'discard':
        // Discard conflicting changes
        this.discardChanges(conflict);
        break;
    }
  }

  private autoMerge(conflict: z.infer<typeof ConflictResolutionSchema>) {
    // Implement auto-merge logic (simplified)
    // For now, take the most recent change
    const latestValue = conflict.conflictingValues.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );

    CollaborationManager.getInstance().applyChange(
      conflict.resourceId,
      latestValue.value,
      latestValue.userId
    );
  }

  private mergeValues(conflict: z.infer<typeof ConflictResolutionSchema>) {
    // Implement merge logic (simplified)
    // Take the first conflicting value
    const mergedValue = conflict.conflictingValues[0]?.value;

    CollaborationManager.getInstance().applyChange(
      conflict.resourceId,
      mergedValue,
      conflict.resolvedBy!
    );
  }

  private discardChanges(conflict: z.infer<typeof ConflictResolutionSchema>) {
    // Discard all conflicting changes, keep original
    CollaborationManager.getInstance().applyChange(
      conflict.resourceId,
      conflict.originalValue,
      conflict.resolvedBy!
    );
  }
}

// Operational Transformation for Real-time Sync
export class OperationalTransformation {
  private operations: Map<string, Operation[]> = new Map();

  applyOperation(resourceId: string, operation: Operation) {
    const operations = this.operations.get(resourceId) || [];
    operations.push(operation);
    this.operations.set(resourceId, operations);

    // Apply operation to current state
    this.transformAndApply(resourceId, operation);
  }

  getOperations(resourceId: string): Operation[] {
    return this.operations.get(resourceId) || [];
  }

  transformOperations(resourceId: string, newOperation: Operation): Operation {
    const operations = this.operations.get(resourceId) || [];

    // Apply operational transformation
    let transformedOperation = { ...newOperation };

    for (const existingOp of operations) {
      transformedOperation = this.transform(transformedOperation, existingOp);
    }

    return transformedOperation;
  }

  private transform(op1: Operation, op2: Operation): Operation {
    // Simplified operational transformation
    // In a real implementation, this would handle complex transformations
    return op1;
  }

  private transformAndApply(resourceId: string, operation: Operation) {
    // Apply the operation to the local state
    // This would integrate with the actual data store
    console.log(`Applying operation to ${resourceId}:`, operation);
  }
}

// Main Collaboration Manager
export class CollaborationManager {
  private static instance: CollaborationManager;
  private wsManager: WebSocketManager;
  private presenceManager: PresenceManager;
  private conflictResolver: ConflictResolutionEngine;
  private ot: OperationalTransformation;
  private subscribers: Map<string, Set<(event: z.infer<typeof CollaborationEventSchema>) => void>> = new Map();

  private constructor() {
    this.wsManager = new WebSocketManager();
    this.presenceManager = new PresenceManager();
    this.conflictResolver = new ConflictResolutionEngine();
    this.ot = new OperationalTransformation();
  }

  static getInstance(): CollaborationManager {
    if (!CollaborationManager.instance) {
      CollaborationManager.instance = new CollaborationManager();
    }
    return CollaborationManager.instance;
  }

  async joinCollaboration(userId: string, token: string) {
    await this.wsManager.connect(userId, token);
    this.presenceManager.updatePresence({
      userId,
      sessionId: crypto.randomUUID(),
      location: window.location.pathname,
      activity: 'viewing',
      lastSeen: Date.now(),
    });
  }

  leaveCollaboration(userId: string) {
    this.presenceManager.removePresence(userId);
    this.wsManager.disconnect(userId);
  }

  subscribeToResource(resourceId: string, callback: (event: z.infer<typeof CollaborationEventSchema>) => void) {
    if (!this.subscribers.has(resourceId)) {
      this.subscribers.set(resourceId, new Set());
    }
    this.subscribers.get(resourceId)!.add(callback);

    return () => {
      this.subscribers.get(resourceId)?.delete(callback);
    };
  }

  broadcastEvent(event: z.infer<typeof CollaborationEventSchema>) {
    // Send to WebSocket
    this.wsManager.send(event.userId, event);

    // Notify local subscribers
    const subscribers = this.subscribers.get(event.resourceId);
    if (subscribers) {
      subscribers.forEach(callback => callback(event));
    }
  }

  applyChange(resourceId: string, change: unknown, userId: string) {
    // Check for conflicts
    const currentValue = this.getCurrentValue(resourceId);
    if (this.conflictResolver.detectConflict(resourceId, userId, change, currentValue)) {
      // Create conflict
      const conflictId = this.conflictResolver.createConflict(
        resourceId,
        'resource', // Generic type
        [userId],
        currentValue,
        [{ userId, value: change, timestamp: Date.now() }]
      );

      this.broadcastEvent({
        id: crypto.randomUUID(),
        type: 'conflict',
        userId,
        sessionId: '',
        resourceId,
        resourceType: 'resource',
        data: { conflictId, change },
        timestamp: Date.now(),
      });

      return;
    }

    // Apply operational transformation
    const operation: Operation = {
      id: crypto.randomUUID(),
      type: 'update',
      userId,
      resourceId,
      data: change,
      timestamp: Date.now(),
    };

    this.ot.applyOperation(resourceId, operation);

    // Broadcast the change
    this.broadcastEvent({
      id: crypto.randomUUID(),
      type: 'sync',
      userId,
      sessionId: '',
      resourceId,
      resourceType: 'resource',
      data: { change },
      timestamp: Date.now(),
    });
  }

  handleMessage(userId: string, message: z.infer<typeof CollaborationEventSchema>) {
    // Handle incoming collaboration events
    switch (message.type) {
      case 'join':
        this.presenceManager.updatePresence(message.data.presence);
        break;
      case 'leave':
        this.presenceManager.removePresence(message.data.userId);
        break;
      case 'update':
        // Handle resource updates
        this.applyChange(message.resourceId, message.data.change, message.userId);
        break;
      case 'conflict':
        // Handle conflict notifications
        this.handleConflict(message.data.conflictId, message.data.change);
        break;
      case 'sync':
        // Handle synchronization events
        this.syncResource(message.resourceId, message.data.change);
        break;
    }
  }

  private getCurrentValue(resourceId: string): unknown {
    // Get current value from data store
    // This would integrate with the actual data management system
    return null;
  }

  private handleConflict(conflictId: string, change: unknown) {
    // Handle conflict resolution UI
    console.log(`Conflict detected: ${conflictId}`, change);
  }

  private syncResource(resourceId: string, change: unknown) {
    // Sync resource with incoming changes
    console.log(`Syncing resource ${resourceId}:`, change);
  }

  getPresence() {
    return this.presenceManager.getAllPresence();
  }

  resolveConflict(conflictId: string, resolution: z.infer<typeof ConflictResolutionSchema>['resolution'], userId: string) {
    this.conflictResolver.resolveConflict(conflictId, resolution, userId);
  }
}

// React Hooks for Collaboration
export const useCollaboration = (userId: string, token: string) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [presence, setPresence] = React.useState<Map<string, z.infer<typeof UserPresenceSchema>>>(new Map());

  React.useEffect(() => {
    const manager = CollaborationManager.getInstance();

    const connect = async () => {
      try {
        await manager.joinCollaboration(userId, token);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to join collaboration:', error);
      }
    };

    connect();

    // Subscribe to presence updates
    const unsubscribe = manager.getPresenceManager().subscribe(setPresence);

    return () => {
      manager.leaveCollaboration(userId);
      unsubscribe();
    };
  }, [userId, token]);

  return { isConnected, presence };
};

export const useCollaborativeResource = (resourceId: string) => {
  const [value, setValue] = React.useState<unknown>(null);
  const [conflicts, setConflicts] = React.useState<string[]>([]);

  React.useEffect(() => {
    const manager = CollaborationManager.getInstance();

    const unsubscribe = manager.subscribeToResource(resourceId, (event) => {
      if (event.type === 'sync') {
        setValue(event.data.change);
      } else if (event.type === 'conflict') {
        setConflicts(prev => [...prev, event.data.conflictId]);
      }
    });

    return unsubscribe;
  }, [resourceId]);

  const applyChange = React.useCallback((change: unknown) => {
    CollaborationManager.getInstance().applyChange(resourceId, change, 'current-user');
  }, [resourceId]);

  const resolveConflict = React.useCallback((conflictId: string, resolution: z.infer<typeof ConflictResolutionSchema>['resolution']) => {
    CollaborationManager.getInstance().resolveConflict(conflictId, resolution, 'current-user');
  }, []);

  return { value, conflicts, applyChange, resolveConflict };
};

// Type definitions
interface Operation {
  id: string;
  type: string;
  userId: string;
  resourceId: string;
  data: unknown;
  timestamp: number;
}

interface ConflictResolver {
  onConflict(conflict: z.infer<typeof ConflictResolutionSchema>): void;
}

// Extend PresenceManager class to expose it
declare module './collaboration' {
  interface PresenceManager {
    subscribe(callback: (presence: Map<string, z.infer<typeof UserPresenceSchema>>) => void): () => void;
  }
}

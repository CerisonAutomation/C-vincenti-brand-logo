import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/guesty/client';

/**
 * Configuration options for real-time database subscriptions
 */
interface RealtimeOptions {
  /** The database table to subscribe to */
  table: string;
  /** Optional filter criteria for the subscription */
  filter?: Record<string, string | number | boolean>;
  /** Callback for INSERT events */
  onInsert?: (payload: unknown) => void;
  /** Callback for UPDATE events */
  onUpdate?: (payload: unknown) => void;
  /** Callback for DELETE events */
  onDelete?: (payload: unknown) => void;
}

/**
 * State of presence in a channel
 */
interface PresenceState {
  [key: string]: Array<{
    user_id: string;
    online_at: string;
  }>;
}

/**
 * Event data for presence changes
 */
interface PresenceEvent {
  key: string;
  newPresences?: Array<{ user_id: string; online_at: string }>;
  leftPresences?: Array<{ user_id: string; online_at: string }>;
}

/**
 * Hook for subscribing to real-time database changes
 * @param options Configuration for the subscription
 * @returns Connection status and last update timestamp
 */
export function useRealtimeSubscription(options: RealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`realtime-${options.table}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT' as const,
            schema: 'public',
            table: options.table,
            filter: options.filter ? Object.entries(options.filter).map(([k, v]) => `${k}=eq.${v}`).join(',') : undefined,
          },
          (payload) => {
            try {
              options.onInsert?.(payload);
              setLastUpdate(new Date());
            } catch (err) {
              console.error('Error in INSERT callback:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE' as const,
            schema: 'public',
            table: options.table,
            filter: options.filter ? Object.entries(options.filter).map(([k, v]) => `${k}=eq.${v}`).join(',') : undefined,
          },
          (payload) => {
            try {
              options.onUpdate?.(payload);
              setLastUpdate(new Date());
            } catch (err) {
              console.error('Error in UPDATE callback:', err);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE' as const,
            schema: 'public',
            table: options.table,
            filter: options.filter ? Object.entries(options.filter).map(([k, v]) => `${k}=eq.${v}`).join(',') : undefined,
          },
          (payload) => {
            try {
              options.onDelete?.(payload);
              setLastUpdate(new Date());
            } catch (err) {
              console.error('Error in DELETE callback:', err);
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('Subscription error:', err);
            setError(err);
            setIsConnected(false);
          } else {
            setIsConnected(status === 'SUBSCRIBED');
            if (status === 'SUBSCRIBED') {
              setError(null);
            }
          }
        });
    } catch (err) {
      console.error('Failed to create subscription:', err);
      setError(err as Error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [options]);

  return { isConnected, lastUpdate, error };
}

/**
 * Hook for tracking user presence in real-time channels
 * @param channelName Name of the presence channel
 * @returns Current presence state and current user info
 */
export function useRealtimePresence(channelName: string) {
  const [presence, setPresence] = useState<PresenceState>({});
  const [currentUser, setCurrentUser] = useState<{ user_id: string; online_at: string } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handlePresenceSync = useCallback(() => {
    try {
      // Note: channel is accessed inside useEffect, so this callback must be defined inside useEffect
      // For now, we'll handle this differently
    } catch (err) {
      console.error('Error syncing presence:', err);
    }
  }, []);

  const handlePresenceJoin = useCallback((event: PresenceEvent) => {
    console.log('User joined:', event.key, event.newPresences);
  }, []);

  const handlePresenceLeave = useCallback((event: PresenceEvent) => {
    console.log('User left:', event.key, event.leftPresences);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const handlePresenceSync = () => {
      try {
        if (channel) {
          const newState = channel.presenceState() as PresenceState;
          setPresence(newState);
        }
      } catch (err) {
        console.error('Error syncing presence:', err);
      }
    };

    try {
      channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: Math.random().toString(),
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, handlePresenceSync)
        .on('presence', { event: 'join' }, handlePresenceJoin)
        .on('presence', { event: 'leave' }, handlePresenceLeave)
        .subscribe(async (status, err) => {
          if (err) {
            console.error('Presence subscription error:', err);
            setError(err);
          } else if (status === 'SUBSCRIBED') {
            try {
              await channel!.track({
                user_id: Math.random().toString(),
                online_at: new Date().toISOString(),
              });
              setCurrentUser({ user_id: 'current', online_at: new Date().toISOString() });
              setError(null);
            } catch (trackErr) {
              console.error('Error tracking presence:', trackErr);
              setError(trackErr as Error);
            }
          }
        });
    } catch (err) {
      console.error('Failed to create presence channel:', err);
      setError(err as Error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channelName, handlePresenceJoin, handlePresenceLeave]);

  return { presence, currentUser, error };
}

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRealtimeSubscription, useRealtimePresence } from '../hooks/useRealtime';

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  removeChannel: vi.fn(),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/lib/guesty/client', () => ({
  supabase: mockSupabase,
}));

describe('useRealtimeSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize subscription correctly', async () => {
    const options = {
      table: 'test_table',
      filter: { user_id: '123' },
      onInsert: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    const { result } = renderHook(() => useRealtimeSubscription(options));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(mockSupabase.channel).toHaveBeenCalledWith('realtime-test_table');
    expect(mockChannel.on).toHaveBeenCalledTimes(3); // INSERT, UPDATE, DELETE
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should handle subscription errors', async () => {
    const options = { table: 'test_table' };
    const mockError = new Error('Subscription failed');

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('CHANNEL_ERROR', mockError);
    });

    const { result } = renderHook(() => useRealtimeSubscription(options));

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });
  });

  it('should call onInsert callback when INSERT event received', async () => {
    const onInsert = vi.fn();
    const options = { table: 'test_table', onInsert };
    const mockPayload = { new: { id: 1, name: 'test' } };

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
      // Simulate INSERT event
      const insertCallback = mockChannel.on.mock.calls.find(call => call[1].event === 'INSERT')[2];
      insertCallback(mockPayload);
    });

    renderHook(() => useRealtimeSubscription(options));

    await waitFor(() => {
      expect(onInsert).toHaveBeenCalledWith(mockPayload);
    });
  });

  it('should handle callback errors gracefully', async () => {
    const onInsert = vi.fn(() => { throw new Error('Callback error'); });
    const options = { table: 'test_table', onInsert };

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
      const insertCallback = mockChannel.on.mock.calls.find(call => call[1].event === 'INSERT')[2];
      insertCallback({});
    });

    const { result } = renderHook(() => useRealtimeSubscription(options));

    // Should not throw, error should be caught
    expect(result.current.isConnected).toBe(true);
  });

  it('should cleanup channel on unmount', () => {
    const options = { table: 'test_table' };

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    const { unmount } = renderHook(() => useRealtimeSubscription(options));

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});

describe('useRealtimePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize presence channel correctly', async () => {
    const channelName = 'test_presence';

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    const { result } = renderHook(() => useRealtimePresence(channelName));

    await waitFor(() => {
      expect(result.current.presence).toEqual({});
    });

    expect(mockSupabase.channel).toHaveBeenCalledWith(channelName, {
      config: { presence: { key: expect.any(String) } },
    });
    expect(mockChannel.on).toHaveBeenCalledTimes(3); // sync, join, leave
  });

  it('should track user presence on subscription', async () => {
    const channelName = 'test_presence';

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    renderHook(() => useRealtimePresence(channelName));

    await waitFor(() => {
      expect(mockChannel.track).toHaveBeenCalledWith({
        user_id: expect.any(String),
        online_at: expect.any(String),
      });
    });
  });

  it('should update presence state on sync', async () => {
    const channelName = 'test_presence';
    const mockPresenceState = {
      'user1': [{ user_id: 'user1', online_at: '2023-01-01T00:00:00Z' }],
    };

    mockChannel.presenceState = vi.fn(() => mockPresenceState);
    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
      // Simulate sync event
      const syncCallback = mockChannel.on.mock.calls.find(call => call[1].event === 'sync')[2];
      syncCallback();
    });

    const { result } = renderHook(() => useRealtimePresence(channelName));

    await waitFor(() => {
      expect(result.current.presence).toEqual(mockPresenceState);
    });
  });

  it('should handle presence tracking errors', async () => {
    const channelName = 'test_presence';
    const mockTrackError = new Error('Track failed');

    mockChannel.track.mockRejectedValue(mockTrackError);
    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    const { result } = renderHook(() => useRealtimePresence(channelName));

    await waitFor(() => {
      expect(result.current.error).toEqual(mockTrackError);
    });
  });

  it('should cleanup presence channel on unmount', () => {
    const channelName = 'test_presence';

    mockChannel.subscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
    });

    const { unmount } = renderHook(() => useRealtimePresence(channelName));

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});

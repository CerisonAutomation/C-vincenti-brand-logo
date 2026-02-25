# ADR 002: Supabase Real-time Data Integration

## Status
Accepted

## Context
The application requires real-time updates for property listings, chat messages, and user presence to provide a collaborative and responsive user experience. Traditional polling approaches would be inefficient and resource-intensive.

## Decision
We will implement Supabase's real-time features using PostgreSQL changes and presence channels for the following use cases:

1. **Property Listing Updates**: Real-time synchronization of property availability and pricing changes
2. **Chat Messaging**: Instant message delivery between users
3. **User Presence**: Live tracking of online users for collaborative features
4. **Booking Status**: Real-time updates on reservation confirmations and cancellations

## Implementation Details

### Real-time Subscriptions
- Use `useRealtimeSubscription` hook for database change subscriptions
- Support INSERT, UPDATE, DELETE event types with optional filtering
- Implement error handling and connection state management
- Use JSDoc for comprehensive API documentation

### Presence Tracking
- Use `useRealtimePresence` hook for user online/offline status
- Track user presence with unique identifiers and timestamps
- Handle presence events (join, leave, sync) with callbacks
- Integrate with authentication system for user identification

### Security Considerations
- All real-time subscriptions respect Row Level Security (RLS) policies
- Presence data is anonymized by default, with optional user identification
- Connection limits and rate limiting enforced at Supabase level

## Consequences

### Positive
- **Real-time UX**: Users see updates instantly without manual refresh
- **Scalability**: Serverless architecture with automatic scaling
- **Security**: Built-in RLS integration maintains data privacy
- **Developer Experience**: Simple hook-based API for React components

### Negative
- **Dependency on Supabase**: Tied to Supabase's real-time infrastructure
- **WebSocket Overhead**: Continuous connections may impact mobile battery life
- **Complexity**: Managing connection states and error handling

## Alternatives Considered
1. **Polling**: Simple but inefficient for real-time features
2. **WebSockets with custom server**: Higher complexity and maintenance cost
3. **Server-Sent Events**: Limited browser support and unidirectional

## References
- Supabase Real-time Documentation: https://supabase.com/docs/guides/realtime
- PostgreSQL Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Presence Channels: https://supabase.com/docs/guides/realtime/presence

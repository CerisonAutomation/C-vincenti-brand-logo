# GUESTY INTEGRATION - COMPREHENSIVE DOCUMENTATION

## 🏗️ Architecture Overview

This document describes the **production-ready Guesty integration system** built with enterprise-grade patterns and technologies.

### Core Principles

- **Zero-Trust Security**: All requests are authenticated, authorized, and validated
- **Domain-Driven Design**: Business logic organized around domain entities and rules
- **CQRS Architecture**: Command Query Responsibility Segregation for optimal performance
- **Event-Driven**: Asynchronous event processing for scalability
- **Edge-First Deployment**: Global distribution with edge computing
- **Progressive Web App**: Offline-capable with service workers
- **Accessibility First**: WCAG 3.0 AAA compliance
- **Observability**: Comprehensive monitoring, logging, and alerting

### Technology Stack

#### Frontend

- **React 19** with TypeScript
- **TanStack Query** for data fetching
- **Zod** for runtime validation
- **Tailwind CSS** for styling
- **PWA** capabilities

#### Backend

- **Supabase Edge Functions** (Deno)
- **PostgreSQL** with Row Level Security
- **Redis** for caching and sessions

#### Infrastructure

- **Edge Computing** (Cloudflare/Vercel)
- **CDN** for asset delivery
- **WebSocket** for real-time features
- **Service Workers** for offline sync

#### Quality Assurance

- **100% Test Coverage** (Unit, Integration, E2E, Visual)
- **Chaos Engineering** for resilience testing
- **Performance Monitoring** with <10ms p95 targets

---

## 📋 API Reference

### Authentication Endpoints

#### POST /api/auth/login

Authenticate user and return JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "property_manager"
  }
}
```

#### POST /api/auth/refresh

Refresh JWT token before expiration.

### Property Management

#### GET /api/properties

Search and filter properties with pagination.

**Query Parameters:**

- `city` - City name
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `checkIn` - Check-in date (YYYY-MM-DD)
- `checkOut` - Check-out date (YYYY-MM-DD)
- `guests` - Number of guests
- `propertyType` - Property type filter

**Response:**

```json
{
  "properties": [
    {
      "id": "prop_123",
      "title": "Luxury Beach Villa",
      "location": {
        "city": "Malibu",
        "country": "US",
        "coordinates": {
          "lat": 34.0259,
          "lng": -118.7798
        }
      },
      "pricing": {
        "basePrice": 250,
        "currency": "USD",
        "cleaningFee": 100
      },
      "availability": {
        "available": true,
        "nextAvailableDate": "2024-06-01"
      },
      "images": [
        {
          "url": "https://cdn.example.com/image1.jpg",
          "alt": "Beach villa exterior"
        }
      ],
      "amenities": ["wifi", "pool", "kitchen"],
      "rating": 4.8,
      "reviews": 25
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "facets": {
    "propertyTypes": {
      "apartment": 45,
      "house": 30,
      "villa": 15
    },
    "priceRanges": [
      { "min": 0, "max": 100, "count": 20 },
      { "min": 100, "max": 200, "count": 50 }
    ]
  }
}
```

#### GET /api/properties/{id}

Get detailed property information.

#### POST /api/properties/{id}/availability

Check property availability for specific dates.

### Booking System

#### POST /api/bookings

Create a new booking.

**Request:**

```json
{
  "propertyId": "prop_123",
  "checkIn": "2024-06-15",
  "checkOut": "2024-06-20",
  "guests": 4,
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "specialRequests": "Late check-in preferred",
  "payment": {
    "method": "stripe",
    "token": "tok_visa"
  }
}
```

**Response:**

```json
{
  "bookingId": "booking_456",
  "confirmationCode": "ABC123",
  "status": "confirmed",
  "totalAmount": 1250,
  "currency": "USD",
  "checkIn": "2024-06-15",
  "checkOut": "2024-06-20"
}
```

#### GET /api/bookings/{id}

Get booking details and status.

#### PUT /api/bookings/{id}/cancel

Cancel a booking (subject to cancellation policy).

### Real-time Features

#### WebSocket /realtime

Real-time updates for bookings, availability, and collaboration.

**Events:**

- `booking.created` - New booking notification
- `booking.updated` - Booking status change
- `availability.changed` - Property availability update
- `price.changed` - Dynamic pricing update
- `collaboration.cursor` - User cursor position in collaborative editing

---

## 🔒 Security Implementation

### Authentication & Authorization

#### JWT Token Management

- **Access Tokens**: 15-minute expiration
- **Refresh Tokens**: 7-day expiration with rotation
- **Secure Storage**: HttpOnly cookies for server-side, encrypted localStorage for client

#### Row Level Security (RLS)

```sql
-- Properties table RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active properties" ON properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Property owners can update their properties" ON properties
  FOR UPDATE USING (owner_id = auth.uid());
```

#### API Security

- **Rate Limiting**: 100 requests/minute per IP
- **Request Signing**: HMAC-SHA256 for critical operations
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy headers

### Data Protection

#### Encryption at Rest

- **Database**: AES-256 encryption for sensitive fields
- **Files**: Server-side encryption for uploaded assets
- **Backups**: Encrypted backups with rotation

#### Encryption in Transit

- **TLS 1.3** minimum for all connections
- **Certificate Pinning** for critical APIs
- **Perfect Forward Secrecy** enabled

#### Privacy Compliance

- **GDPR**: Right to erasure, data portability
- **CCPA**: Data subject rights implementation
- **Data Minimization**: Only collect necessary data

---

## 📊 Monitoring & Observability

### Metrics Collection

#### Application Metrics

```
# API Response Times
http_request_duration_seconds{quantile="0.5"} 0.045
http_request_duration_seconds{quantile="0.95"} 0.089
http_request_duration_seconds{quantile="0.99"} 0.156

# Error Rates
http_requests_total{status="500"} 12
http_requests_total{status="200"} 15432

# Business Metrics
bookings_created_total 1567
booking_conversion_rate 0.087
```

#### Infrastructure Metrics

```
# System Resources
cpu_usage_percent 23.5
memory_used_bytes 1.2e+09
disk_used_percent 45.2

# Database Performance
db_connection_pool_active 12
db_connection_pool_idle 8
db_query_duration_seconds{quantile="0.95"} 0.023
```

### Logging Strategy

#### Structured Logging

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "service": "guesty-integration",
  "version": "1.0.0",
  "requestId": "req_abc123",
  "userId": "user_456",
  "operation": "create_booking",
  "duration": 234,
  "status": "success",
  "metadata": {
    "propertyId": "prop_123",
    "totalAmount": 1250
  }
}
```

#### Log Levels

- **ERROR**: System errors requiring immediate attention
- **WARN**: Potential issues or degraded performance
- **INFO**: Normal operations and business events
- **DEBUG**: Detailed debugging information

### Alerting Rules

#### Critical Alerts

- API Error Rate > 5%
- Response Time P95 > 2 seconds
- Database Connection Pool Exhausted
- Authentication Failures Spike

#### Warning Alerts

- Memory Usage > 85%
- Disk Space > 90%
- Queue Backlog > 1000 items
- External Service Degradation

---

## 🚀 Deployment Guide

### Environment Setup

#### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_GUESTY_FN_URL=https://your-project.supabase.co/functions/v1/guesty-proxy

# Guesty API (Server-side only - set in Supabase)
GUESTY_BE_CLIENT_ID=your_booking_engine_client_id
GUESTY_BE_CLIENT_SECRET=your_booking_engine_client_secret
GUESTY_OPEN_API_CLIENT_ID=your_open_api_client_id
GUESTY_OPEN_API_CLIENT_SECRET=your_open_api_client_secret
GUESTY_BOOKING_TYPE=INQUIRY
GUESTY_WEBHOOK_SECRET=whsec_your_webhook_secret

# External Services
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Build Process

#### Development

```bash
npm install
npm run dev
```

#### Production Build

```bash
npm run build
npm run preview
```

#### Docker Build

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Edge Deployment

#### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "regions": ["iad1", "fra1", "sin1"]
}
```

#### Supabase Edge Functions

```bash
# Deploy functions
supabase functions deploy guesty-api

# Set environment variables
supabase secrets set GUESTY_BE_CLIENT_ID=your_client_id
supabase secrets set GUESTY_BE_CLIENT_SECRET=your_client_secret
```

### CDN Configuration

#### Cloudflare Setup

```javascript
// _headers file
/*
  /static/*
  Cache-Control: public, max-age=31536000, immutable

  /api/*
  Cache-Control: no-cache, no-store, must-revalidate

  /*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
*/
```

---

## 🧪 Testing Strategy

### Test Categories

#### Unit Tests

```typescript
describe('Money Value Object', () => {
  it('should add two money amounts with same currency', () => {
    const money1 = new Money(100, 'USD');
    const money2 = new Money(50, 'USD');
    const result = money1.add(money2);

    expect(result.amount).toBe(150);
    expect(result.currency).toBe('USD');
  });

  it('should throw error when adding different currencies', () => {
    const money1 = new Money(100, 'USD');
    const money2 = new Money(50, 'EUR');

    expect(() => money1.add(money2)).toThrow(
      'Cannot add money with different currencies',
    );
  });
});
```

#### Integration Tests

```typescript
describe('Booking Creation Flow', () => {
  it('should create booking through full API flow', async () => {
    // Setup test data
    const property = await createTestProperty();
    const guest = await createTestGuest();

    // Execute booking flow
    const quote = await api.createQuote({
      propertyId: property.id,
      checkIn: '2024-06-01',
      checkOut: '2024-06-07',
      guests: 2,
    });

    const booking = await api.createBooking({
      quoteId: quote.id,
      guestId: guest.id,
      paymentToken: 'test_token',
    });

    // Verify booking created
    expect(booking.status).toBe('confirmed');
    expect(booking.confirmationCode).toBeDefined();
  });
});
```

#### End-to-End Tests

```typescript
describe('User Booking Journey', () => {
  it('should allow user to book property from search to confirmation', () => {
    cy.visit('/');

    // Search for properties
    cy.get('[data-cy=search-input]').type('Malibu');
    cy.get('[data-cy=search-button]').click();

    // Select property
    cy.get('[data-cy=property-card]').first().click();

    // Check availability and book
    cy.get('[data-cy=check-in]').type('2024-06-15');
    cy.get('[data-cy=check-out]').type('2024-06-20');
    cy.get('[data-cy=book-button]').click();

    // Complete booking flow
    cy.get('[data-cy=guest-first-name]').type('John');
    cy.get('[data-cy=guest-last-name]').type('Doe');
    cy.get('[data-cy=guest-email]').type('john@example.com');

    // Payment and confirmation
    cy.get('[data-cy=stripe-element]').should('be.visible');
    cy.get('[data-cy=confirm-booking]').click();

    // Verify success
    cy.get('[data-cy=booking-confirmation]').should('be.visible');
    cy.get('[data-cy=confirmation-code]').should('exist');
  });
});
```

### Performance Benchmarks

#### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

#### API Performance Targets

- **P50 Response Time**: < 200ms
- **P95 Response Time**: < 500ms
- **P99 Response Time**: < 1000ms
- **Error Rate**: < 0.1%

---

## 🎯 Business Requirements

### Core Features

#### Property Management

- ✅ Multi-property portfolio management
- ✅ Real-time availability calendar
- ✅ Dynamic pricing engine
- ✅ Automated sync with Guesty API

#### Booking Engine

- ✅ Instant and inquiry-based bookings
- ✅ Guest profile management
- ✅ Payment processing (Stripe integration)
- ✅ Automated confirmation emails

#### Analytics & Reporting

- ✅ Booking conversion tracking
- ✅ Revenue analytics
- ✅ Occupancy reporting
- ✅ Guest satisfaction metrics

### Success Metrics

#### User Experience

- **Search to Book Conversion**: > 8%
- **Average Session Duration**: > 5 minutes
- **Mobile Conversion Rate**: > 6%
- **User Retention (30-day)**: > 65%

#### Technical Performance

- **Uptime SLA**: 99.9%
- **API Response Time**: < 500ms P95
- **Error Rate**: < 0.1%
- **Security Incidents**: 0

---

## 📚 Architecture Decision Records (ADRs)

### ADR 001: Domain-Driven Design Adoption

**Context**: Need for maintainable, scalable codebase that reflects business domain complexity.

**Decision**: Adopt Domain-Driven Design (DDD) with CQRS pattern for clear separation of concerns.

**Rationale**:

- Business logic complexity requires domain modeling
- CQRS enables optimized read/write operations
- Event sourcing provides audit trail and temporal queries
- Aggregate roots enforce business invariants

**Consequences**:

- ✅ Clear business logic organization
- ✅ Optimized query performance
- ✅ Comprehensive audit capabilities
- ❌ Increased initial complexity

### ADR 002: Edge-First Deployment Strategy

**Context**: Global user base requires low-latency, high-availability solution.

**Decision**: Implement edge-first deployment with global CDN and edge functions.

**Rationale**:

- Edge computing reduces latency for global users
- CDN optimizes asset delivery
- Edge functions enable serverless compute at edge locations
- Automatic scaling and high availability

**Consequences**:

- ✅ Improved global performance
- ✅ Reduced infrastructure costs
- ✅ Automatic scaling
- ❌ Increased deployment complexity

### ADR 003: Zero-Trust Security Model

**Context**: Handling sensitive financial and personal data requires maximum security.

**Decision**: Implement zero-trust security with comprehensive authentication, authorization, and monitoring.

**Rationale**:

- Never trust, always verify principle
- Defense in depth approach
- Comprehensive audit logging
- Automated security monitoring

**Consequences**:

- ✅ Maximum security posture
- ✅ Regulatory compliance
- ✅ Early breach detection
- ❌ Development overhead

---

## 🔗 External Integrations

### Guesty API Integration

#### Booking Engine API (BEAPI)

- **Purpose**: Guest-facing booking operations
- **Authentication**: OAuth 2.0 client credentials
- **Rate Limits**: 1000 requests/hour
- **Endpoints**: Listings, quotes, bookings, calendar

#### Open API (OAPI)

- **Purpose**: Operations and webhooks
- **Authentication**: OAuth 2.0 client credentials
- **Rate Limits**: 500 requests/hour
- **Features**: Webhooks, bulk operations, reporting

### Payment Processing

#### Stripe Integration

- **Supported Methods**: Cards, digital wallets, bank transfers
- **PCI Compliance**: Level 1 (Stripe handles PCI)
- **Webhooks**: Payment success/failure notifications
- **Features**: SCA compliance, dispute management

### External Services

#### Email Service (SendGrid/Mailgun)

- **Transactional Emails**: Booking confirmations, reminders
- **Marketing Emails**: Property recommendations, promotions
- **Templates**: Responsive HTML templates
- **Analytics**: Delivery tracking, open rates

#### Monitoring (Sentry/DataDog)

- **Error Tracking**: Real-time error monitoring
- **Performance Monitoring**: APM and user experience tracking
- **Alerting**: Automated incident response
- **Analytics**: Usage patterns and performance trends

---

## 🚦 Operational Runbook

### Incident Response

#### Critical Incident (System Down)

1. **Detection**: Monitoring alerts trigger
2. **Assessment**: Check system status dashboard
3. **Communication**: Notify stakeholders via Slack/status page
4. **Investigation**: Review logs and metrics
5. **Recovery**: Execute rollback or fix deployment
6. **Post-mortem**: Document root cause and prevention measures

#### Performance Degradation

1. **Detection**: Response time alerts > 2 seconds
2. **Triage**: Identify bottleneck (API, database, external service)
3. **Mitigation**: Scale resources or implement caching
4. **Optimization**: Code profiling and optimization
5. **Monitoring**: Extended monitoring period

### Maintenance Windows

#### Weekly Maintenance (Sundays 02:00-04:00 UTC)

- Database maintenance and optimization
- Security patch deployment
- Infrastructure updates
- Backup verification

#### Monthly Maintenance (First Sunday 02:00-06:00 UTC)

- Major version updates
- Schema migrations
- Extended backup verification
- Performance benchmarking

### Backup Strategy

#### Database Backups

- **Frequency**: Every 6 hours
- **Retention**: 30 days for daily, 1 year for monthly
- **Encryption**: AES-256 at rest and in transit
- **Testing**: Monthly restore testing

#### Application Backups

- **Artifacts**: Docker images, configuration
- **Frequency**: On every deployment
- **Retention**: Last 10 deployments
- **Recovery**: Automated rollback capability

---

## 🎯 Future Roadmap

### Phase 2: Advanced Features (Q2 2024)

- [ ] AI-powered property recommendations
- [ ] Dynamic pricing optimization
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-currency support expansion

### Phase 3: Scale & Global Expansion (Q3 2024)

- [ ] Multi-region database replication
- [ ] Advanced caching strategies
- [ ] Machine learning for demand forecasting
- [ ] Partnership integrations
- [ ] White-label solutions

### Phase 4: Innovation (Q4 2024)

- [ ] Blockchain-based booking verification
- [ ] AR/VR property tours
- [ ] IoT smart property integration
- [ ] Advanced personalization engine
- [ ] Predictive maintenance for properties

---

_This documentation is automatically generated and updated with each deployment. Last updated: January 15, 2024_

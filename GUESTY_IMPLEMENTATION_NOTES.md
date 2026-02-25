# Production-Grade Guesty Booking Website - Implementation Notes

## Guesty Account Setup & Activation Requirements

### 1. Account Activation Steps
Before your booking website can accept real bookings, you must complete Guesty's activation process:

#### Step 1: Account Verification
- Complete your Guesty account setup
- Verify your email and phone number
- Add bank account information for payouts
- Upload required legal documents (ID, business registration if applicable)

#### Step 2: Property Setup
- Create at least one active listing
- Set up pricing and availability
- Configure booking settings (instant vs inquiry)
- Enable online payments in Guesty dashboard

#### Step 3: API Activation
- Request API access from Guesty support
- Provide your use case and website URL
- Wait for API credentials (can take 1-3 business days)
- Configure webhook endpoints in Guesty dashboard

#### Step 4: Booking Engine Activation
- Enable "Direct Booking" in your Guesty account
- Configure booking policies and terms
- Set up cancellation policies
- Test booking flow in Guesty dashboard

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Critical Security Note:** Never commit `.env` files to version control.

### 3. Webhook Setup

Configure webhooks in Guesty dashboard to point to:
```
POST https://yourdomain.com/api/webhooks/guesty
```

Required webhook events:
- `reservation.new`
- `reservation.updated`
- `reservation.messageReceived`
- `payment.succeeded`
- `payment.failed`

## Common Error Handling & Troubleshooting

### HTTP Status Codes & Meanings

#### 400 Bad Request
- **Cause:** Invalid request parameters, missing required fields
- **Solution:** Validate input data, check API documentation
- **Common Issues:**
  - Invalid date formats (use `YYYY-MM-DD`)
  - Missing `listingId`, `checkInDateLocalized`, `checkOutDateLocalized`, `guestsCount`

#### 401 Unauthorized
- **Cause:** Invalid or expired API credentials
- **Solution:** Check and refresh API tokens
- **Troubleshooting:**
  - Verify `GUESTY_BE_CLIENT_ID` and `GUESTY_BE_CLIENT_SECRET`
  - Check token expiration (24 hours for BEAPI, varies for OAPI)
  - Ensure credentials are for the correct account

#### 403 Forbidden
- **Cause:** Account not activated for API access
- **Solution:** Contact Guesty support for activation
- **Check:** Account must be on a paid plan with API access enabled

#### 404 Not Found
- **Cause:** Invalid listing ID or endpoint
- **Solution:** Verify listing exists and is published
- **Check:** Listing must be active and not archived

#### 429 Too Many Requests
- **Cause:** Rate limit exceeded
- **Solution:** Implement exponential backoff retry logic
- **Limits:** Typically 1000 requests/hour per API key
- **Headers:** Check `Retry-After` header for retry timing

#### 500 Internal Server Error
- **Cause:** Guesty API server error
- **Solution:** Implement retry with exponential backoff
- **Logging:** Log full request/response for debugging

### Booking-Specific Errors

#### "Listing not available for selected dates"
- **Code:** `LISTING_CALENDAR_BLOCKED`
- **Cause:** Dates already booked or blocked
- **Solution:** Check calendar availability before quote creation

#### "Property requires minimum stay"
- **Code:** `MIN_NIGHT_MISMATCH`
- **Cause:** Booking doesn't meet minimum night requirement
- **Solution:** Validate dates against listing rules

#### "Booking type not supported"
- **Issue:** Mismatch between `GUESTY_BOOKING_TYPE` and listing configuration
- **Solution:** Ensure instance booking type matches listing settings

### Webhook Signature Verification

```typescript
// Webhook verification example
function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${payload}.${secret}`)
  );
  // Compare with provided signature
}
```

### Rate Limiting Strategy

```typescript
// Exponential backoff implementation
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    return response;
  }
}
```

### Debugging Checklist

#### API Connection Issues
- [ ] Environment variables loaded correctly
- [ ] API credentials valid and not expired
- [ ] Account activated for API access
- [ ] Correct API endpoints being called
- [ ] Network connectivity to Guesty APIs

#### Booking Flow Issues
- [ ] Listing exists and is published
- [ ] Dates are available (check calendar)
- [ ] Guest count within limits
- [ ] Pricing configuration correct
- [ ] Booking type matches instance settings

#### Webhook Issues
- [ ] Webhook URL configured in Guesty dashboard
- [ ] Required events enabled
- [ ] Signature verification working
- [ ] Webhook endpoint accessible from internet

### Performance Optimization

#### Caching Strategy
- API responses cached for 5-10 minutes
- Token caching with automatic refresh
- Client-side query caching with React Query

#### Error Recovery
- Automatic retry for transient failures
- Graceful degradation for non-critical features
- User-friendly error messages

### Security Considerations

#### API Security
- All API calls go through server routes (no browser direct calls)
- Input validation on all endpoints
- Rate limiting implemented
- CORS properly configured

#### Data Protection
- PII redaction in logs
- Secure credential storage
- HTTPS required in production

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Guesty account activated
- [ ] API credentials tested
- [ ] Webhooks configured
- [ ] Domain SSL certificate installed
- [ ] Error monitoring (Sentry) configured
- [ ] Rate limiting tested
- [ ] Booking flow end-to-end tested

### Support Contacts

- **Guesty API Support:** api@guesty.com
- **Activation Issues:** Contact your Guesty account manager
- **Technical Issues:** Check Guesty API documentation at https://docs.guesty.com/

Remember: Guesty activation can take 1-3 business days. Plan your launch timeline accordingly.

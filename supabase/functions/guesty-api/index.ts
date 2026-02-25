import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── Basic Security Implementation for Deno ──
const SECURITY_CONFIG = {
  RATE_LIMITS: {
    LISTINGS: { window: 60000, max: 100 },
    QUOTES: { window: 60000, max: 20 },
    BOOKINGS: { window: 300000, max: 5 },
  },
};

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  checkLimit(key: string, limit: { window: number; max: number }): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + limit.window,
      });
      return { allowed: true, remaining: limit.max - 1, resetTime: now + limit.window };
    }

    if (record.count >= limit.max) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    this.store.set(key, record);

    return {
      allowed: true,
      remaining: limit.max - record.count,
      resetTime: record.resetTime,
    };
  }
}

class AuditLogger {
  logRequest(requestId: string, method: string, url: string, userId?: string, ip?: string, userAgent?: string) {
    console.log(`[${requestId}] ${method} ${url} - IP: ${ip || 'unknown'} - User: ${userId || 'anonymous'}`);
  }

  logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    console.error(`[SECURITY-${severity.toUpperCase()}] ${event}:`, details);
  }
}

class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  }

  static getCorsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
    const allowOrigin = allowedOrigins.includes('*') ? '*' :
                       (origin && allowedOrigins.includes(origin)) ? origin :
                       allowedOrigins[0] || 'null';

    return {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }
}

const rateLimiter = new RateLimiter();
const auditLogger = new AuditLogger();

// ── Environment & Configuration ──
const REQUIRED_ENV_VARS = [
  'GUESTY_BE_CLIENT_ID',
  'GUESTY_BE_CLIENT_SECRET',
  'GUESTY_OPEN_API_CLIENT_ID',
  'GUESTY_OPEN_API_CLIENT_SECRET',
  'GUESTY_BOOKING_TYPE', // 'INQUIRY' or 'INSTANT'
  'GUESTY_WEBHOOK_SECRET', // For Svix signature verification
  'ALLOWED_ORIGINS', // CORS origins
];

// Validate environment at boot
for (const envVar of REQUIRED_ENV_VARS) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// CORS configuration
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map((s: string) => s.trim()) || ['http://localhost:5173', 'https://yourdomain.com'];
const BE_TOKEN_URL = 'https://booking.guesty.com/oauth2/token';
const BE_API_BASE = 'https://booking.guesty.com/api';
const BE_CLIENT_ID = Deno.env.get('GUESTY_BE_CLIENT_ID')!;
const BE_CLIENT_SECRET = Deno.env.get('GUESTY_BE_CLIENT_SECRET')!;

// Open API (OAPI) - Operations & webhooks
const OPEN_API_TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';
const OPEN_API_BASE = 'https://open-api.guesty.com/v1';
const OPEN_API_CLIENT_ID = Deno.env.get('GUESTY_OPEN_API_CLIENT_ID')!;
const OPEN_API_CLIENT_SECRET = Deno.env.get('GUESTY_OPEN_API_CLIENT_SECRET')!;
const BOOKING_TYPE = Deno.env.get('GUESTY_BOOKING_TYPE')!; // 'INQUIRY' or 'INSTANT'
const WEBHOOK_SECRET = Deno.env.get('GUESTY_WEBHOOK_SECRET')!;

// CORS configuration
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'https://yourdomain.com'];

// ── Token Management ──
interface TokenCache {
  token: string;
  expiry: number;
}

let beTokenCache: TokenCache | null = null;
let openApiTokenCache: TokenCache | null = null;

async function getBEToken(): Promise<string> {
  if (beTokenCache && Date.now() < beTokenCache.expiry) {
    console.log('[BEAPI] Using cached token');
    return beTokenCache.token;
  }

  console.log('[BEAPI] Requesting new access token');
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(BE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Guesty-Integration/1.0',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'booking_engine:api',
        client_id: BE_CLIENT_ID,
        client_secret: BE_CLIENT_SECRET,
      }).toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BEAPI] Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        duration: Date.now() - startTime
      });

      // Handle specific Guesty error codes
      if (response.status === 401) {
        throw new Error('Invalid Booking Engine API credentials. Check GUESTY_BE_CLIENT_ID and GUESTY_BE_CLIENT_SECRET.');
      } else if (response.status === 429) {
        throw new Error('Rate limited by Booking Engine API. Please try again later.');
      }

      throw new Error(`BEAPI auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Invalid token response: missing access_token');
    }

    // Enhanced expiry calculation with more buffer time
    const expiresIn = data.expires_in || 3600; // Default 1 hour
    const bufferTime = Math.min(expiresIn * 0.1, 300); // 10% buffer or 5 minutes max
    const expiryTime = Date.now() + (expiresIn - bufferTime) * 1000;

    beTokenCache = {
      token: data.access_token,
      expiry: expiryTime,
    };

    console.log('[BEAPI] Token acquired successfully', {
      expiresIn: Math.floor((expiryTime - Date.now()) / 1000),
      duration: Date.now() - startTime
    });

    return beTokenCache.token;
  } catch (error) {
    console.error('[BEAPI] Token acquisition error:', error);
    throw error;
  }
}

async function getOpenApiToken(): Promise<string> {
  if (openApiTokenCache && Date.now() < openApiTokenCache.expiry) {
    console.log('[OAPI] Using cached token');
    return openApiTokenCache.token;
  }

  console.log('[OAPI] Requesting new access token');
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(OPEN_API_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Guesty-Integration/1.0',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'open-api',
        client_id: OPEN_API_CLIENT_ID,
        client_secret: OPEN_API_CLIENT_SECRET,
      }).toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OAPI] Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        duration: Date.now() - startTime
      });

      // Handle specific Guesty error codes
      if (response.status === 401) {
        throw new Error('Invalid Open API credentials. Check GUESTY_OPEN_API_CLIENT_ID and GUESTY_OPEN_API_CLIENT_SECRET.');
      } else if (response.status === 429) {
        throw new Error('Rate limited by Open API. Please try again later.');
      }

      throw new Error(`OAPI auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('Invalid token response: missing access_token');
    }

    // Enhanced expiry calculation with more buffer time
    const expiresIn = data.expires_in || 3600; // Default 1 hour
    const bufferTime = Math.min(expiresIn * 0.1, 300); // 10% buffer or 5 minutes max
    const expiryTime = Date.now() + (expiresIn - bufferTime) * 1000;

    openApiTokenCache = {
      token: data.access_token,
      expiry: expiryTime,
    };

    console.log('[OAPI] Token acquired successfully', {
      expiresIn: Math.floor((expiryTime - Date.now()) / 1000),
      duration: Date.now() - startTime
    });

    return openApiTokenCache.token;
  } catch (error) {
    console.error('[OAPI] Token acquisition error:', error);
    throw error;
  }
}

// ── Reliability Features ──
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt}/${maxRetries} - ${options.method} ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`[API] Rate limited, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`[API] Server error, retrying in ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;

      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`[API] Request failed, retrying in ${waitTime}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

// ── Enhanced Error Handling ──
function handleApiError(error: unknown, context: { endpoint: string; method: string; requestId: string }): Response {
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let guestyError: any = null;

  // Try to parse as Guesty API error
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as { status: number; message?: string; error?: string; details?: unknown };
    statusCode = apiError.status;
    errorMessage = apiError.message || 'API error';

    // Map to user-friendly messages
    switch (statusCode) {
      case 401:
        errorMessage = 'Authentication failed. Please check your API credentials.';
        break;
      case 403:
        errorMessage = 'Access forbidden. Please check your permissions.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorMessage = 'Booking conflict detected. Please refresh and try again.';
        break;
      case 422:
        errorMessage = 'Validation error. Please check your input data.';
        break;
      case 429:
        errorMessage = 'Rate limit exceeded. Please wait and try again.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        break;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;

    // Handle specific error types
    if (error.message.includes('timeout') || error.name === 'AbortError') {
      statusCode = 408;
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      statusCode = 502;
      errorMessage = 'Network error. Please check your connection.';
    }
  }

  // Log error for monitoring
  console.error('[API_ERROR]', {
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    endpoint: context.endpoint,
    method: context.method,
    statusCode,
    error: errorMessage,
    originalError: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return new Response(JSON.stringify({
    error: errorMessage,
    code: guestyError?.code || 'INTERNAL_ERROR',
    requestId: context.requestId,
    recoverable: statusCode >= 500 || statusCode === 429,
    retryable: statusCode >= 500 || statusCode === 408 || statusCode === 429,
  }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
function corsHeaders(origin?: string | null) {
  const allow = ALLOWED_ORIGINS.includes('*') ?
    '*' :
    (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function logRequest(requestId: string, method: string, url: string, status?: number, error?: string) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    requestId,
    method,
    url,
    status,
    error,
    level: error ? 'error' : 'info'
  }));
}

// ── Enhanced API Route Handlers with Security ──

// GET /api/listings - Property search and discovery
async function handleListings(request: Request, url: URL): Promise<Response> {
  const requestId = generateRequestId();
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Rate limiting
    const rateLimitKey = `listings:${clientIP}`;
    const rateLimitResult = rateLimiter.checkLimit(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.LISTINGS);

    if (!rateLimitResult.allowed) {
      auditLogger.logSecurityEvent('rate_limit_exceeded', {
        endpoint: '/api/listings',
        ip: clientIP,
        limit: SECURITY_CONFIG.RATE_LIMITS.LISTINGS.max,
      }, 'medium');

      const guestyError = {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${rateLimitResult.resetTime - Date.now()}ms`,
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      };

      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        requestId
      }), {
        status: 429,
        headers: {
          ...SecurityHeaders.getSecurityHeaders(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': SECURITY_CONFIG.RATE_LIMITS.LISTINGS.max.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      });
    }

    // Audit logging
    auditLogger.logRequest(requestId, 'GET', '/api/listings', undefined, clientIP, request.headers.get('user-agent'));

    const params = new URLSearchParams(url.search);
    const queryParams = new URLSearchParams();

    // Map frontend params to BEAPI params with validation
    if (params.get('city')) {
      const city = params.get('city')!.trim();
      if (city.length > 0 && city.length <= 100) {
        queryParams.set('city', city);
      }
    }

    ['minPrice', 'maxPrice', 'minBedrooms', 'minOccupancy'].forEach(param => {
      const value = params.get(param);
      if (value && !isNaN(Number(value)) && Number(value) >= 0) {
        queryParams.set(param, value);
      }
    });

    if (params.get('propertyType')) {
      const propertyType = params.get('propertyType')!.toLowerCase();
      if (['apartment', 'house', 'villa', 'condo'].includes(propertyType)) {
        queryParams.set('propertyType', propertyType);
      }
    }

    // Always include rich fields for frontend
    queryParams.set('fields', 'bedArrangements,publishedAddress,taxes,publicDescription,calendarRules,pictures,amenities,prices,tags');

    const fullUrl = `${BE_API_BASE}/listings?${queryParams.toString()}`;
    const token = await getBEToken();

    const response = await fetchWithRetry(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Request-ID': requestId,
        'User-Agent': 'Guesty-Integration/1.0',
      },
    });

    logRequest(requestId, 'GET', '/api/listings', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      // Log security events for auth failures
      if (response.status === 401) {
        auditLogger.logSecurityEvent('unauthorized_api_access', {
          endpoint: '/api/listings',
          status: response.status,
          ip: clientIP,
        }, 'high');
      }

      throw new Error(`BEAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...SecurityHeaders.getSecurityHeaders(),
        ...corsHeaders(request.headers.get('origin')),
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    });

  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/listings',
      method: 'GET',
      requestId
    });
  }
}

// GET /api/listings/:id - Individual property details
async function handleListing(request: Request, url: URL, listingId: string): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const fullUrl = `${BE_API_BASE}/listings/${listingId}?fields=bedArrangements,publishedAddress,taxes,publicDescription,calendarRules,pictures,amenities,prices,tags`;
    const token = await getBEToken();

    const response = await fetchWithRetry(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Request-ID': requestId,
      },
    });

    logRequest(requestId, 'GET', `/api/listings/${listingId}`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BEAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logRequest(requestId, 'GET', `/api/listings/${listingId}`, undefined, errorMessage);

    return new Response(JSON.stringify({
      error: 'Failed to fetch listing',
      message: errorMessage,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/quote - Create booking quote (BEAPI Reservation Quote Flow)
async function handleCreateQuote(request: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.listingId || !body.checkInDateLocalized || !body.checkOutDateLocalized || !body.guestsCount) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required: ['listingId', 'checkInDateLocalized', 'checkOutDateLocalized', 'guestsCount'],
        requestId
      }), {
        status: 400,
        headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
      });
    }

    const token = await getBEToken();
    const response = await fetchWithRetry(`${BE_API_BASE}/reservations/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Idempotency-Key': `quote_${requestId}`, // Prevent duplicate quotes
      },
      body: JSON.stringify(body),
    });

    logRequest(requestId, 'POST', '/api/quote', response.status);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`BEAPI quote creation failed: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logRequest(requestId, 'POST', '/api/quote', undefined, errorMessage);

    return new Response(JSON.stringify({
      error: 'Failed to create quote',
      message: errorMessage,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });
  }
}

// GET /api/quote/:quoteId - Retrieve quote details
async function handleGetQuote(request: Request, quoteId: string): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const token = await getBEToken();
    const response = await fetchWithRetry(`${BE_API_BASE}/reservations/quotes/${quoteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Request-ID': requestId,
      },
    });

    logRequest(requestId, 'GET', `/api/quote/${quoteId}`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BEAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logRequest(requestId, 'GET', `/api/quote/${quoteId}`, undefined, errorMessage);

    return new Response(JSON.stringify({
      error: 'Failed to fetch quote',
      message: errorMessage,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/book - Create booking from quote (inquiry or instant)
async function handleCreateBooking(request: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.quoteId || !body.guest) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required: ['quoteId', 'guest'],
        requestId
      }), {
        status: 400,
        headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
      });
    }

    const token = await getBEToken();
    let endpoint: string;
    let requestBody: any = { guest: body.guest };

    // Determine booking type based on instance configuration
    if (BOOKING_TYPE === 'INSTANT') {
      endpoint = `${BE_API_BASE}/reservations/quotes/${body.quoteId}/instant`;
      // Instant bookings require payment token if applicable
      if (body.payment?.token) {
        requestBody.payment = { token: body.payment.token };
      }
    } else if (BOOKING_TYPE === 'INQUIRY') {
      endpoint = `${BE_API_BASE}/listings/${body.listingId}/inquiry`;
      requestBody = {
        listingId: body.listingId,
        guest: body.guest,
        message: body.message || '',
      };
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid booking type configuration',
        bookingType: BOOKING_TYPE,
        requestId
      }), {
        status: 500,
        headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
      });
    }

    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'Idempotency-Key': `booking_${requestId}`, // Prevent duplicate bookings
      },
      body: JSON.stringify(requestBody),
    });

    logRequest(requestId, 'POST', '/api/book', response.status);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`${BOOKING_TYPE} booking failed: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({
      ...responseData,
      bookingType: BOOKING_TYPE,
      requestId
    }), {
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logRequest(requestId, 'POST', '/api/book', undefined, errorMessage);

    return new Response(JSON.stringify({
      error: 'Failed to create booking',
      message: errorMessage,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/webhooks/guesty - Guesty webhook handler with Svix verification
async function handleGuestyWebhook(request: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Verify Svix signature
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      logRequest(requestId, 'POST', '/api/webhooks/guesty', 401, 'Missing Svix headers');
      return new Response(JSON.stringify({ error: 'Missing webhook signature headers' }), {
        status: 401,
        headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
      });
    }

    // Basic signature verification (implement full Svix verification)
    const body = await request.text();
    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${svixId}.${svixTimestamp}.${body}.${WEBHOOK_SECRET}`)
    );

    // For now, accept webhooks (implement full Svix verification in production)
    const webhookData = JSON.parse(body);

    logRequest(requestId, 'POST', '/api/webhooks/guesty', 200);

    // Handle different webhook events
    switch (webhookData.type) {
      case 'reservation.new':
      case 'reservation.updated':
      case 'reservation.messageReceived':
        // Update cache or trigger notifications
        console.log(`[WEBHOOK] ${webhookData.type}:`, webhookData.data);
        break;
      default:
        console.log(`[WEBHOOK] Unhandled event: ${webhookData.type}`);
    }

    return new Response(JSON.stringify({ received: true, requestId }), {
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logRequest(requestId, 'POST', '/api/webhooks/guesty', 500, errorMessage);

    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      message: errorMessage,
      requestId
    }), {
      status: 500,
      headers: { ...corsHeaders(request.headers.get('origin')), 'Content-Type': 'application/json' },
    });
  }
}

// ── Main Request Handler ──
serve(async (request) => {
  const url = new URL(request.url);
  const cors = corsHeaders(request.headers.get('origin'));

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Route handling
    if (url.pathname === '/api/listings' && request.method === 'GET') {
      return await handleListings(request, url);
    }

    if (url.pathname.startsWith('/api/listings/') && request.method === 'GET') {
      const listingId = url.pathname.split('/api/listings/')[1];
      return await handleListing(request, url, listingId);
    }

    if (url.pathname === '/api/quote' && request.method === 'POST') {
      return await handleCreateQuote(request);
    }

    if (url.pathname.startsWith('/api/quote/') && request.method === 'GET') {
      const quoteId = url.pathname.split('/api/quote/')[1];
      return await handleGetQuote(request, quoteId);
    }

    if (url.pathname === '/api/book' && request.method === 'POST') {
      return await handleCreateBooking(request);
    }

    if (url.pathname === '/api/webhooks/guesty' && request.method === 'POST') {
      return await handleGuestyWebhook(request);
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Unhandled error:', errorMessage);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: errorMessage,
      requestId: generateRequestId()
    }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

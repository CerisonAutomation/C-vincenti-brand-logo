import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── CORS ──
const ALLOWED_ORIGINS = (Deno.env.get('APP_ORIGINS') || '*').split(',').map(s => s.trim());

function corsHeaders(origin?: string | null) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' :
    (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// ── Env (server-side only — no VITE_ prefix) ──
// Booking Engine API (per https://booking-api-docs.guesty.com)
const BE_TOKEN_URL = 'https://booking.guesty.com/oauth2/token';
const BE_API_BASE = 'https://booking.guesty.com/api';
const BE_CLIENT_ID = Deno.env.get('GUESTY_BE_CLIENT_ID') || '';
const BE_CLIENT_SECRET = Deno.env.get('GUESTY_BE_CLIENT_SECRET') || '';

// Open API (per https://open-api-docs.guesty.com)
const OPEN_API_TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';
const OPEN_API_BASE = 'https://open-api.guesty.com/v1';
const OPEN_API_CLIENT_ID = Deno.env.get('GUESTY_OPEN_API_CLIENT_ID') || '';
const OPEN_API_CLIENT_SECRET = Deno.env.get('GUESTY_OPEN_API_CLIENT_SECRET') || '';

// ── Token cache ──
let beToken: { token: string; expiry: number } | null = null;
let openApiToken: { token: string; expiry: number } | null = null;

async function getBEToken(): Promise<string> {
  if (beToken && Date.now() < beToken.expiry) return beToken.token;

  // Per Guesty docs: form-urlencoded, scope=booking_engine:api
  const res = await fetchWithRetry(BE_TOKEN_URL, {
    method: 'POST',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'booking_engine:api',
      client_id: BE_CLIENT_ID,
      client_secret: BE_CLIENT_SECRET,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('BE Auth failed:', res.status, text);
    throw new Error(`Guesty BE auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  beToken = { token: data.access_token, expiry: Date.now() + (data.expires_in - 120) * 1000 };
  return beToken.token;
}

async function getOpenApiToken(): Promise<string> {
  if (openApiToken && Date.now() < openApiToken.expiry) return openApiToken.token;

  const res = await fetchWithRetry(OPEN_API_TOKEN_URL, {
    method: 'POST',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'open-api',
      client_id: OPEN_API_CLIENT_ID,
      client_secret: OPEN_API_CLIENT_SECRET,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Open API Auth failed:', res.status, text);
    throw new Error(`Guesty Open API auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  openApiToken = { token: data.access_token, expiry: Date.now() + (data.expires_in - 120) * 1000 };
  return openApiToken.token;
}

// ── Retry logic ──
async function fetchWithRetry(url: string, opts: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timeout);
      if (res.status === 429 || (res.status >= 500 && i < retries - 1)) {
        const retryAfter = res.headers.get('Retry-After');
        const wait = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, i), 4000);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

// ── Uniform error envelope ──
function errorResponse(code: string, message: string, status: number, cors: Record<string, string>, details?: string, retryAfterMs?: number) {
  return new Response(JSON.stringify({ code, message, details, retryAfterMs }), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// ── Proxy helper ──
async function proxyRequest(baseUrl: string, getToken: () => Promise<string>, endpoint: string, method: string, body?: string, cors: Record<string, string> = {}): Promise<Response> {
  const token = await getToken();
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
    },
  };
  if (body && method !== 'GET') opts.body = body;

  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`[proxy] ${method} ${fullUrl}`);
  const res = await fetchWithRetry(fullUrl, opts);
  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// ── Rich listing fields ──
const LISTING_DETAIL_FIELDS = 'bedArrangements,publishedAddress,taxes,publicDescription,calendarRules,pictures,amenities,prices,tags';
const LISTING_LIST_FIELDS = 'bedArrangements,publishedAddress,taxes,pictures,amenities,prices,tags';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = req.method === 'POST' ? await req.text() : undefined;

    switch (action) {
      // ══════════════════════════════════════════════
      // BOOKING ENGINE API ENDPOINTS
      // ══════════════════════════════════════════════

      // Search listings (per BE API docs: GET /me/listings with search params)
      case 'search': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings?fields=${LISTING_LIST_FIELDS}&${params}`, 'GET', undefined, cors);
      }

      // List my listings (GET /me/listings)
      case 'listings': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings?fields=${LISTING_LIST_FIELDS}&${params}`, 'GET', undefined, cors);
      }

      // Get listing detail (GET /me/listings/:id)
      case 'listing': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing listing id', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings/${id}?fields=${LISTING_DETAIL_FIELDS}`, 'GET', undefined, cors);
      }

      // Cities
      case 'cities':
        return proxyRequest(BE_API_BASE, getBEToken, '/me/listings/cities', 'GET', undefined, cors);

      // Calendar availability (GET /me/listings/:id/calendar)
      case 'calendar': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return errorResponse('MISSING_PARAM', 'Missing calendar params', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings/${id}/calendar?from=${from}&to=${to}`, 'GET', undefined, cors);
      }

      // ── Reservation Quote Flow (per BE API docs) ──

      // Create quote (POST /reservations/quotes)
      case 'quote':
        return proxyRequest(BE_API_BASE, getBEToken, '/reservations/quotes', 'POST', body, cors);

      // Retrieve quote (GET /reservations/quotes/:quoteId)
      case 'quote-get': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/reservations/quotes/${quoteId}`, 'GET', undefined, cors);
      }

      // Apply coupon to quote (POST /reservations/quotes/:quoteId/coupons)
      case 'quote-coupon': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/reservations/quotes/${quoteId}/coupons`, 'POST', body, cors);
      }

      // Instant booking from quote (POST /reservations/quotes/:quoteId/instant)
      case 'instant-booking': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/reservations/quotes/${quoteId}/instant`, 'POST', body, cors);
      }

      // Create inquiry (POST /me/reservations/inquiry)
      case 'inquiry':
        return proxyRequest(BE_API_BASE, getBEToken, '/me/reservations/inquiry', 'POST', body, cors);

      // Reviews (GET /me/reviews)
      case 'reviews': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_API_BASE, getBEToken, `/me/reviews${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }

      // Upsell fees (GET /me/listings/:id/upsell-fees)
      case 'upsell-fees': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing id', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings/${id}/upsell-fees`, 'GET', undefined, cors);
      }

      // Payment provider (GET /me/listings/:id/payment-provider)
      case 'payment-provider': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing id', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings/${id}/payment-provider`, 'GET', undefined, cors);
      }

      // Rate plans (GET /me/listings/:id/rate-plans) - V3 Booking Flow
      case 'rate-plans': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing id', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/me/listings/${id}/rate-plans`, 'GET', undefined, cors);
      }

      // Upsell fees update in quote (POST /reservations/quotes/:quoteId/upsell-fees)
      case 'quote-upsell-fees': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/reservations/quotes/${quoteId}/upsell-fees`, 'POST', body, cors);
      }

      // Payout schedule (GET /reservations/payouts/list)
      case 'payout-schedule': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return errorResponse('MISSING_PARAM', 'Missing params', 400, cors);
        return proxyRequest(BE_API_BASE, getBEToken, `/reservations/payouts/list?listingId=${id}&checkIn=${from}&checkOut=${to}`, 'GET', undefined, cors);
      }

      // ══════════════════════════════════════════════
      // OPEN API ENDPOINTS (admin / post-booking)
      // ══════════════════════════════════════════════

      // Get reservation by ID (Open API)
      case 'open-reservation': {
        const resId = url.searchParams.get('reservationId');
        if (!resId) return errorResponse('MISSING_PARAM', 'Missing reservationId', 400, cors);
        return proxyRequest(OPEN_API_BASE, getOpenApiToken, `/reservations/${resId}`, 'GET', undefined, cors);
      }

      // Search reservations (Open API)
      case 'open-reservations': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(OPEN_API_BASE, getOpenApiToken, `/reservations${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }

      // Admin messages
      case 'admin-messages': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(OPEN_API_BASE, getOpenApiToken, `/communication/messages${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }

      // Folio balance
      case 'admin-folio': {
        const resId = url.searchParams.get('reservationId');
        if (!resId) return errorResponse('MISSING_PARAM', 'Missing reservationId', 400, cors);
        return proxyRequest(OPEN_API_BASE, getOpenApiToken, `/accounting-api/reservations/${resId}/balance`, 'GET', undefined, cors);
      }

      default:
        return errorResponse('UNKNOWN_ACTION', `Unknown action: ${action}`, 400, cors);
    }
  } catch (err) {
    console.error('Guesty proxy error:', err);
    return errorResponse('INTERNAL_ERROR', err.message || 'Internal error', 500, corsHeaders(req.headers.get('origin')));
  }
});

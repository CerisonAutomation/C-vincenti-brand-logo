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

// ── Env (no VITE_ prefix for server-side) ──
const BE_BASE = Deno.env.get('GUESTY_BE_BASE') || Deno.env.get('VITE_GUESTY_BASE_URL') || 'https://booking.guesty.com/api/v1';
const BE_CLIENT_ID = Deno.env.get('GUESTY_BE_CLIENT_ID') || Deno.env.get('VITE_GUESTY_CLIENT_ID') || '';
const BE_CLIENT_SECRET = Deno.env.get('GUESTY_BE_CLIENT_SECRET') || Deno.env.get('VITE_GUESTY_CLIENT_SECRET') || '';
const ADMIN_BASE = 'https://api.guesty.com/v1';
const ADMIN_CLIENT_ID = Deno.env.get('GUESTY_ADMIN_CLIENT_ID') || Deno.env.get('VITE_GUESTY_ADMIN_CLIENT_ID') || '';
const ADMIN_CLIENT_SECRET = Deno.env.get('GUESTY_ADMIN_CLIENT_SECRET') || Deno.env.get('VITE_GUESTY_ADMIN_CLIENT_SECRET') || '';

// ── Token cache ──
let beToken: { token: string; expiry: number } | null = null;
let adminToken: { token: string; expiry: number } | null = null;

async function getBEToken(): Promise<string> {
  if (beToken && Date.now() < beToken.expiry) return beToken.token;
  const res = await fetchWithRetry(`${BE_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: BE_CLIENT_ID,
      client_secret: BE_CLIENT_SECRET,
      scope: 'booking_engine',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Guesty BE auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  beToken = { token: data.access_token, expiry: Date.now() + (data.expires_in - 60) * 1000 };
  return beToken.token;
}

async function getAdminToken(): Promise<string> {
  if (adminToken && Date.now() < adminToken.expiry) return adminToken.token;
  const res = await fetchWithRetry(`${ADMIN_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: ADMIN_CLIENT_ID,
      client_secret: ADMIN_CLIENT_SECRET,
      scope: 'open_api',
    }),
  });
  if (!res.ok) throw new Error('Guesty Admin auth failed');
  const data = await res.json();
  adminToken = { token: data.access_token, expiry: Date.now() + (data.expires_in - 60) * 1000 };
  return adminToken.token;
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
        const wait = Math.min(1000 * Math.pow(2, i), 4000);
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

// ── Proxy ──
async function proxyRequest(baseUrl: string, getToken: () => Promise<string>, endpoint: string, method: string, body?: string, cors: Record<string, string> = {}): Promise<Response> {
  const token = await getToken();
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body && method !== 'GET') opts.body = body;

  const res = await fetchWithRetry(`${baseUrl}${endpoint}`, opts);
  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// ── Rich listing detail fields ──
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
      // ── Listings (max data) ──
      case 'listings': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_BASE, getBEToken, `/me/listings?fields=${LISTING_LIST_FIELDS}&${params}`, 'GET', undefined, cors);
      }
      case 'listing': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing listing id', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}?fields=${LISTING_DETAIL_FIELDS}`, 'GET', undefined, cors);
      }
      case 'cities':
        return proxyRequest(BE_BASE, getBEToken, '/me/listings/cities', 'GET', undefined, cors);

      case 'calendar': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return errorResponse('MISSING_PARAM', 'Missing calendar params', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/calendar?from=${from}&to=${to}`, 'GET', undefined, cors);
      }
      case 'quote':
        return proxyRequest(BE_BASE, getBEToken, '/reservations/quotes', 'POST', body, cors);
      case 'quote-coupon': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/reservations/quotes/${quoteId}/coupons`, 'POST', body, cors);
      }
      case 'instant-booking': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return errorResponse('MISSING_PARAM', 'Missing quoteId', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/reservations/quotes/${quoteId}/instant-booking`, 'POST', body, cors);
      }
      case 'inquiry':
        return proxyRequest(BE_BASE, getBEToken, '/me/reservations/inquiry', 'POST', body, cors);
      case 'reviews': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_BASE, getBEToken, `/me/reviews${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }
      case 'upsell-fees': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing id', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/upsell-fees`, 'GET', undefined, cors);
      }
      case 'payment-provider': {
        const id = url.searchParams.get('id');
        if (!id) return errorResponse('MISSING_PARAM', 'Missing id', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/payment-provider`, 'GET', undefined, cors);
      }
      case 'payout-schedule': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return errorResponse('MISSING_PARAM', 'Missing params', 400, cors);
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/payouts-schedule?checkin=${from}&checkout=${to}`, 'GET', undefined, cors);
      }
      // ── Admin ──
      case 'admin-reservations': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(ADMIN_BASE, getAdminToken, `/reservations${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }
      case 'admin-messages': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(ADMIN_BASE, getAdminToken, `/communication/messages${params ? `?${params}` : ''}`, 'GET', undefined, cors);
      }
      case 'admin-folio': {
        const resId = url.searchParams.get('reservationId');
        if (!resId) return errorResponse('MISSING_PARAM', 'Missing reservationId', 400, cors);
        return proxyRequest(ADMIN_BASE, getAdminToken, `/accounting-api/reservations/${resId}/balance`, 'GET', undefined, cors);
      }
      default:
        return errorResponse('UNKNOWN_ACTION', `Unknown action: ${action}`, 400, cors);
    }
  } catch (err) {
    console.error('Guesty proxy error:', err);
    return errorResponse('INTERNAL_ERROR', err.message || 'Internal error', 500, corsHeaders(req.headers.get('origin')));
  }
});

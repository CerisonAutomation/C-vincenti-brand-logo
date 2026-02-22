import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Guesty Booking Engine API
const beBaseRaw = Deno.env.get('VITE_GUESTY_BASE_URL') || '';
const BE_BASE = beBaseRaw && beBaseRaw.startsWith('http') ? beBaseRaw : 'https://booking.guesty.com/api/v1';
const BE_CLIENT_ID = Deno.env.get('VITE_GUESTY_CLIENT_ID') || '';
const BE_CLIENT_SECRET = Deno.env.get('VITE_GUESTY_CLIENT_SECRET') || '';

// Guesty Open API (admin)
const ADMIN_BASE = 'https://api.guesty.com/v1';
const ADMIN_CLIENT_ID = Deno.env.get('VITE_GUESTY_ADMIN_CLIENT_ID') || '';
const ADMIN_CLIENT_SECRET = Deno.env.get('VITE_GUESTY_ADMIN_CLIENT_SECRET') || '';

// Token cache
let beToken: { token: string; expiry: number } | null = null;
let adminToken: { token: string; expiry: number } | null = null;

async function getBEToken(): Promise<string> {
  if (beToken && Date.now() < beToken.expiry) return beToken.token;
  
  const res = await fetch(`${BE_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: BE_CLIENT_ID,
      client_secret: BE_CLIENT_SECRET,
      scope: 'booking_engine',
    }),
  });
  if (!res.ok) throw new Error('Guesty BE auth failed');
  const data = await res.json();
  beToken = { token: data.access_token, expiry: Date.now() + (data.expires_in - 60) * 1000 };
  return beToken.token;
}

async function getAdminToken(): Promise<string> {
  if (adminToken && Date.now() < adminToken.expiry) return adminToken.token;
  
  const res = await fetch(`${ADMIN_BASE}/oauth2/token`, {
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

async function proxyRequest(baseUrl: string, getToken: () => Promise<string>, endpoint: string, method: string, body?: string): Promise<Response> {
  const token = await getToken();
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body && method !== 'GET') opts.body = body;
  
  const res = await fetch(`${baseUrl}${endpoint}`, opts);
  const data = await res.text();
  
  return new Response(data, {
    status: res.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = req.method === 'POST' ? await req.text() : undefined;

    // Route based on action parameter
    switch (action) {
      // ── Booking Engine endpoints ──
      case 'listings': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_BASE, getBEToken, `/me/listings?fields=bedArrangements,publishedAddress,taxes&${params}`, 'GET');
      }
      case 'listing': {
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}`, 'GET');
      }
      case 'cities': {
        return proxyRequest(BE_BASE, getBEToken, '/me/listings/cities', 'GET');
      }
      case 'calendar': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/calendar?from=${from}&to=${to}`, 'GET');
      }
      case 'quote': {
        return proxyRequest(BE_BASE, getBEToken, '/reservations/quotes', 'POST', body);
      }
      case 'quote-coupon': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return new Response(JSON.stringify({ error: 'Missing quoteId' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/reservations/quotes/${quoteId}/coupons`, 'POST', body);
      }
      case 'instant-booking': {
        const quoteId = url.searchParams.get('quoteId');
        if (!quoteId) return new Response(JSON.stringify({ error: 'Missing quoteId' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/reservations/quotes/${quoteId}/instant-booking`, 'POST', body);
      }
      case 'inquiry': {
        return proxyRequest(BE_BASE, getBEToken, '/me/reservations/inquiry', 'POST', body);
      }
      case 'reviews': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(BE_BASE, getBEToken, `/me/reviews${params ? `?${params}` : ''}`, 'GET');
      }
      case 'upsell-fees': {
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/upsell-fees`, 'GET');
      }
      case 'payment-provider': {
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/payment-provider`, 'GET');
      }
      case 'payout-schedule': {
        const id = url.searchParams.get('id');
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        if (!id || !from || !to) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: corsHeaders });
        return proxyRequest(BE_BASE, getBEToken, `/me/listings/${id}/payouts-schedule?checkin=${from}&checkout=${to}`, 'GET');
      }

      // ── Admin endpoints ──
      case 'admin-reservations': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(ADMIN_BASE, getAdminToken, `/reservations${params ? `?${params}` : ''}`, 'GET');
      }
      case 'admin-messages': {
        const params = url.searchParams.get('params') || '';
        return proxyRequest(ADMIN_BASE, getAdminToken, `/communication/messages${params ? `?${params}` : ''}`, 'GET');
      }
      case 'admin-folio': {
        const resId = url.searchParams.get('reservationId');
        if (!resId) return new Response(JSON.stringify({ error: 'Missing reservationId' }), { status: 400, headers: corsHeaders });
        return proxyRequest(ADMIN_BASE, getAdminToken, `/accounting-api/reservations/${resId}/balance`, 'GET');
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    console.error('Guesty proxy error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

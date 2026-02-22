import type {
  AdminListing, AdminReservation, InboxMessage, Folio, JournalEntry
} from './types';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/guesty-proxy`;

async function request<T>(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  const url = new URL(FN_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const opts: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
  };
  if (body && method === 'POST') opts.body = JSON.stringify(body);

  const res = await fetch(url.toString(), opts);
  if (!res.ok) throw new Error(`Admin API Error: ${res.statusText}`);
  return res.json() as Promise<T>;
}

class GuestyAdminClient {
  async getGlobalReservations(params: any = {}): Promise<AdminReservation[]> {
    const qp = new URLSearchParams(params).toString();
    return request<AdminReservation[]>({ action: 'admin-reservations', params: qp });
  }

  async getMessages(params: any = {}): Promise<InboxMessage[]> {
    const qp = new URLSearchParams(params).toString();
    return request<InboxMessage[]>({ action: 'admin-messages', params: qp });
  }

  async getFolioBalance(reservationId: string): Promise<Folio> {
    return request<Folio>({ action: 'admin-folio', reservationId });
  }

  async getJournalEntries(params: any = {}): Promise<JournalEntry[]> {
    const qp = new URLSearchParams(params).toString();
    return request<JournalEntry[]>({ action: 'admin-journal', params: qp });
  }
}

export const guestyAdminClient = new GuestyAdminClient();

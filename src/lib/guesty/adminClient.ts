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
    return request<AdminReservation[]>({ action: 'open-reservations', params: qp });
  }

  async getReservation(reservationId: string): Promise<any> {
    return request<any>({ action: 'open-reservation', reservationId });
  }

  async getMessages(params: any = {}): Promise<InboxMessage[]> {
    const qp = new URLSearchParams(params).toString();
    return request<InboxMessage[]>({ action: 'admin-messages', params: qp });
  }

  async getFolioBalance(reservationId: string): Promise<Folio> {
    return request<Folio>({ action: 'admin-folio', reservationId });
  }

  async getListings(): Promise<AdminListing[]> {
    return request<AdminListing[]>({ action: 'listings' });
  }

  async confirmReservation(reservationId: string): Promise<any> {
    return request<any>({ action: 'confirm-reservation', reservationId }, 'POST');
  }

  async rejectReservation(reservationId: string): Promise<any> {
    return request<any>({ action: 'reject-reservation', reservationId }, 'POST');
  }

  async sendMessage(reservationId: string, message: string): Promise<any> {
    return request<any>({ action: 'send-message', reservationId }, 'POST', { message });
  }
}

export const guestyAdminClient = new GuestyAdminClient();

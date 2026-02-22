import type {
  AdminListing, AdminReservation, InboxMessage, Folio, JournalEntry, GuestyWebhook, WebhookEvent
} from './types';

const ADMIN_BASE_URL = 'https://api.guesty.com/v1';
const CLIENT_ID = import.meta.env.VITE_GUESTY_ADMIN_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GUESTY_ADMIN_CLIENT_SECRET;

class GuestyAdminClient {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${ADMIN_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'open_api',
      }),
    });

    if (!response.ok) throw new Error('Failed to authenticate with Guesty Admin API');

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`${ADMIN_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Admin API Error: ${response.statusText}`);
    return (await response.json()) as T;
  }

  async updateListing(id: string, update: Partial<AdminListing>): Promise<AdminListing> {
    return this.request<AdminListing>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async getGlobalReservations(params: any = {}): Promise<AdminReservation[]> {
    const query = new URLSearchParams(params).toString();
    return this.request<AdminReservation[]>(`/reservations?${query}`);
  }

  async getMessages(params: any = {}): Promise<InboxMessage[]> {
    const query = new URLSearchParams(params).toString();
    return this.request<InboxMessage[]>(`/communication/messages?${query}`);
  }

  async getFolioBalance(reservationId: string): Promise<Folio> {
    return this.request<Folio>(`/accounting-api/reservations/${reservationId}/balance`);
  }

  async getJournalEntries(params: any = {}): Promise<JournalEntry[]> {
    const query = new URLSearchParams(params).toString();
    return this.request<JournalEntry[]>(`/accounting/journal-entries?${query}`);
  }

  async getWebhooks(): Promise<GuestyWebhook[]> {
    return this.request<GuestyWebhook[]>('/webhooks');
  }

  async createWebhook(url: string, events: WebhookEvent[]): Promise<GuestyWebhook> {
    return this.request<GuestyWebhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    });
  }
}

export const guestyAdminClient = new GuestyAdminClient();

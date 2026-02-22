/**
 * Content API — single source of truth for CMS-driven content.
 * All pages load content through these hooks. No inline arrays or hardcoded copy.
 * Content files live in src/content/ and are managed via Decap CMS.
 */

// ── Types ──────────────────────────────────────────────

export interface SiteSettings {
  brandName?: string;
  tagline?: string;
  subText?: string;
  email?: string;
  phone?: string;
  bookingUrl?: string;
  locale?: string;
  currency?: string;
  timezone?: string;
}

export interface PageContent {
  title?: string;
  subtitle?: string;
  description?: string;
  sections?: ContentSection[];
  cta?: { label: string; href: string };
}

export interface ContentSection {
  id?: string;
  heading?: string;
  body?: string;
  items?: ContentItem[];
}

export interface ContentItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LegalContent {
  title?: string;
  content?: string;
  cookieTable?: CookieTableEntry[];
  lastUpdated?: string;
}

export interface CookieTableEntry {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: string;
}

export interface MaltaTaxItem {
  name: string;
  rate: string;
  description: string;
  sourceUrl?: string;
}

export interface MaltaArea {
  name: string;
  description?: string;
  region?: string;
}

export interface MaltaHoliday {
  date: string;
  name: string;
}

export interface StandardBlock {
  title: string;
  description: string;
  icon?: string;
}

export interface CaseStudy {
  title: string;
  description: string;
  metrics?: Record<string, string>;
}

// ── Content loader ─────────────────────────────────────

const contentModules = import.meta.glob('/src/content/**/*.json', { eager: true });

export function getContent<T>(path: string): T | null {
  const key = `/src/content/${path}.json`;
  const mod = contentModules[key] as { default: T } | undefined;
  if (!mod) return null;
  const data = mod.default;
  if (data === null || data === undefined) return null;
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data as Record<string, unknown>).length === 0) return null;
  if (Array.isArray(data) && data.length === 0) return null;
  return data;
}

type ContentStatus = 'idle' | 'loading' | 'success' | 'error';

export function useContent<T>(path: string): { data: T | null; status: ContentStatus; error?: string } {
  const data = getContent<T>(path);
  return { data, status: 'success' };
}

// ── Convenience hooks ──────────────────────────────────

export function useSiteSettings() {
  return useContent<SiteSettings>('site');
}

export type PageKey =
  | 'home' | 'residential' | 'owners' | 'owners_estimate'
  | 'owners_standards' | 'owners_results' | 'owners_pack'
  | 'pricing' | 'about' | 'faq' | 'contact';

export function usePage(key: PageKey) {
  return useContent<PageContent>(`pages/${key}`);
}

export function useLegal(key: 'privacy' | 'cookies' | 'terms') {
  return useContent<LegalContent>(`legal/${key}`);
}

export function useMaltaTaxTable() {
  return useContent<MaltaTaxItem[]>('malta/taxes');
}

export function useAreas() {
  return useContent<MaltaArea[]>('malta/areas');
}

// ── Malta locale helpers ───────────────────────────────

export const LOCALE = 'en-MT';
export const CURRENCY = 'EUR';
export const TIMEZONE = 'Europe/Malta';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  }).format(date);
}

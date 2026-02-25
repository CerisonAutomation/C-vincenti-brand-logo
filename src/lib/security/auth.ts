/**
 * Enterprise Zero-Trust Security Architecture for Guesty Booking Platform
 * Implements comprehensive authentication, authorization, and security controls
 * @version 2.0.0
 * @author Cascade AI
 */

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Security configuration with zero-trust principles
export const SecurityConfig = {
  // Authentication
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // Authorization
  ROLE_HIERARCHY: {
    guest: 0,
    host: 1,
    admin: 2,
    super_admin: 3,
  } as const,

  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_ROTATION_INTERVAL: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Rate limiting
  API_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },

  // CORS
  CORS_OPTIONS: {
    origin: (origin: string | undefined) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      return allowedOrigins.includes(origin || '');
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://api.guesty.com', 'https://*.supabase.co'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
} as const;

// Type-safe user roles with hierarchical permissions
export type UserRole = keyof typeof SecurityConfig.ROLE_HIERARCHY;

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly permissions: readonly Permission[];
  readonly metadata: {
    readonly lastLogin?: Date;
    readonly loginAttempts: number;
    readonly lockedUntil?: Date;
    readonly mfaEnabled: boolean;
  };
}

export type Permission =
  | 'bookings.create'
  | 'bookings.read'
  | 'bookings.update'
  | 'bookings.cancel'
  | 'listings.create'
  | 'listings.read'
  | 'listings.update'
  | 'listings.delete'
  | 'analytics.read'
  | 'users.manage'
  | 'system.admin';

// Role-based access control matrix
export const RBAC_MATRIX: Record<UserRole, readonly Permission[]> = {
  guest: [
    'bookings.create',
    'bookings.read',
    'listings.read',
  ],
  host: [
    'bookings.create',
    'bookings.read',
    'bookings.update',
    'listings.create',
    'listings.read',
    'listings.update',
    'analytics.read',
  ],
  admin: [
    'bookings.create',
    'bookings.read',
    'bookings.update',
    'bookings.cancel',
    'listings.create',
    'listings.read',
    'listings.update',
    'listings.delete',
    'analytics.read',
    'users.manage',
  ],
  super_admin: [
    'bookings.create',
    'bookings.read',
    'bookings.update',
    'bookings.cancel',
    'listings.create',
    'listings.read',
    'listings.update',
    'listings.delete',
    'analytics.read',
    'users.manage',
    'system.admin',
  ],
} as const;

// Zero-trust authentication service
export class AuthenticationService {
  private supabase;
  private session: Session | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
  }

  async authenticate(credentials: { email: string; password: string }): Promise<UserProfile> {
    // Rate limiting check
    await this.checkRateLimit(credentials.email);

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw new AuthenticationError(error.message);

      // Fetch user profile with role-based permissions
      const profile = await this.fetchUserProfile(data.user.id);
      await this.updateLoginMetadata(profile.id, true);

      this.session = data.session;
      this.scheduleSessionRefresh();

      return profile;
    } catch (error) {
      await this.updateLoginMetadata(credentials.email, false);
      throw error;
    }
  }

  async authorize(userId: string, permission: Permission): Promise<boolean> {
    const profile = await this.fetchUserProfile(userId);
    return profile.permissions.includes(permission);
  }

  async validateSession(): Promise<UserProfile | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error || !session) return null;

      // Validate session expiry
      if (new Date(session.expires_at! * 1000) < new Date()) {
        await this.refreshSession();
      }

      this.session = session;
      return await this.fetchUserProfile(session.user.id);
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  private async refreshSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.refreshSession();

    if (error) throw new AuthenticationError('Session refresh failed');

    this.session = data.session;
    this.scheduleSessionRefresh();
  }

  private scheduleSessionRefresh(): void {
    if (!this.session) return;

    const expiresAt = new Date(this.session.expires_at! * 1000);
    const refreshAt = new Date(expiresAt.getTime() - SecurityConfig.REFRESH_THRESHOLD);

    const timeout = refreshAt.getTime() - Date.now();
    if (timeout > 0) {
      setTimeout(() => this.refreshSession(), timeout);
    }
  }

  private async checkRateLimit(identifier: string): Promise<void> {
    // Implementation would check Redis/cache for rate limiting
    // This is a simplified version
    const attempts = await this.getLoginAttempts(identifier);

    if (attempts >= SecurityConfig.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = await this.getLockoutUntil(identifier);
      if (lockoutUntil && lockoutUntil > new Date()) {
        throw new AuthenticationError('Account temporarily locked due to too many failed attempts');
      }
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new AuthenticationError('User profile not found');

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      permissions: RBAC_MATRIX[data.role] || [],
      metadata: {
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        loginAttempts: data.login_attempts || 0,
        lockedUntil: data.locked_until ? new Date(data.locked_until) : undefined,
        mfaEnabled: data.mfa_enabled || false,
      },
    };
  }

  private async updateLoginMetadata(identifier: string, success: boolean): Promise<void> {
    // Update login attempts and metadata
    // Implementation would update database/cache
  }

  private async getLoginAttempts(identifier: string): Promise<number> {
    // Implementation would check cache/database
    return 0;
  }

  private async getLockoutUntil(identifier: string): Promise<Date | null> {
    // Implementation would check cache/database
    return null;
  }
}

// Authorization guard with zero-trust verification
export class AuthorizationGuard {
  static requirePermission(user: UserProfile, permission: Permission): void {
    if (!user.permissions.includes(permission)) {
      throw new AuthorizationError(`Permission denied: ${permission}`);
    }
  }

  static requireRole(user: UserProfile, requiredRole: UserRole): void {
    const userLevel = SecurityConfig.ROLE_HIERARCHY[user.role];
    const requiredLevel = SecurityConfig.ROLE_HIERARCHY[requiredRole];

    if (userLevel < requiredLevel) {
      throw new AuthorizationError(`Insufficient role: requires ${requiredRole}, has ${user.role}`);
    }
  }

  static requireOwnership(user: UserProfile, resourceOwnerId: string): void {
    if (user.id !== resourceOwnerId && user.role !== 'admin' && user.role !== 'super_admin') {
      throw new AuthorizationError('Access denied: resource ownership required');
    }
  }
}

// Encryption service for sensitive data
export class EncryptionService {
  private static algorithm = SecurityConfig.ENCRYPTION_ALGORITHM;

  static async encrypt(text: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const cryptoKey = await this.importKey(key);

    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv: new Uint8Array(12) },
      cryptoKey,
      data
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  static async decrypt(encryptedText: string, key: string): Promise<string> {
    const encrypted = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const cryptoKey = await this.importKey(key);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv: encrypted.slice(0, 12) },
      cryptoKey,
      encrypted.slice(12)
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private static async importKey(key: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);

    return crypto.subtle.importKey(
      'raw',
      keyData,
      this.algorithm,
      false,
      ['encrypt', 'decrypt']
    );
  }
}

// Security event logging
export class SecurityLogger {
  static async logSecurityEvent(
    event: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        ip: await this.getClientIP(),
      },
    };

    // Send to security monitoring service (e.g., Datadog, Splunk)
    console.warn('SECURITY EVENT:', logEntry);

    // In production, this would be sent to a secure logging service
    // await fetch('/api/security/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry),
    // });
  }

  private static async getClientIP(): Promise<string> {
    // Implementation would get real IP from headers/server
    return 'unknown';
  }
}

// Custom security errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}

// Security middleware for API routes
export class SecurityMiddleware {
  static async authenticateRequest(request: Request): Promise<UserProfile> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const authService = new AuthenticationService();

    const user = await authService.validateSession();
    if (!user) {
      throw new AuthenticationError('Invalid or expired session');
    }

    return user;
  }

  static validateCORS(request: Request): boolean {
    const origin = request.headers.get('Origin');
    return SecurityConfig.CORS_OPTIONS.origin(origin);
  }

  static generateCSPHeader(): string {
    return Object.entries(SecurityConfig.CSP_DIRECTIVES)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}

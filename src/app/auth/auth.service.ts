import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

/** What we keep after a successful sign-in. */
export interface Session {
  accessToken: string;
  userId: string;
  email: string;
  /** Milliseconds since 1970 when the access token stops working. */
  expiresAt: number;
}

/** The part of Supabase's /auth/v1/token answer we use. */
interface TokenResponse {
  access_token: string;
  expires_in: number;
  user: { id: string; email: string };
}

const STORAGE_KEY = 'tursya-angular.session';

/**
 * Email + password sign-in through the Supabase Auth REST API.
 * The session lives in a signal (so the header updates by itself) and in sessionStorage
 * (so a page reload keeps you signed in until the tab is closed). No token refresh: when the
 * access token expires (1 hour), you simply sign in again. Enough for a demo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSignal = signal<Session | null>(readStoredSession());

  /** Current session, or null. Expired sessions count as signed out. */
  readonly session = computed(() => {
    const s = this.sessionSignal();
    return s && s.expiresAt > Date.now() ? s : null;
  });
  readonly isSignedIn = computed(() => this.session() !== null);

  signIn(email: string, password: string): Observable<Session> {
    return this.http
      .post<TokenResponse>(`${environment.supabaseUrl}/auth/v1/token`, { email, password }, {
        params: { grant_type: 'password' },
      })
      .pipe(
        map((r): Session => ({
          accessToken: r.access_token,
          userId: r.user.id,
          email: r.user.email,
          expiresAt: Date.now() + r.expires_in * 1000,
        })),
        tap((session) => this.store(session)),
      );
  }

  signOut(): void {
    this.store(null);
  }

  private store(session: Session | null): void {
    this.sessionSignal.set(session);
    try {
      if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be blocked (private mode); the in-memory session still works.
    }
  }
}

function readStoredSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

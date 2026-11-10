import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

/**
 * Every request to our Supabase project gets the public key ("apikey" header).
 * When someone is signed in, it also gets "Authorization: Bearer <token>", so the database
 * knows who is asking and Row Level Security applies their rights. Other requests pass unchanged.
 */
export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const toSupabase = environment.supabaseUrl !== '' && req.url.startsWith(environment.supabaseUrl);
  if (!toSupabase) return next(req);

  const headers: Record<string, string> = { apikey: environment.supabaseKey };
  const token = inject(AuthService).session()?.accessToken;
  const isSignInCall = req.url.endsWith('/auth/v1/token');
  if (token && !isSignInCall) headers['Authorization'] = `Bearer ${token}`;

  return next(req.clone({ setHeaders: headers }));
};

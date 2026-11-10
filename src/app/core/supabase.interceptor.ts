import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Adds the Supabase public key ("apikey" header) to every request that goes to our
 * Supabase project, so services do not have to repeat it. Other requests pass unchanged.
 */
export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const toSupabase = environment.supabaseUrl !== '' && req.url.startsWith(environment.supabaseUrl);
  if (!toSupabase) return next(req);
  return next(req.clone({ setHeaders: { apikey: environment.supabaseKey } }));
};

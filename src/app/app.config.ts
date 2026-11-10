import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeBg from '@angular/common/locales/bg';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { supabaseInterceptor } from './core/supabase.interceptor';

// Bulgarian dates and money format ("12 ноем.", "300 €").
registerLocaleData(localeBg);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([supabaseInterceptor])),
    { provide: LOCALE_ID, useValue: 'bg' },
  ],
};

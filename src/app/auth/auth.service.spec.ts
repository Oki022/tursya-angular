import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { supabaseInterceptor } from '../core/supabase.interceptor';
import { AuthService } from './auth.service';

const tokenAnswer = { access_token: 'jwt-123', expires_in: 3600, user: { id: 'u1', email: 'client@example.com' } };

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([supabaseInterceptor])), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function signIn() {
    auth.signIn('client@example.com', 'secret123').subscribe();
    const req = http.expectOne((r) => r.url === `${environment.supabaseUrl}/auth/v1/token`);
    return req;
  }

  it('signs in with email and password and keeps the session', () => {
    const req = signIn();
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('grant_type')).toBe('password');
    expect(req.request.body).toEqual({ email: 'client@example.com', password: 'secret123' });
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(tokenAnswer);

    expect(auth.isSignedIn()).toBe(true);
    expect(auth.session()?.email).toBe('client@example.com');
    expect(sessionStorage.getItem('tursya-angular.session')).toContain('jwt-123');
  });

  it('stays signed out when the password is wrong', () => {
    let failed = false;
    auth.signIn('client@example.com', 'wrong-pass').subscribe({ error: () => (failed = true) });
    http.expectOne((r) => r.url.endsWith('/auth/v1/token'))
      .flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });
    expect(failed).toBe(true);
    expect(auth.isSignedIn()).toBe(false);
  });

  it('sends the token with later requests, and stops after sign-out', () => {
    signIn().flush(tokenAnswer);
    const client = TestBed.inject(HttpClient);

    client.get(`${environment.supabaseUrl}/rest/v1/tasks`).subscribe();
    const withToken = http.expectOne((r) => r.url.endsWith('/rest/v1/tasks'));
    expect(withToken.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    withToken.flush([]);

    auth.signOut();
    client.get(`${environment.supabaseUrl}/rest/v1/tasks`).subscribe();
    const anonymous = http.expectOne((r) => r.url.endsWith('/rest/v1/tasks'));
    expect(anonymous.request.headers.has('Authorization')).toBe(false);
    anonymous.flush([]);
    expect(sessionStorage.getItem('tursya-angular.session')).toBeNull();
  });

  it('never sends the token to other sites', () => {
    signIn().flush(tokenAnswer);
    TestBed.inject(HttpClient).get('https://example.org/data').subscribe();
    const req = http.expectOne('https://example.org/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.headers.has('apikey')).toBe(false);
    req.flush({});
  });
});

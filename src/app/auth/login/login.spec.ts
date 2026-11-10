import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { supabaseInterceptor } from '../../core/supabase.interceptor';
import { Login, safeReturnUrl } from './login';

describe('Login page', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(withInterceptors([supabaseInterceptor])), provideHttpClientTesting()],
    }).compileComponents();
  });

  function setup(returnUrl?: string) {
    const fixture = TestBed.createComponent(Login);
    if (returnUrl) fixture.componentRef.setInput('returnUrl', returnUrl);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const input = el.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    };
    const submit = async () => {
      (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, el, type, submit, http: TestBed.inject(HttpTestingController) };
  }

  it('does not call the server when the email is not valid', async () => {
    const { el, type, submit, http, fixture } = setup();
    type('#email', 'not-an-email');
    type('#password', 'secret123');
    await submit();
    fixture.detectChanges();
    expect(el.querySelector('.field-error')?.textContent).toContain('не е валиден');
    http.expectNone((r) => r.url.endsWith('/auth/v1/token'));
  });

  it('shows "wrong email or password" on 400', async () => {
    const { el, type, submit, http, fixture } = setup();
    type('#email', 'client@example.com');
    type('#password', 'wrong-pass');
    await submit();
    http.expectOne((r) => r.url.endsWith('/auth/v1/token'))
      .flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Грешен имейл или парола');
  });

  it('goes to the return address after signing in, but never to another site', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const ok = setup('/task/123');
    ok.type('#email', 'client@example.com');
    ok.type('#password', 'secret123');
    await ok.submit();
    ok.http.expectOne((r) => r.url.endsWith('/auth/v1/token'))
      .flush({ access_token: 't', expires_in: 3600, user: { id: 'u1', email: 'client@example.com' } });
    expect(navigate).toHaveBeenLastCalledWith('/task/123');

    const evil = setup('//evil.example');
    evil.type('#email', 'client@example.com');
    evil.type('#password', 'secret123');
    await evil.submit();
    evil.http.expectOne((r) => r.url.endsWith('/auth/v1/token'))
      .flush({ access_token: 't', expires_in: 3600, user: { id: 'u1', email: 'client@example.com' } });
    expect(navigate).toHaveBeenLastCalledWith('/');
  });

  it('goes home when the address has no return path', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = setup();
    page.fixture.componentRef.setInput('returnUrl', undefined); // what the router does without ?returnUrl=
    page.type('#email', 'client@example.com');
    page.type('#password', 'secret123');
    await page.submit();
    page.http.expectOne((r) => r.url.endsWith('/auth/v1/token'))
      .flush({ access_token: 't', expires_in: 3600, user: { id: 'u1', email: 'client@example.com' } });
    expect(navigate).toHaveBeenLastCalledWith('/');
  });

  it('accepts only paths inside the app as return address', () => {
    expect(safeReturnUrl('/task/1')).toBe('/task/1');
    expect(safeReturnUrl(undefined)).toBe('/');
    expect(safeReturnUrl('https://evil.example')).toBe('/');
    expect(safeReturnUrl('//evil.example')).toBe('/');
    expect(safeReturnUrl('/\\evil.example')).toBe('/');
  });
});

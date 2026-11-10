import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { signedInGuard } from './signed-in.guard';

describe('signedInGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      signedInGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
  });

  it('sends a signed-out visitor to /login and remembers where they wanted to go', () => {
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('lets a signed-in user through', () => {
    sessionStorage.setItem(
      'tursya-angular.session',
      JSON.stringify({ accessToken: 't', userId: 'u1', email: 'a@b.c', expiresAt: Date.now() + 60_000 }),
    );
    expect(run()).toBe(true);
  });

  it('treats an expired session as signed out', () => {
    sessionStorage.setItem(
      'tursya-angular.session',
      JSON.stringify({ accessToken: 't', userId: 'u1', email: 'a@b.c', expiresAt: Date.now() - 1 }),
    );
    expect(run()).toBeInstanceOf(UrlTree);
  });
});

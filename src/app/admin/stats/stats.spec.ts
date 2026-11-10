import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminStats } from './stats';

const stats = {
  total_users: 120, new_users_7d: 4, total_tasks: 30, active_tasks: 12, tasks_7d: 3,
  unlocks_total: 50, revenue_total: 245.5, revenue_30d: 40, moderation_pending: 2, pending_reports: 1,
};

describe('AdminStats page', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStats],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(AdminStats);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    // Both requests leave at the same time (forkJoin), before any answer arrives.
    const statsReq = http.expectOne((r) => r.url.endsWith('/rpc/admin_dashboard_stats'));
    const monthsReq = http.expectOne((r) => r.url.endsWith('/rpc/admin_revenue_months'));
    return { fixture, statsReq, monthsReq, el: fixture.nativeElement as HTMLElement };
  }

  it('shows the numbers and the months for staff', async () => {
    const { fixture, statsReq, monthsReq, el } = render();
    expect(monthsReq.request.body).toEqual({ _months: 6 });
    statsReq.flush(stats);
    monthsReq.flush([{ month: '2026-10-01', sales_count: 5, net_eur: 40 }]);
    await fixture.whenStable();
    expect(el.querySelector('[data-testid=stats-grid]')?.textContent).toContain('120');
    expect(el.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('says "no access" when the database refuses (FORBIDDEN)', async () => {
    const { fixture, statsReq, monthsReq, el } = render();
    statsReq.flush({ code: 'P0001', message: 'FORBIDDEN' }, { status: 400, statusText: 'Bad Request' });
    expect(monthsReq.cancelled).toBe(true); // forkJoin stops the other request
    await fixture.whenStable();
    expect(el.querySelector('[data-testid=forbidden]')).not.toBeNull();
  });

  it('shows a general error for other failures', async () => {
    const { fixture, statsReq, el } = render();
    statsReq.flush('down', { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    expect(el.querySelector('.error')?.textContent).toContain('не можаха да се заредят');
  });
});

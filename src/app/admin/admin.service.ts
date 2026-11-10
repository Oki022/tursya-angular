import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

/** A few of the numbers public.admin_dashboard_stats() returns. */
export interface DashboardStats {
  total_users: number;
  new_users_7d: number;
  total_tasks: number;
  active_tasks: number;
  tasks_7d: number;
  unlocks_total: number;
  revenue_total: number;
  revenue_30d: number;
  moderation_pending: number;
  pending_reports: number;
}

/** One row of public.admin_revenue_months(). */
export interface RevenueMonth {
  month: string;
  sales_count: number;
  net_eur: number;
}

export interface AdminOverview {
  stats: DashboardStats;
  months: RevenueMonth[];
}

/**
 * Calls the admin-only database functions (Supabase RPC). Both check on the server that the
 * caller is staff and refuse everyone else, so the data is safe even without the route guard.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly rpc = `${environment.supabaseUrl}/rest/v1/rpc`;

  /** Both requests run at the same time (forkJoin) and arrive together. */
  overview(months = 6): Observable<AdminOverview> {
    return forkJoin({
      stats: this.http.post<DashboardStats>(`${this.rpc}/admin_dashboard_stats`, {}),
      months: this.http.post<RevenueMonth[]>(`${this.rpc}/admin_revenue_months`, { _months: months }),
    });
  }
}

/** True when the server said "you are not staff" (403, or a FORBIDDEN error from the function). */
export function isForbidden(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) return false;
  return error.status === 401 || error.status === 403 || JSON.stringify(error.error ?? '').includes('FORBIDDEN');
}

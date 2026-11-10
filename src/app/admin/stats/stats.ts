import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { AdminOverview, AdminService, isForbidden } from '../admin.service';

type StatsState =
  | { status: 'loading' }
  | { status: 'forbidden' }
  | { status: 'error' }
  | { status: 'ready'; data: AdminOverview };

/** Page "/admin": a few platform numbers, only for staff. */
@Component({
  selector: 'app-admin-stats',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class AdminStats {
  protected readonly state = toSignal(
    inject(AdminService)
      .overview()
      .pipe(
        map((data): StatsState => ({ status: 'ready', data })),
        catchError((e) => of<StatsState>(isForbidden(e) ? { status: 'forbidden' } : { status: 'error' })),
        startWith<StatsState>({ status: 'loading' }),
      ),
    { initialValue: { status: 'loading' } as StatsState },
  );
}

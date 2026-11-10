import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { CategoryNamePipe } from '../category-name.pipe';
import { CATEGORIES, Task } from '../task.model';
import { TasksService } from '../tasks.service';

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; tasks: Task[] };

/** Page "/" : the newest active tasks with a category filter. */
@Component({
  selector: 'app-task-list',
  imports: [CategoryNamePipe, CurrencyPipe, DatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private readonly tasksService = inject(TasksService);

  protected readonly categories = Object.entries(CATEGORIES);

  /** The selected category ('' = all). Changing it reloads the list. */
  protected readonly category = signal('');

  /**
   * category (signal) → observable → HTTP request → back to a signal for the template.
   * switchMap cancels the previous request when the filter changes quickly.
   */
  protected readonly state = toSignal(
    toObservable(this.category).pipe(
      switchMap((category) =>
        this.tasksService.listActive(category).pipe(
          map((tasks): ListState => ({ status: 'ready', tasks })),
          catchError(() => of<ListState>({ status: 'error' })),
          startWith<ListState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as ListState },
  );

  protected onCategoryChange(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }
}

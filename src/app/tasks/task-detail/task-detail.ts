import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { CategoryNamePipe } from '../category-name.pipe';
import { TaskDetail as TaskDetailModel } from '../task.model';
import { TasksService } from '../tasks.service';

type DetailState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'ready'; task: TaskDetailModel };

/** Page "/task/:id": one task with its full description. */
@Component({
  selector: 'app-task-detail',
  imports: [RouterLink, CategoryNamePipe, CurrencyPipe, DatePipe],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail {
  private readonly tasksService = inject(TasksService);

  /** Filled by the router from the URL (":id"), thanks to withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.tasksService.getById(id).pipe(
          map((task): DetailState => (task ? { status: 'ready', task } : { status: 'not-found' })),
          catchError(() => of<DetailState>({ status: 'error' })),
          startWith<DetailState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as DetailState },
  );
}

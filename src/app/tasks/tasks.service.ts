import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskDetail, UUID_PATTERN } from './task.model';

/** Reads tasks through the Supabase REST API (PostgREST). */
@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.supabaseUrl}/rest/v1/tasks`;

  /**
   * Newest active tasks, optionally only one category.
   * Row Level Security on the server already hides anything that is not public;
   * the status filter just makes the intent explicit.
   */
  listActive(category = '', limit = 30): Observable<Task[]> {
    let params = new HttpParams()
      .set('select', 'id,title,category,city,budget,created_at')
      .set('status', 'eq.active')
      .set('order', 'bumped_at.desc')
      .set('limit', limit);
    if (category) params = params.set('category', `eq.${category}`);
    return this.http.get<Task[]>(this.url, { params });
  }

  /**
   * One task with its description, or null when it does not exist or is not public
   * (Row Level Security returns an empty list then, not an error).
   * An id that is not a UUID is answered with null without asking the server.
   */
  getById(id: string): Observable<TaskDetail | null> {
    if (!UUID_PATTERN.test(id)) return of(null);
    const params = new HttpParams()
      .set('select', 'id,title,description,category,city,neighborhood,budget,created_at')
      .set('id', `eq.${id}`)
      .set('limit', 1);
    return this.http.get<TaskDetail[]>(this.url, { params }).pipe(map((rows) => rows[0] ?? null));
  }
}

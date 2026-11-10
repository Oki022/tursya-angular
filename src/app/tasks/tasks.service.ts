import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from './task.model';

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
}

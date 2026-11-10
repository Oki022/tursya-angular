import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { supabaseInterceptor } from '../core/supabase.interceptor';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([supabaseInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // no unexpected requests

  it('asks only for active tasks, newest first, and sends the public key', () => {
    let result: unknown;
    service.listActive().subscribe((tasks) => (result = tasks));

    const req = http.expectOne((r) => r.url === `${environment.supabaseUrl}/rest/v1/tasks`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('status')).toBe('eq.active');
    expect(req.request.params.get('order')).toBe('bumped_at.desc');
    expect(req.request.params.has('category')).toBe(false);
    expect(req.request.headers.get('apikey')).toBe(environment.supabaseKey);

    req.flush([{ id: '1', title: 'Почистване на апартамент', category: 'pochistvane', city: 'София', budget: 80, created_at: '2026-11-10T10:00:00Z' }]);
    expect(result).toHaveLength(1);
  });

  it('filters by category when one is chosen', () => {
    service.listActive('avto').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/rest/v1/tasks'));
    expect(req.request.params.get('category')).toBe('eq.avto');
    req.flush([]);
  });
});

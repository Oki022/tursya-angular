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

  it('reads one task by id and returns it', () => {
    const id = '11111111-2222-3333-4444-555555555555';
    let result: unknown = 'not called';
    service.getById(id).subscribe((task) => (result = task));

    const req = http.expectOne((r) => r.url.endsWith('/rest/v1/tasks'));
    expect(req.request.params.get('id')).toBe(`eq.${id}`);
    expect(req.request.params.get('select')).toContain('description');
    req.flush([{ id, title: 'Смяна на гуми', description: 'Четири гуми.', category: 'avto', city: 'Шумен', neighborhood: null, budget: 40, created_at: '2026-11-10T10:00:00Z' }]);
    expect(result).toMatchObject({ id, title: 'Смяна на гуми' });
  });

  it('returns null when the server finds nothing (hidden by RLS or deleted)', () => {
    let result: unknown = 'not called';
    service.getById('11111111-2222-3333-4444-555555555555').subscribe((task) => (result = task));
    http.expectOne((r) => r.url.endsWith('/rest/v1/tasks')).flush([]);
    expect(result).toBeNull();
  });

  it('does not call the server for an id that is not a UUID', () => {
    let result: unknown = 'not called';
    service.getById('abc').subscribe((task) => (result = task));
    http.expectNone((r) => r.url.endsWith('/rest/v1/tasks'));
    expect(result).toBeNull();
  });
});

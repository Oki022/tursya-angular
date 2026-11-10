import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskDetail } from './task-detail';

describe('TaskDetail page', () => {
  const id = '11111111-2222-3333-4444-555555555555';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  function render(taskId: string) {
    const fixture = TestBed.createComponent(TaskDetail);
    fixture.componentRef.setInput('id', taskId); // what the router does from the URL
    fixture.detectChanges();
    return fixture;
  }

  it('shows the task with its description and price', async () => {
    const fixture = render(id);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/rest/v1/tasks'))
      .flush([{ id, title: 'Боядисване на стая', description: 'Стая 20 кв.м.', category: 'remonti', city: 'Варна', neighborhood: 'Център', budget: 300, created_at: '2026-11-10T10:00:00Z' }]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Боядисване на стая');
    expect(el.querySelector('.description')?.textContent).toContain('Стая 20 кв.м.');
    expect(el.querySelector('.meta')?.textContent).toContain('Ремонти');
    expect(el.querySelector('.price')?.textContent).toContain('300');
  });

  it('says "not found" for an unknown task', async () => {
    const fixture = render(id);
    TestBed.inject(HttpTestingController).expectOne((r) => r.url.endsWith('/rest/v1/tasks')).flush([]);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('не е намерена');
  });

  it('says "not found" for a broken link without calling the server', async () => {
    const fixture = render('not-a-uuid');
    TestBed.inject(HttpTestingController).expectNone((r) => r.url.endsWith('/rest/v1/tasks'));
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('не е намерена');
  });
});

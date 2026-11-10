import { Page } from '@playwright/test';

export const TASKS = [
  {
    id: '11111111-2222-3333-4444-555555555551',
    title: '[demo] Почистване на апартамент 60 кв.м',
    description: 'Основно почистване на апартамент след ремонт, включително прозорци и баня.',
    category: 'pochistvane', city: 'София', neighborhood: 'Лозенец', budget: 80, created_at: '2026-11-10T10:00:00Z',
  },
  {
    id: '11111111-2222-3333-4444-555555555552',
    title: '[demo] Смяна на гуми',
    description: 'Сезонна смяна на четири гуми с баланс.',
    category: 'avto', city: 'Шумен', neighborhood: null, budget: 40, created_at: '2026-11-09T10:00:00Z',
  },
];

export const PASSWORD = 'correct-password';
export const ADMIN_EMAIL = 'admin@example.com';

/**
 * Answers every Supabase call the app makes, like the real API would:
 * - tasks list / one task (filters "category" and "id" are applied),
 * - sign-in: 400 for a wrong password,
 * - admin functions: only for ADMIN_EMAIL, everyone else gets FORBIDDEN.
 * Returns the list of requested URLs so tests can check what the app asked for.
 */
export async function mockSupabase(page: Page): Promise<string[]> {
  const requests: string[] = [];
  let signedInEmail = '';

  await page.route('**/rest/v1/tasks**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname + url.search);
    const category = url.searchParams.get('category');
    const id = url.searchParams.get('id');
    const rows = TASKS.filter((t) => (!category || `eq.${t.category}` === category) && (!id || `eq.${t.id}` === id));
    await route.fulfill({ json: rows });
  });

  await page.route('**/auth/v1/token**', async (route) => {
    const { email, password } = route.request().postDataJSON() as { email: string; password: string };
    if (password !== PASSWORD) {
      await route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } });
      return;
    }
    signedInEmail = email;
    await route.fulfill({ json: { access_token: `token-for-${email}`, expires_in: 3600, user: { id: 'u1', email } } });
  });

  await page.route('**/rest/v1/rpc/admin_**', async (route) => {
    const auth = route.request().headers()['authorization'] ?? '';
    const isAdmin = signedInEmail === ADMIN_EMAIL && auth === `Bearer token-for-${ADMIN_EMAIL}`;
    if (!isAdmin) {
      await route.fulfill({ status: 400, json: { code: 'P0001', message: 'FORBIDDEN' } });
      return;
    }
    if (route.request().url().endsWith('admin_dashboard_stats')) {
      await route.fulfill({
        json: {
          total_users: 128, new_users_7d: 4, total_tasks: 31, active_tasks: 12, tasks_7d: 3,
          unlocks_total: 57, revenue_total: 245.5, revenue_30d: 40, moderation_pending: 2, pending_reports: 1,
        },
      });
    } else {
      await route.fulfill({ json: [{ month: '2026-10-01', sales_count: 5, net_eur: 40 }] });
    }
  });

  return requests;
}

export async function signIn(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.getByLabel('Имейл').fill(email);
  await page.getByLabel('Парола').fill(password);
  await page.getByRole('button', { name: 'Влез' }).click();
}

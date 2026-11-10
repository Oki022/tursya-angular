import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, TASKS, mockSupabase, signIn } from './mock-api';

test.describe('tasks', () => {
  test('lists active tasks and opens one', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');

    const cards = page.getByTestId('task-card');
    await expect(cards).toHaveCount(TASKS.length);

    await cards.filter({ hasText: 'Смяна на гуми' }).click();
    await expect(page).toHaveURL(`/task/${TASKS[1].id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(TASKS[1].title);
    await expect(page.getByText('Сезонна смяна на четири гуми')).toBeVisible();

    await page.getByRole('link', { name: '← Всички задачи' }).click();
    await expect(page).toHaveURL('/');
  });

  test('category filter asks the server only for that category', async ({ page }) => {
    const requests = await mockSupabase(page);
    await page.goto('/');
    await page.getByLabel('Категория').selectOption('avto');

    await expect(page.getByTestId('task-card')).toHaveCount(1);
    await expect(page.getByTestId('task-card')).toContainText('Смяна на гуми');
    expect(requests.at(-1)).toContain('category=eq.avto');
  });

  test('a broken or unknown task link shows "not found"', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/task/not-a-real-id');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Задачата не е намерена');
  });
});

test.describe('sign-in and admin page', () => {
  test('wrong password shows an error, the right one signs in', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/login');

    await signIn(page, 'client@example.com', 'wrong-password');
    await expect(page.getByRole('alert')).toHaveText('Грешен имейл или парола.');

    await signIn(page, 'client@example.com');
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('signed-in-as')).toHaveText('client@example.com');
  });

  test('admin page: login first, no access for a normal user, numbers for staff', async ({ page }) => {
    await mockSupabase(page);

    await page.goto('/admin');
    await expect(page).toHaveURL('/login?returnUrl=%2Fadmin');

    await signIn(page, 'client@example.com');
    await expect(page).toHaveURL('/admin');
    await expect(page.getByTestId('forbidden')).toBeVisible();

    await page.getByRole('button', { name: 'Изход' }).click();
    await page.goto('/login?returnUrl=%2Fadmin');
    await signIn(page, ADMIN_EMAIL);
    await expect(page.getByTestId('stats-grid')).toContainText('128');
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('sign-out clears the session, also after a reload', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/login');
    await signIn(page, 'client@example.com');
    await page.reload();
    await expect(page.getByTestId('signed-in-as')).toBeVisible();

    await page.getByRole('button', { name: 'Изход' }).click();
    await page.reload();
    await expect(page.getByRole('link', { name: 'Вход' })).toBeVisible();
  });
});

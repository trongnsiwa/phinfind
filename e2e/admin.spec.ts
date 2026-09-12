import { test, expect, hasSupabaseCredentials } from './fixtures/test-helpers';

test.describe('Admin Route Access & Moderation', () => {
  test('unauthorized guest user is redirected away from /admin', async ({ page }) => {
    await page.goto('/admin');

    // Guest has no session, so either client redirects to home or toast appears
    await page.waitForURL('/', { timeout: 10000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('admin dashboard interface elements when authorized', async ({ page }) => {
    test.skip(!hasSupabaseCredentials || !process.env.SUPABASE_TEST_ADMIN_EMAIL, 'Admin credentials not provided');

    await page.goto('/login');
    await page.locator('#email').fill(process.env.SUPABASE_TEST_ADMIN_EMAIL!);
    await page.locator('#password').fill(process.env.SUPABASE_TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    await page.goto('/admin');
    await expect(page.getByText('Quản Trị Hệ Thống')).toBeVisible();
    await expect(page.getByRole('tab', { name: /chờ duyệt/i })).toBeVisible();
  });
});

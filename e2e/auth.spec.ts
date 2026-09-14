import {
  test,
  expect,
  hasSupabaseCredentials,
  createTestUser,
  deleteTestUser,
  assertNoHorizontalScroll,
  assertTapTarget,
} from './fixtures/test-helpers';

test.describe('Authentication Flow', () => {
  test('login page renders inputs, buttons, and navigation links', async ({ page }) => {
    await page.goto('/login');
    await assertNoHorizontalScroll(page);

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    const loginBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    await expect(loginBtn).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      await assertTapTarget(loginBtn, 44);
    }

    const googleBtn = page.getByRole('button', { name: /đăng nhập bằng google/i });
    await expect(googleBtn).toBeVisible();
    if (viewport && viewport.width < 768) {
      await assertTapTarget(googleBtn, 44);
    }

    const forgotLink = page.getByRole('link', { name: /quên mật khẩu/i });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password');

    const signupLink = page.getByRole('link', { name: /tạo tài khoản/i });
    await expect(signupLink).toBeVisible();
  });

  test('signup page renders required fields and validation', async ({ page }) => {
    await page.goto('/signup');
    await assertNoHorizontalScroll(page);

    await expect(page.locator('#fullname')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /tạo tài khoản/i });
    await expect(submitBtn).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      await assertTapTarget(submitBtn, 44);
    }

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('minlength', '8');

    const loginLink = page.getByRole('link', { name: 'Đăng nhập', exact: true });
    await expect(loginLink).toBeVisible();
  });

  test('forgot password flow presents email input and confirmation view', async ({ page }) => {
    await page.goto('/forgot-password');
    await assertNoHorizontalScroll(page);

    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();

    await emailInput.fill('user@example.com');
    await page.getByRole('button', { name: /gửi liên kết đặt lại/i }).click();

    // After submit, confirmation screen appears regardless of account existence
    await expect(page.getByText('Kiểm tra email của bạn')).toBeVisible({ timeout: 10000 });
  });

  test('live authentication flow (signup, login, signout)', async ({ page }) => {
    test.skip(!hasSupabaseCredentials, 'Skipping live auth test: Supabase test credentials not configured');

    const testUser = await createTestUser('e2e-auth');
    test.skip(!testUser, 'Failed to create temporary test user');

    try {
      await page.goto('/login');
      await page.locator('#email').fill(testUser!.email);
      await page.locator('#password').fill(testUser!.password);
      await page.getByRole('button', { name: /đăng nhập/i }).click();

      // Successful login redirects to home / discover
      await page.waitForURL('/', { timeout: 10000 });
      expect(page.url()).toContain('/');

      // Open profile dropdown and sign out
      const userMenuTrigger = page.locator('button[aria-label*="Menu người dùng"]');
      if (await userMenuTrigger.isVisible()) {
        await userMenuTrigger.click();
        const signOutBtn = page.getByRole('menuitem', { name: /đăng xuất/i });
        await signOutBtn.click();
        await page.waitForURL(/login/, { timeout: 10000 });
      }
    } finally {
      if (testUser) {
        await deleteTestUser(testUser.id);
      }
    }
  });
});

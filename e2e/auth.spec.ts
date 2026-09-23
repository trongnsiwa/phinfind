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

  test('public profile page renders updated social links with correct attributes', async ({ page }) => {
    const mockUsername = 'testuser_social';
    await page.route(`**/api/user/public-profile?username=${mockUsername}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'mock-user-123',
            username: mockUsername,
            full_name: 'Test Coffee Enthusiast',
            avatar_url: null,
            bio: 'Lover of Vietnamese Phin coffee.',
            facebook_url: 'https://facebook.com/testcoffee',
            instagram_url: null,
            tiktok_url: null,
            website_url: 'https://testcoffee.dev',
            created_at: new Date().toISOString(),
          },
          reviews: [],
        }),
      });
    });

    await page.goto(`/u/${mockUsername}`);
    await assertNoHorizontalScroll(page);

    const facebookLink = page.getByRole('link', { name: /mở facebook của test coffee enthusiast/i });
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/testcoffee');
    await expect(facebookLink).toHaveAttribute('target', '_blank');
    await expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');

    const websiteLink = page.getByRole('link', { name: /mở website của test coffee enthusiast/i });
    await expect(websiteLink).toBeVisible();
    await expect(websiteLink).toHaveAttribute('href', 'https://testcoffee.dev');
    await expect(websiteLink).toHaveAttribute('target', '_blank');
    await expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');

    const socialLinks = page.locator(
      'a[aria-label*="Mở Facebook"], a[aria-label*="Mở Instagram"], a[aria-label*="Mở TikTok"], a[aria-label*="Mở Website"]'
    );
    await expect(socialLinks).toHaveCount(2);
  });
});

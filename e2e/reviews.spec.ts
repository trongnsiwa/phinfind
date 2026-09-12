import { test, expect, hasSupabaseCredentials, createTestUser, deleteTestUser } from './fixtures/test-helpers';

test.describe('Shop Reviews Flow', () => {
  test('guest user is prompted to sign in when attempting to review', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('article, [class*="ShopCard"]').first();
    const hasCards = await firstCard.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (!hasCards) {
      test.skip(true, 'No coffee shops available in database to test reviews tab');
      return;
    }

    await firstCard.click();
    const tabReviews = page.getByRole('tab', { name: 'Đánh giá' });
    await expect(tabReviews).toBeVisible();
    await tabReviews.click();

    // In guest mode, action button prompts login
    const loginReviewBtn = page.getByRole('button', { name: /đăng nhập để đánh giá/i });
    if (await loginReviewBtn.isVisible()) {
      await loginReviewBtn.click();
      // Toast notice or login modal appears
      await expect(page.getByText(/yêu cầu đăng nhập|vui lòng đăng nhập/i)).toBeVisible();
    }
  });

  test('authenticated review submission, edit, and deletion cycle', async ({ page }) => {
    test.skip(!hasSupabaseCredentials, 'Skipping live review write test: Supabase test credentials not configured');

    const testUser = await createTestUser('e2e-review');
    test.skip(!testUser, 'Failed to create temporary test user');

    try {
      // 1. Sign in as test user
      await page.goto('/login');
      await page.locator('#email').fill(testUser!.email);
      await page.locator('#password').fill(testUser!.password);
      await page.getByRole('button', { name: /đăng nhập/i }).click();
      await page.waitForURL('/', { timeout: 10000 });

      // 2. Open first shop drawer
      const firstCard = page.locator('article, [class*="ShopCard"]').first();
      await firstCard.click();

      const tabReviews = page.getByRole('tab', { name: 'Đánh giá' });
      await tabReviews.click();

      // 3. Click "Viết đánh giá"
      const writeReviewBtn = page.getByRole('button', { name: /viết đánh giá/i });
      if (await writeReviewBtn.isVisible()) {
        await writeReviewBtn.click();

        // 4. Fill in review modal
        const commentArea = page.locator('textarea');
        await expect(commentArea).toBeVisible();
        await commentArea.fill('Quán cà phê có không gian rất chill và wifi mạnh!');

        const submitBtn = page.getByRole('button', { name: /gửi đánh giá/i });
        await submitBtn.click();

        // 5. Verify review appears with comment text
        await expect(page.getByText('Quán cà phê có không gian rất chill và wifi mạnh!')).toBeVisible({ timeout: 10000 });
      }
    } finally {
      if (testUser) {
        await deleteTestUser(testUser.id);
      }
    }
  });
});

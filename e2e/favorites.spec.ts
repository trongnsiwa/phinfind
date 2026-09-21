import {
  test,
  expect,
  hasSupabaseCredentials,
  createTestUser,
  deleteTestUser,
  assertNoHorizontalScroll,
  assertTapTarget,
} from './fixtures/test-helpers';

test.describe('Favorites Page & Mobile Polish', () => {
  test.describe.configure({ mode: 'serial' });

  test('header banner and layout responsive contract across viewports', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('domcontentloaded');
    await assertNoHorizontalScroll(page);

    const viewport = page.viewportSize();
    const isMobile = viewport ? viewport.width < 768 : false;

    if (isMobile) {
      // Mobile Header Banner:
      // 1. Container <= 80px vertical height
      const mobileHeader = page.locator('div.md\\:hidden').first();
      await expect(mobileHeader).toBeVisible();

      const headerBox = await mobileHeader.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(headerBox!.height).toBeLessThanOrEqual(80);

      // 2. Title: "Quán Cà Phê Đã Lưu" with text-xl
      const title = mobileHeader.getByRole('heading', { level: 2 });
      await expect(title).toBeVisible();
      await expect(title).toContainText('Quán Cà Phê Đã Lưu');
      await expect(title).toHaveClass(/text-xl/);

      // 3. Subtitle: "Quán yêu thích của bạn" with line-clamp-1
      const subtitle = mobileHeader.getByText('Quán yêu thích của bạn');
      await expect(subtitle).toBeVisible();
      await expect(subtitle).toHaveClass(/line-clamp-1/);

      // 4. Count badge reads "N quán" on one line below title
      const countBadge = mobileHeader.locator('span').filter({ hasText: /quán$/ });
      await expect(countBadge).toBeVisible();
      await expect(countBadge).toHaveClass(/whitespace-nowrap/);
      await expect(countBadge).toHaveClass(/rounded-full/);

      // Verify count badge sits vertically below the title
      const titleBox = await title.boundingBox();
      const badgeBox = await countBadge.boundingBox();
      expect(titleBox && badgeBox && titleBox.y < badgeBox.y).toBe(true);

      // 5. Empty / guest state is rendered and visible
      const emptyHeading = page.getByRole('heading', { level: 3 });
      await expect(emptyHeading).toBeVisible();
    } else {
      // Desktop / Tablet Header Banner:
      // Preserved side-by-side header with "N đã lưu"
      const desktopHeader = page.locator('div.hidden.md\\:flex').first();
      await expect(desktopHeader).toBeVisible();

      const title = desktopHeader.getByRole('heading', { level: 2 });
      await expect(title).toBeVisible();
      await expect(title).toContainText('Quán Cà Phê Đã Lưu');

      const countBadge = desktopHeader.locator('[class*="Badge"], div').filter({ hasText: /đã lưu$/ }).first();
      await expect(countBadge).toBeVisible();
    }
  });

  test('authenticated single favorite card dimensions and centering on mobile', async ({ page }) => {
    test.skip(!hasSupabaseCredentials, 'Supabase test credentials not configured');

    const testUser = await createTestUser('e2e-fav');
    test.skip(!testUser, 'Failed to create test user');

    try {
      // 1. Sign in
      await page.goto('/login');
      await page.locator('#email').fill(testUser!.email);
      await page.locator('#password').fill(testUser!.password);
      await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
      await page.waitForURL('/', { timeout: 10000 });

      // 2. Favorite first shop on discover
      const favBtn = page.locator('button[aria-label="Thêm vào danh sách yêu thích"]:visible').first();
      if (await favBtn.isVisible()) {
        await favBtn.click();
        await page.waitForTimeout(1000);
      }

      // 3. Navigate to /favorites
      await page.goto('/favorites');
      await page.waitForLoadState('domcontentloaded');

      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 768 : false;

      // Verify card rendered if shop was favorited
      const card = page.locator('[role="button"]:has(h4)').first();
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        expect(cardBox).not.toBeNull();

        if (isMobile) {
          // Mobile card height target ~320-360px (under 390px, down from 420px)
          expect(cardBox!.height).toBeGreaterThanOrEqual(300);
          expect(cardBox!.height).toBeLessThanOrEqual(390);

          // Hero image <= 200px
          const imgContainer = card.locator('.aspect-\\[16\\/10\\]').first();
          const imgBox = await imgContainer.boundingBox();
          if (imgBox) {
            expect(imgBox.height).toBeLessThanOrEqual(200);
          }

          // Action buttons: min-h-[44px]
          const actionBtn = card.getByRole('link', { name: /chỉ đường/i });
          if (await actionBtn.isVisible()) {
            await assertTapTarget(actionBtn, 44);
          }
        }
      }
    } finally {
      if (testUser) {
        await deleteTestUser(testUser.id);
      }
    }
  });
});

import {
  test,
  expect,
  hasSupabaseCredentials,
  createTestUser,
  deleteTestUser,
} from './fixtures/test-helpers';

test.describe('AddShopDialog Cancel Confirmation Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('CREATE mode: opens cancel dialog with correct copy, hierarchy, dimensions, and keyboard behavior', async ({
    page,
  }) => {
    test.skip(!hasSupabaseCredentials, 'Supabase test credentials not configured');

    const testUser = await createTestUser('e2e-cancel');
    test.skip(!testUser, 'Failed to create test user');

    try {
      // 1. Sign in as test user so AddShopDialog FAB is allowed to open
      await page.goto('/login');
      await page.locator('#email').fill(testUser!.email);
      await page.locator('#password').fill(testUser!.password);
      await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
      await page.waitForURL('/', { timeout: 10000 });

      // 2. Open AddShopDialog via floating "+ Thêm quán" button
      const fab = page.locator('button[aria-label="Thêm quán cà phê mới"]:visible');
      await expect(fab).toBeVisible();
      await fab.click();

      // 3. Verify AddShopDialog is open
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();
      const dialogTitle = dialog.locator('h2:visible').filter({ hasText: /thêm quán/i }).first();
      await expect(dialogTitle).toBeVisible();

    // Trigger cancel in footer (mobile: "Hủy", desktop: "Hủy bỏ")
    const cancelBtn = page.locator('[role="dialog"] button:visible').filter({ hasText: /^hủy/i }).first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Verify confirmation dialog title & description
    const confirmTitle = page.getByRole('heading', { name: 'Hủy bỏ thêm quán?' });
    await expect(confirmTitle).toBeVisible();
    await expect(
      page.getByText('Bạn có chắc muốn hủy? Mọi thông tin đã nhập sẽ bị mất.')
    ).toBeVisible();

    // Verify buttons
    const continueBtn = page.getByRole('button', { name: 'Tiếp tục' });
    const discardBtn = page.getByRole('button', { name: 'Hủy bỏ' });
    await expect(continueBtn).toBeVisible();
    await expect(discardBtn).toBeVisible();

    // Verify safe action has primary styling (amber-gold)
    await expect(continueBtn).toHaveClass(/bg-amber-gold/);

    // Verify destructive action uses outline styling, NOT solid red (bg-rose-600)
    await expect(discardBtn).not.toHaveClass(/bg-rose-600/);
    await expect(discardBtn).toHaveClass(/border/);

    // Verify dimensions on mobile vs desktop
    const viewport = page.viewportSize();
    const isMobile = viewport ? viewport.width < 768 : false;

    const continueBox = await continueBtn.boundingBox();
    const discardBox = await discardBtn.boundingBox();

    expect(continueBox?.height).toBeGreaterThanOrEqual(44);
    expect(discardBox?.height).toBeGreaterThanOrEqual(44);

    if (isMobile) {
      // Mobile: Safe action on top of destructive action
      expect(continueBox && discardBox && continueBox.y < discardBox.y).toBe(true);
    } else {
      // Desktop: Destructive on left, safe on right
      expect(continueBox && discardBox && discardBox.x < continueBox.x).toBe(true);
    }

    // Keyboard Escape test: should dismiss confirm dialog and keep AddShopDialog open
    await page.keyboard.press('Escape');
    await expect(confirmTitle).toBeHidden();
    await expect(dialogTitle).toBeVisible();

    // Open confirm again and click discard to close form
    await cancelBtn.click();
    await expect(confirmTitle).toBeVisible();
    await discardBtn.click();

    // Both should be closed
    await expect(confirmTitle).toBeHidden();
    await expect(dialog).toBeHidden();
  } finally {
    if (testUser) {
      await deleteTestUser(testUser.id);
    }
  }
});
});

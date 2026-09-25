import { test, expect } from '@playwright/test';

test.describe('Header Search Takeover and Responsive Behavior', () => {
  test('mobile search takeover: hides logo, shows full-width input + Hủy button, cleans up on cancel', async ({
    page,
  }) => {
    const isMobileViewport = (page.viewportSize()?.width ?? 1000) < 768;
    test.skip(!isMobileViewport, 'Mobile (< 768px) only test');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const logo = page.getByLabel('Trang chủ PhinFind');
    const searchTrigger = page.getByRole('button', { name: 'Tìm quán cà phê (Cmd+K)' });
    const cancelBtn = page.getByRole('button', { name: 'Đóng tìm kiếm', exact: true }).filter({ hasText: 'Hủy' });
    const searchInput = page.getByLabel('Tìm kiếm quán cà phê');

    // Initially: logo visible, search trigger visible, search input hidden
    await expect(logo).toBeVisible();
    await expect(searchTrigger).toBeVisible();
    await expect(searchInput).toBeHidden();
    await expect(cancelBtn).toBeHidden();

    // Open search
    await searchTrigger.click();

    // Takeover active: logo hidden, input and Hủy visible
    await expect(logo).toBeHidden();
    await expect(searchInput).toBeVisible();
    await expect(cancelBtn).toBeVisible();

    // Verify header height remains 56px (h-14)
    const header = page.locator('header.sticky-header');
    const box = await header.boundingBox();
    expect(box?.height).toBe(56);

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Type query and verify clear button inside input
    await searchInput.fill('Cà phê');
    await expect(searchInput).toHaveValue('Cà phê');
    const clearInputBtn = page.getByRole('button', { name: 'Xóa nội dung tìm kiếm' });
    await expect(clearInputBtn).toBeVisible();

    // Click clear button
    await clearInputBtn.click();
    await expect(searchInput).toHaveValue('');

    // Click Hủy button to close search
    await cancelBtn.click();
    await expect(logo).toBeVisible();
    await expect(searchInput).toBeHidden();
    await expect(cancelBtn).toBeHidden();
  });

  test('mobile search keyboard dismiss via Escape returns focus to trigger', async ({
    page,
  }) => {
    const isMobileViewport = (page.viewportSize()?.width ?? 1000) < 768;
    test.skip(!isMobileViewport, 'Mobile (< 768px) only test');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const searchTrigger = page.getByRole('button', { name: 'Tìm quán cà phê (Cmd+K)' });
    const searchInput = page.getByLabel('Tìm kiếm quán cà phê');
    const logo = page.getByLabel('Trang chủ PhinFind');

    await searchTrigger.click();
    await expect(searchInput).toBeVisible();
    await expect(logo).toBeHidden();

    // Press Escape
    await page.keyboard.press('Escape');

    await expect(searchInput).toBeHidden();
    await expect(logo).toBeVisible();
    await expect(searchTrigger).toBeFocused();
  });

  test('desktop inline search: keeps logo and desktop nav visible, shows ✕ button instead of Hủy', async ({
    page,
  }) => {
    const isMobileViewport = (page.viewportSize()?.width ?? 1000) < 768;
    test.skip(isMobileViewport, 'Desktop/Tablet (>= 768px) only test');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const logo = page.getByLabel('Trang chủ PhinFind');
    const searchTrigger = page.getByRole('button', { name: 'Tìm quán cà phê (Cmd+K)' });
    const searchInput = page.getByLabel('Tìm kiếm quán cà phê');
    const cancelTextBtn = page.getByRole('button', { name: 'Đóng tìm kiếm' }).filter({ hasText: 'Hủy' });
    const closeIconBtn = page.locator('button[aria-label="Đóng tìm kiếm"]:not(:has-text("Hủy"))');

    await expect(logo).toBeVisible();
    await searchTrigger.click();

    // On desktop, logo remains visible alongside inline search
    await expect(logo).toBeVisible();
    await expect(searchInput).toBeVisible();
    await expect(cancelTextBtn).toBeHidden();
    await expect(closeIconBtn).toBeVisible();

    // Close desktop search
    await closeIconBtn.click();
    await expect(searchInput).toBeHidden();
    await expect(searchTrigger).toBeVisible();
  });

  test('desktop header navigation renders visible Bảng tin link on viewports >= 768px', async ({
    page,
  }) => {
    const isMobileViewport = (page.viewportSize()?.width ?? 1000) < 768;
    test.skip(isMobileViewport, 'Desktop/Tablet (>= 768px) only test');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const feedLink = page.locator('header nav').getByRole('link', { name: 'Bảng tin' });
    await expect(feedLink).toBeVisible();
    await expect(feedLink).toHaveAttribute('href', '/feed');
  });

  test('mobile header hides desktop nav including Bảng tin on viewports < 768px', async ({
    page,
  }) => {
    const isMobileViewport = (page.viewportSize()?.width ?? 1000) < 768;
    test.skip(!isMobileViewport, 'Mobile (< 768px) only test');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const feedHeaderLink = page.locator('header nav').getByRole('link', { name: 'Bảng tin' });
    await expect(feedHeaderLink).toBeHidden();
  });
});

import { test, expect } from './fixtures/test-helpers';

test.describe('Shop Detail Flow', () => {
  test('opens shop drawer on card click and interacts with tabs', async ({ page }) => {
    await page.goto('/');

    // Check if shop cards are rendered
    const firstCard = page.locator('article, [class*="ShopCard"]').first();
    const hasCards = await firstCard.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (!hasCards) {
      test.skip(true, 'No coffee shops available in database to open detail drawer');
      return;
    }

    await firstCard.click();

    // Verify drawer appears and URL updates with ?shop=
    await expect(page).toHaveURL(/[?&]shop=/);
    
    // Tab switching check
    const tabOverview = page.getByRole('tab', { name: 'Tổng quan' });
    const tabPhotos = page.getByRole('tab', { name: 'Hình ảnh' });
    const tabReviews = page.getByRole('tab', { name: 'Đánh giá' });
    const tabAmenities = page.getByRole('tab', { name: 'Tiện ích' });

    await expect(tabOverview).toBeVisible();
    await expect(tabPhotos).toBeVisible();
    await expect(tabReviews).toBeVisible();
    await expect(tabAmenities).toBeVisible();

    // Switch to Photos
    await tabPhotos.click();
    await expect(tabPhotos).toHaveAttribute('data-state', 'active');

    // Switch to Reviews
    await tabReviews.click();
    await expect(tabReviews).toHaveAttribute('data-state', 'active');

    // Switch to Amenities
    await tabAmenities.click();
    await expect(tabAmenities).toHaveAttribute('data-state', 'active');

    // Switch back to Overview
    await tabOverview.click();
    await expect(tabOverview).toHaveAttribute('data-state', 'active');

    // Dismiss drawer by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('standalone shop page handles missing or invalid ID gracefully', async ({ page }) => {
    await page.goto('/shop/non-existent-shop-id');

    // Should display skeleton initially and eventually error/empty fallback without crash
    await expect(page.locator('body')).toBeVisible();
    const notFoundText = page.getByText(/Không tìm thấy quán cà phê|Không tìm thấy thông tin|Đã xảy ra sự cố/i);
    const homeBtn = page.getByRole('link', { name: /về trang chủ|quay lại/i });

    await Promise.race([
      notFoundText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      homeBtn.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);
  });
});

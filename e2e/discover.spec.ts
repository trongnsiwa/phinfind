import { test, expect } from './fixtures/test-helpers';

test.describe('Discover Page & Bento Grid', () => {
  test('renders top search bar and allows text input and clear', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[aria-label="Tìm quán cà phê theo tên, đường phố hoặc quận"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Highlands');
    await expect(searchInput).toHaveValue('Highlands');

    const clearBtn = page.locator('button[aria-label="Xóa nội dung tìm kiếm"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
  });

  test('interacts with filter chips (open now toggle)', async ({ page }) => {
    await page.goto('/');

    const openNowChip = page.locator('button[aria-label="Lọc quán đang mở cửa"]');
    await expect(openNowChip).toBeVisible();
    await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');

    await openNowChip.click();
    await expect(openNowChip).toHaveAttribute('aria-pressed', 'true');

    await openNowChip.click();
    await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');
  });

  test('sort dropdown selector functions properly', async ({ page }) => {
    await page.goto('/');

    const sortTrigger = page.locator('button[aria-label="Sắp xếp quán cà phê theo"]');
    await expect(sortTrigger).toBeVisible();

    await sortTrigger.click();
    await expect(page.getByRole('option', { name: 'Đánh giá' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Tên quán' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Khoảng cách' })).toBeVisible();

    // Select "Đánh giá"
    await page.getByRole('option', { name: 'Đánh giá' }).click();
  });

  test('displays coffee shop items or graceful empty state', async ({ page }) => {
    await page.goto('/');

    // Wait for either shop cards to appear or the initial empty state to render
    const cards = page.locator('[data-slot="card"], [class*="ShopCard"], article');
    const emptyState = page.getByText(/Không tìm thấy quán cà phê nào/i);

    await Promise.race([
      cards.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
      emptyState.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
    ]);

    const cardCount = await cards.count();
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
    }
  });
});

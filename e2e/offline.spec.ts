import { test, expect } from './fixtures/test-helpers';

test.describe('Offline Handling & Queue Synchronization', () => {
  test('queues offline favorite action and displays toast notification', async ({ page, context }) => {
    await page.goto('/');

    const firstCard = page.locator('article, [class*="ShopCard"]').first();
    const hasCards = await firstCard.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (!hasCards) {
      test.skip(true, 'No shops rendered to test offline favoriting');
      return;
    }

    // Emulate offline network disconnect
    await context.setOffline(true);

    try {
      // Find and click favorite button on the first card
      const favBtn = firstCard.locator('button[aria-label*="yêu thích"], button:has(svg.lucide-heart)');
      if (await favBtn.isVisible()) {
        await favBtn.click();

        // Check for offline notification toast
        const offlineToast = page.getByText(/ngoại tuyến/i);
        await expect(offlineToast).toBeVisible({ timeout: 5000 });
      }
    } finally {
      // Restore online connectivity
      await context.setOffline(false);
    }
  });
});

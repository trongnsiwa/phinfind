import { test, expect, assertNoHorizontalScroll } from './fixtures/test-helpers';

test.describe('Theme & Dark Mode Persistence', () => {
  test('toggles dark mode in settings and persists on page reload without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/settings');
    await assertNoHorizontalScroll(page);

    const themeSwitch = page.locator('button[aria-label="Chuyển đổi giao diện tối"]');
    await expect(themeSwitch).toBeVisible();

    const html = page.locator('html');
    const wasDarkInitially = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeSwitch.click();

    // Verify dark class state inverted
    if (wasDarkInitially) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Reload page to verify persistence via localStorage
    await page.reload();
    if (wasDarkInitially) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Toggle back to preserve original state
    await page.locator('button[aria-label="Chuyển đổi giao diện tối"]').click();

    // Verify no critical JavaScript runtime errors were logged to console
    const uncaughtErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('404') && !err.includes('Failed to load resource')
    );
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('recap hero card and profile callout maintain theme contrast and locked dark palette', async ({ page }) => {
    // 1. Check profile page callout banner styling
    await page.goto('/profile');
    await assertNoHorizontalScroll(page);

    const callout = page.locator('a[href="/recap"]');
    if (await callout.isVisible()) {
      // Light mode: solid amber tint, inner ring, and darker amber eyebrow
      await expect(callout).toHaveClass(/bg-amber-gold\/10/);
      await expect(callout).toHaveClass(/border-amber-gold\/30/);
      await expect(callout).toHaveClass(/ring-1/);

      const eyebrow = callout.locator('span').filter({ hasText: /PHINFIND RECAP/i });
      await expect(eyebrow).toHaveClass(/text-amber-gold-hover/);

      // Dark mode: dark variants applied
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await expect(callout).toHaveClass(/dark:bg-amber-gold\/15/);
      await expect(eyebrow).toHaveClass(/dark:text-amber-gold/);

      await page.evaluate(() => document.documentElement.classList.remove('dark'));
    }

    // 2. Check /recap theme awareness and hero card contrast
    await page.goto('/recap');
    const isAtLogin = page.url().includes('/login');
    if (!isAtLogin) {
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalScroll(page);

      // Verify page body background matches standard theme in both modes (no forced black body in light mode)
      await page.evaluate(() => document.documentElement.classList.remove('dark'));
      const lightBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      expect(lightBodyBg).toBe('rgb(249, 246, 240)');

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      const darkBodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      expect(darkBodyBg).toBe('rgb(16, 16, 16)');

      // Verify no visible seam: main content area connects right below the header
      const header = page.locator('header').first();
      const main = page.locator('main').first();
      if ((await header.isVisible()) && (await main.isVisible())) {
        const headerBox = await header.boundingBox();
        const mainBox = await main.boundingBox();
        if (headerBox && mainBox) {
          expect(mainBox.y).toBeLessThanOrEqual(headerBox.y + headerBox.height + 1);
        }
      }

      // Verify recap hero card background is DIFFERENT between the two themes
      const heroCard = page.locator('.recap-hero-card');
      if (await heroCard.isVisible()) {
        // Light mode: warm cream card (matches card token rgb(255, 255, 255))
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
        const lightHeroBg = await heroCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);

        // Dark mode: roast hex rgb(28, 18, 12) (#1C120C)
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        const darkHeroBg = await heroCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);

        expect(lightHeroBg).not.toBe(darkHeroBg);
        expect(darkHeroBg).toBe('rgb(28, 18, 12)');

        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
    }
  });
});

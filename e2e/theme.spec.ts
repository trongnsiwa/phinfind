import { test, expect } from './fixtures/test-helpers';

test.describe('Theme & Dark Mode Persistence', () => {
  test('toggles dark mode in settings and persists on page reload without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/settings');

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
});

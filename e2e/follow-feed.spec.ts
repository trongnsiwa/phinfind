import {
  test,
  expect,
  assertNoHorizontalScroll,
  assertTapTarget,
} from './fixtures/test-helpers';

test.describe('Follow Graph and Feed UI', () => {
  const mockUsername = 'barista_viet';

  test.beforeEach(async ({ page }) => {
    // Mock public profile
    await page.route(`**/api/user/public-profile?username=${mockUsername}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            id: 'mock-barista-123',
            username: mockUsername,
            full_name: 'Việt Barista',
            avatar_url: null,
            bio: 'Đam mê pour-over và hạt Robusta Fine.',
            social_stats: {
              followers: 12,
              following: 5,
              is_following: false,
            },
            created_at: new Date().toISOString(),
          },
          reviews: [],
        }),
      });
    });

    // Mock follow status
    await page.route('**/api/user/follow-status?user_id=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          followers: 12,
          following: 5,
          is_following: false,
        }),
      });
    });

    // Mock followers list
    await page.route('**/api/user/followers?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profiles: [
            {
              id: 'follower-1',
              username: 'coffeelover99',
              full_name: 'Coffee Lover',
              avatar_url: null,
              bio: 'Hà Nội cà phê',
              followed_at: new Date().toISOString(),
              is_following: false,
            },
          ],
          total: 1,
        }),
      });
    });

    // Mock following list
    await page.route('**/api/user/following?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profiles: [],
          total: 0,
        }),
      });
    });
  });

  test('public profile displays follow button and stat links with touch targets', async ({ page }) => {
    await page.goto(`/u/${mockUsername}`);
    await assertNoHorizontalScroll(page);

    const followBtn = page.getByRole('button', { name: /theo dõi/i });
    await expect(followBtn).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      await assertTapTarget(followBtn, 44);
    }

    const followersLink = page.getByRole('link', { name: /người theo dõi/i });
    await expect(followersLink).toBeVisible();
    await expect(followersLink).toHaveAttribute('href', `/u/${mockUsername}/followers`);

    const followingLink = page.getByRole('link', { name: /đang theo dõi/i });
    await expect(followingLink).toBeVisible();
    await expect(followingLink).toHaveAttribute('href', `/u/${mockUsername}/following`);
  });

  test('followers page renders user list and following tab renders empty state', async ({ page }) => {
    await page.goto(`/u/${mockUsername}/followers`);
    await assertNoHorizontalScroll(page);

    await expect(page.getByText('Việt Barista')).toBeVisible();
    await expect(page.getByText('Coffee Lover')).toBeVisible();
    await expect(page.getByText('@coffeelover99')).toBeVisible();

    // Click on Đang theo dõi tab
    const followingTab = page.getByRole('link', { name: 'Đang theo dõi' });
    await followingTab.click();
    await page.waitForURL(`**/u/${mockUsername}/following`);

    await expect(page.getByText(/chưa theo dõi ai/i)).toBeVisible();
  });

  test('bottom nav includes Bảng tin on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const feedNav = page.locator('nav').getByRole('link', { name: /bảng tin/i });
    await expect(feedNav).toBeVisible();
    await expect(feedNav).toHaveAttribute('href', '/feed');
  });
});

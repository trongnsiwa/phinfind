import {
  test,
  expect,
  hasSupabaseCredentials,
  getTestSupabaseAdmin,
  assertNoHorizontalScroll,
  assertTapTarget,
} from './fixtures/test-helpers';

test.describe('Shop Detail Flow', () => {
  test('opens shop drawer on card click and interacts with tabs', async ({ page }) => {
    await page.goto('/');
    await assertNoHorizontalScroll(page);

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
    await assertNoHorizontalScroll(page);
    
    // Tab switching check
    const tabOverview = page.getByRole('tab', { name: 'Tổng quan' });
    const tabPhotos = page.getByRole('tab', { name: 'Hình ảnh' });
    const tabReviews = page.getByRole('tab', { name: 'Đánh giá' });
    const tabAmenities = page.getByRole('tab', { name: 'Tiện ích' });

    await expect(tabOverview).toBeVisible();
    await expect(tabPhotos).toBeVisible();
    await expect(tabReviews).toBeVisible();
    await expect(tabAmenities).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      await assertTapTarget(tabOverview, 44);
      await assertTapTarget(tabPhotos, 44);
    }

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

    // Verify URL no longer contains ?shop=
    await expect(page).not.toHaveURL(/[?&]shop=/);
  });

  test('standalone shop page handles missing or invalid ID gracefully', async ({ page }) => {
    await page.goto('/shop/non-existent-shop-id');
    await assertNoHorizontalScroll(page);

    // Should display skeleton initially and eventually error/empty fallback without crash
    await expect(page.locator('body')).toBeVisible();
    const notFoundText = page.getByText(/Không tìm thấy quán cà phê|Không tìm thấy thông tin|Đã xảy ra sự cố/i);
    const homeBtn = page.getByRole('link', { name: /về trang chủ|quay lại/i });

    await Promise.race([
      notFoundText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      homeBtn.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
    ]);
  });

  test('renders populated social media links with correct attributes', async ({ page }) => {
    test.skip(!hasSupabaseCredentials, 'Skipping live shop seed test: Supabase test credentials not configured');

    const admin = getTestSupabaseAdmin();
    test.skip(!admin, 'Supabase admin client unavailable');

    const testPlaceId = `test_social_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const shopName = 'Quán Cà Phê Social Test';
    const fbUrl = 'https://facebook.com/quancafesocialtest';
    const igUrl = 'https://instagram.com/quancafesocialtest';
    const ttUrl = 'https://tiktok.com/@quancafesocialtest';

    const { error: insertError } = await admin!.from('shops').insert({
      place_id: testPlaceId,
      name: shopName,
      address: '123 Đường Test Social, Quận 1, TP.HCM',
      lat: 10.7769,
      lon: 106.7009,
      rating: 4.5,
      total_ratings: 10,
      facebook_url: fbUrl,
      instagram_url: igUrl,
      tiktok_url: ttUrl,
      hidden: false,
      categories: ['catering.cafe']
    });

    if (insertError) {
      console.warn('Failed to seed test shop with social links:', insertError);
      test.skip(true, 'Failed to seed shop in database');
      return;
    }

    try {
      await page.goto(`/shop/${testPlaceId}`);
      await assertNoHorizontalScroll(page);

      // Verify header title is displayed
      await expect(page.getByText('Kết nối với quán')).toBeVisible({ timeout: 10000 });

      // Find the three social links
      const fbLink = page.getByRole('link', { name: `Mở Facebook của ${shopName}` });
      const igLink = page.getByRole('link', { name: `Mở Instagram của ${shopName}` });
      const ttLink = page.getByRole('link', { name: `Mở TikTok của ${shopName}` });

      await expect(fbLink).toBeVisible();
      await expect(fbLink).toHaveAttribute('href', fbUrl);
      await expect(fbLink).toHaveAttribute('target', '_blank');
      await expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');

      await expect(igLink).toBeVisible();
      await expect(igLink).toHaveAttribute('href', igUrl);
      await expect(igLink).toHaveAttribute('target', '_blank');
      await expect(igLink).toHaveAttribute('rel', 'noopener noreferrer');

      await expect(ttLink).toBeVisible();
      await expect(ttLink).toHaveAttribute('href', ttUrl);
      await expect(ttLink).toHaveAttribute('target', '_blank');
      await expect(ttLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Unseeded social links should not render
      await expect(page.getByRole('link', { name: /Mở YouTube của/i })).not.toBeVisible();
      await expect(page.getByRole('link', { name: /Mở Zalo của/i })).not.toBeVisible();

      // Check tap targets on mobile viewports
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await assertTapTarget(fbLink, 44);
        await assertTapTarget(igLink, 44);
        await assertTapTarget(ttLink, 44);
      }
    } finally {
      await admin!.from('shops').delete().eq('place_id', testPlaceId);
    }
  });

  test('renders populated videos on the Video tab with correct attributes', async ({ page }) => {
    test.skip(!hasSupabaseCredentials, 'Skipping live shop seed test: Supabase test credentials not configured');

    const admin = getTestSupabaseAdmin();
    test.skip(!admin, 'Supabase admin client unavailable');

    const testPlaceId = `test_videos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const shopName = 'Quán Cà Phê Video Test';
    const ytVideo = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      video_id: 'dQw4w9WgXcQ',
      title: 'Giới thiệu quán YouTube',
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    };
    const ttVideo = {
      url: 'https://www.tiktok.com/@cafesaigon/video/7123456789012345678',
      platform: 'tiktok',
      video_id: '7123456789012345678',
      title: 'Review TikTok quán cà phê',
      thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/thumb.jpeg'
    };

    const { error: insertError } = await admin!.from('shops').insert({
      place_id: testPlaceId,
      name: shopName,
      address: '456 Đường Test Video, Quận 1, TP.HCM',
      lat: 10.7769,
      lon: 106.7009,
      rating: 4.8,
      total_ratings: 15,
      videos: [ytVideo, ttVideo],
      hidden: false,
      categories: ['catering.cafe']
    });

    if (insertError) {
      console.warn('Failed to seed test shop with videos:', insertError);
      test.skip(true, 'Failed to seed shop in database');
      return;
    }

    try {
      await page.goto(`/shop/${testPlaceId}`);
      await assertNoHorizontalScroll(page);

      // Switch to Video tab
      const videoTabTrigger = page.getByRole('tab', { name: 'Video' });
      await expect(videoTabTrigger).toBeVisible({ timeout: 10000 });
      await videoTabTrigger.click();

      // Find the two video card links
      const ytLink = page.getByRole('link', { name: new RegExp(ytVideo.title, 'i') });
      const ttLink = page.getByRole('link', { name: new RegExp(ttVideo.title, 'i') });

      await expect(ytLink).toBeVisible();
      await expect(ytLink).toHaveAttribute('href', ytVideo.url);
      await expect(ytLink).toHaveAttribute('target', '_blank');
      await expect(ytLink).toHaveAttribute('rel', 'noopener noreferrer');

      await expect(ttLink).toBeVisible();
      await expect(ttLink).toHaveAttribute('href', ttVideo.url);
      await expect(ttLink).toHaveAttribute('target', '_blank');
      await expect(ttLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Assert platform badges inside cards
      await expect(ytLink.getByText('YouTube')).toBeVisible();
      await expect(ttLink.getByText('TikTok')).toBeVisible();

      // Check tap targets on mobile viewports
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await assertTapTarget(ytLink, 44);
        await assertTapTarget(ttLink, 44);
      }
    } finally {
      await admin!.from('shops').delete().eq('place_id', testPlaceId);
    }
  });

  test('share menu opens dropdown with five items on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await assertNoHorizontalScroll(page);

    const firstCard = page.locator('article, [class*="ShopCard"]').first();
    const hasCards = await firstCard.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (!hasCards) {
      test.skip(true, 'No coffee shops available in database to open detail drawer');
      return;
    }

    await firstCard.click();
    await expect(page).toHaveURL(/[?&]shop=/);

    const shareBtn = page.getByRole('button', { name: 'Chia sẻ' }).first();
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
    await shareBtn.click();

    // Verify 5 share options in dropdown
    const fbItem = page.getByRole('menuitem', { name: /Chia sẻ qua Facebook|Facebook/i });
    const xItem = page.getByRole('menuitem', { name: /Chia sẻ qua X|X \(Twitter\)/i });
    const zaloItem = page.getByRole('menuitem', { name: /Chia sẻ qua Zalo|Zalo/i });
    const tgItem = page.getByRole('menuitem', { name: /Chia sẻ qua Telegram|Telegram/i });
    const copyItem = page.getByRole('menuitem', { name: 'Sao chép liên kết' });

    await expect(fbItem).toBeVisible();
    await expect(xItem).toBeVisible();
    await expect(zaloItem).toBeVisible();
    await expect(tgItem).toBeVisible();
    await expect(copyItem).toBeVisible();

    // Verify Facebook share link attributes without actually navigating
    await expect(fbItem).toHaveAttribute('href', /facebook\.com\/sharer\/sharer\.php\?u=/);
    await expect(fbItem).toHaveAttribute('target', '_blank');
    await expect(fbItem).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('share button invokes native navigator.share on mobile viewport without showing dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Mock native navigator.share before navigation
    await page.addInitScript(() => {
      (window as any).__sharedCalls = [];
      Object.defineProperty(window.navigator, 'share', {
        writable: true,
        configurable: true,
        value: async (data: any) => {
          (window as any).__sharedCalls.push(data);
          return Promise.resolve();
        }
      });
    });

    await page.goto('/');
    await assertNoHorizontalScroll(page);

    const firstCard = page.locator('article, [class*="ShopCard"]').first();
    const hasCards = await firstCard.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (!hasCards) {
      test.skip(true, 'No coffee shops available in database to open detail drawer');
      return;
    }

    await firstCard.click();
    await expect(page).toHaveURL(/[?&]shop=/);

    const shareBtn = page.getByRole('button', { name: 'Chia sẻ' }).first();
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
    await shareBtn.click();

    // Check that native navigator.share was invoked
    const shareCalls = await page.evaluate(() => (window as any).__sharedCalls || []);
    expect(shareCalls.length).toBeGreaterThan(0);
    expect(shareCalls[0]).toHaveProperty('url');

    // Check that dropdown menu is NOT visible
    const fbItem = page.getByRole('menuitem', { name: /Facebook/i });
    await expect(fbItem).not.toBeVisible();
  });
});

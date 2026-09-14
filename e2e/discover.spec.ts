import {
  test,
  expect,
  assertNoHorizontalScroll,
  assertTapTarget,
  assertNoOverlap,
} from './fixtures/test-helpers';

test.describe('Discover Page & Bento Grid', () => {
  test('renders top search bar and allows text input and clear', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[aria-label="Tìm quán cà phê theo tên, đường phố hoặc quận"]:visible');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Highlands');
    await expect(searchInput).toHaveValue('Highlands');

    const clearBtn = page.locator('button[aria-label="Xóa nội dung tìm kiếm"]:visible');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
  });

  test('interacts with filter chips (open now toggle)', async ({ page }) => {
    await page.goto('/');

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      // On mobile viewports, the filter chip is inside the filter Sheet
      const filterBtn = page.locator('button[aria-label="Mở bộ lọc tìm kiếm"]:visible');
      await expect(filterBtn).toBeVisible();
      await filterBtn.click();

      const openNowChip = page.locator('[role="dialog"] button[aria-label="Lọc quán đang mở cửa"]:visible');
      await expect(openNowChip).toBeVisible();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');

      await openNowChip.click();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'true');

      await openNowChip.click();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');

      const closeBtn = page.locator('button[aria-label="Đóng bộ lọc"]:visible');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    } else {
      const openNowChip = page.locator('button[aria-label="Lọc quán đang mở cửa"]:visible').first();
      await expect(openNowChip).toBeVisible();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');

      await openNowChip.click();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'true');

      await openNowChip.click();
      await expect(openNowChip).toHaveAttribute('aria-pressed', 'false');
    }
  });

  test('sort dropdown selector functions properly', async ({ page }) => {
    await page.goto('/');

    const sortTrigger = page.locator('button[aria-label="Sắp xếp quán cà phê theo"]:visible');
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
    const cards = page.locator('[data-slot="card"], [class*="ShopCard"], article, [class*="card-glow-border"]');
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

  test('responsive verification at 320px and 390px mobile viewport with filter sheet interaction', async ({ page }) => {
    // 1. Check at 320px
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/');

    // Verify no horizontal overflow at 320px
    let isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // Verify Header height remains h-14 (56px) across breakpoints
    const header = page.locator('header.sticky-header');
    await expect(header).toBeVisible();
    const headerBox320 = await header.boundingBox();
    expect(headerBox320?.height).toBe(56);

    // Verify theme toggle and hamburger are hidden on mobile (< md)
    const themeToggle = header.locator('button[aria-label*="giao diện"]');
    await expect(themeToggle).toBeHidden();
    const hamburger = header.locator('button[aria-label="Mở menu"]');
    await expect(hamburger).toBeHidden();

    // Verify search input is visible
    const searchInput = page.locator('input[aria-label="Tìm quán cà phê theo tên, đường phố hoặc quận"]').first();
    await expect(searchInput).toBeVisible();

    // Verify BottomNav is visible initially on mobile
    const bottomNav = page.locator('nav.md\\:hidden');
    await expect(bottomNav).toBeVisible();

    // Verify mobile "Bộ lọc" button is visible
    const filterBtn = page.locator('button[aria-label="Mở bộ lọc tìm kiếm"]');
    await expect(filterBtn).toBeVisible();

    // Verify inline filter chips container is hidden on mobile
    const desktopFilterChips = page.locator('.hidden.md\\:block button[aria-label="Lọc quán đang mở cửa"]');
    await expect(desktopFilterChips).toBeHidden();

    // Verify mobile Add Shop sticky bar is visible
    const fab = page.locator('button[aria-label="Thêm quán cà phê mới"]:visible');
    await expect(fab).toBeVisible();

    // Assert primary CTAs tap targets >= 44px and no overlap with BottomNav on mobile-320
    await assertTapTarget(filterBtn, 44);
    await assertTapTarget(fab, 44);
    await assertNoOverlap(bottomNav, fab);

    // 2. Open Filter Bottom Sheet
    await filterBtn.click();
    const sheetTitle = page.getByRole('heading', { name: 'Bộ lọc' });
    await expect(sheetTitle).toBeVisible();

    // TASK 3: BottomNav must be hidden while filter sheet is open
    await expect(bottomNav).toBeHidden();

    // TASK 1: Centered drag handle pill
    const dragHandle = page.locator('[role="dialog"] .w-10.h-1\\.5');
    await expect(dragHandle).toBeVisible();

    // TASK 1: Close button in title row
    const closeBtn = page.locator('button[aria-label="Đóng bộ lọc"]');
    await expect(closeBtn).toBeVisible();

    // TASK 1: Body sections a, b, c, d, e, f, g
    await expect(page.locator('[role="dialog"]').getByText('Vị trí hiện tại')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Bộ lọc nhanh')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Đánh giá tối thiểu')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Mức giá')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Tiện ích phổ biến')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Bán kính tìm kiếm')).toBeVisible();
    await expect(page.locator('[role="dialog"]').getByText('Sắp xếp theo')).toBeVisible();

    // Verify "Gần tôi" chip in Bộ lọc nhanh
    const nearMeChip = page.locator('[role="dialog"] button[aria-label="Sắp xếp theo khoảng cách gần tôi"]');
    await expect(nearMeChip).toBeVisible();

    // Verify "Đánh giá tối thiểu" 3-col segmented control
    const ratingRadiogroup = page.locator('[role="dialog"] [role="radiogroup"][aria-label="Đánh giá tối thiểu"]');
    await expect(ratingRadiogroup).toBeVisible();
    await expect(ratingRadiogroup.getByRole('radio', { name: 'Tất cả' })).toBeVisible();
    await expect(ratingRadiogroup.getByRole('radio', { name: '★ 4.0+' })).toBeVisible();
    await expect(ratingRadiogroup.getByRole('radio', { name: '★ 4.5+' })).toBeVisible();

    // Verify "Mức giá" 4 inline chips
    await expect(page.locator('[role="dialog"] button[aria-label="₫ · Dưới 30k"]')).toBeVisible();
    await expect(page.locator('[role="dialog"] button[aria-label="₫₫ · 30k – 60k"]')).toBeVisible();

    // Verify "Tiện ích phổ biến" inline chips
    await expect(page.locator('[role="dialog"] button[aria-label="Cà phê phin"]')).toBeVisible();

    // Verify disabled radius state displays "Không giới hạn"
    await expect(page.locator('[role="dialog"]').getByText('Không giới hạn')).toBeVisible();

    // Verify NO popovers are rendered inside or alongside the sheet
    expect(await page.locator('[role="dialog"] [data-radix-popper-content-wrapper]').count()).toBe(0);

    // Verify touch target height >= 44px on sheet interactive elements
    const openNowBox = await page.locator('[role="dialog"] button[aria-label="Lọc quán đang mở cửa"]').boundingBox();
    expect(openNowBox?.height).toBeGreaterThanOrEqual(44);

    // Segmented control buttons in section g
    const distSortBtn = page.locator('[role="dialog"] [role="radiogroup"][aria-label="Sắp xếp theo"] button:has-text("Khoảng cách")');
    const ratingSortBtn = page.locator('[role="dialog"] [role="radiogroup"][aria-label="Sắp xếp theo"] button:has-text("Đánh giá")');
    await expect(distSortBtn).toBeVisible();
    await expect(ratingSortBtn).toBeVisible();

    // Footer buttons: Đặt lại (outline) & Áp dụng (primary)
    const resetBtn = page.locator('[role="dialog"] button:has-text("Đặt lại")');
    await expect(resetBtn).toBeVisible();
    const applyBtn = page.getByRole('button', { name: /Áp dụng/i });
    await expect(applyBtn).toBeVisible();

    // No horizontal scroll inside sheet at 320px
    let isSheetOverflowing = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const body = dialog?.querySelector('.overflow-y-auto');
      if (!dialog || !body) return false;
      return dialog.scrollWidth > dialog.clientWidth || body.scrollWidth > body.clientWidth;
    });
    expect(isSheetOverflowing).toBe(false);

    // Verify Apply button is fully visible within 320x600 viewport
    const applyBox320 = await applyBtn.boundingBox();
    expect(applyBox320).not.toBeNull();
    expect(applyBox320!.y).toBeGreaterThan(0);
    expect(applyBox320!.y + applyBox320!.height).toBeLessThanOrEqual(600);

    // Test ✕ close button
    await closeBtn.click();
    await expect(sheetTitle).toBeHidden();
    await expect(bottomNav).toBeVisible();

    // Reopen sheet
    await filterBtn.click();
    await expect(sheetTitle).toBeVisible();

    // Toggle "Đang mở cửa" chip inside sheet
    const sheetOpenNowChip = page.locator('[role="dialog"] button[aria-label="Lọc quán đang mở cửa"]');
    await expect(sheetOpenNowChip).toBeVisible();
    await sheetOpenNowChip.click();

    // Switch sort to "Đánh giá"
    await ratingSortBtn.click();

    // Apply button closes the sheet
    await applyBtn.click();
    await expect(sheetTitle).toBeHidden();

    // TASK 3: BottomNav is restored after sheet closes
    await expect(bottomNav).toBeVisible();

    // Verify badge on "Bộ lọc" button updates (openNow + ratingSort = 2)
    await expect(filterBtn.locator('span', { hasText: '2' })).toBeVisible();

    // TASK 1: Verify active-filter chips row appears with removable chips
    const activeChipsRow = page.locator('[role="region"][aria-label="Các bộ lọc đang áp dụng"]');
    await expect(activeChipsRow).toBeVisible();
    const openNowChipDismiss = activeChipsRow.locator('button[aria-label="Xóa bộ lọc Mở cửa"]');
    await expect(openNowChipDismiss).toBeVisible();

    // Tapping ✕ removes that specific filter without opening the sheet
    await openNowChipDismiss.click();
    await expect(openNowChipDismiss).toBeHidden();
    // Badge drops to 1
    await expect(filterBtn.locator('span', { hasText: '1' })).toBeVisible();

    // Remove the remaining "Đánh giá" filter chip
    const sortChipDismiss = activeChipsRow.locator('button[aria-label="Xóa bộ lọc Đánh giá"]');
    await expect(sortChipDismiss).toBeVisible();
    await sortChipDismiss.click();
    // Entire row hides when count reaches 0
    await expect(activeChipsRow).toBeHidden();

    // TASK 2: Verify mobile floating pill FAB above BottomNav
    const mobileAddBar = page.locator('.md\\:hidden button[aria-label="Thêm quán cà phê mới"]');
    await expect(mobileAddBar).toBeVisible();
    const addBarBox = await mobileAddBar.boundingBox();
    const initialBottomNavBox = await bottomNav.boundingBox();
    expect(addBarBox).not.toBeNull();
    expect(initialBottomNavBox).not.toBeNull();
    // At 320px (< 360px xs breakpoint), text is hidden and FAB forms a compact circle/pill >= 48x48
    expect(addBarBox!.height).toBeGreaterThanOrEqual(48);
    expect(addBarBox!.width).toBeGreaterThanOrEqual(48);
    // Verify FAB bottom edge clears BottomNav top edge by ~8-12px
    const fabBottomNavGap = initialBottomNavBox!.y - (addBarBox!.y + addBarBox!.height);
    expect(fabBottomNavGap).toBeGreaterThanOrEqual(7);
    expect(fabBottomNavGap).toBeLessThanOrEqual(14);

    // TASK 1 & 4: Verify last card is fully tappable and status pill rests fully above BottomNav
    const cards = page.locator('[class*="card-glow-border"]');
    await cards.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
    if ((await cards.count()) > 0) {
      // Verify mobile standard card compact 112px height
      const firstBox = await cards.first().boundingBox();
      expect(firstBox).not.toBeNull();
      expect(firstBox!.height).toBe(112);

      // Verify status pill and single-line address are rendered
      await expect(cards.first().locator('.md\\:hidden').getByText(/mở cửa|đóng cửa/i)).toBeVisible();

      // Scroll until reaching the true bottom of the document
      await page.evaluate(async () => {
        let prevHeight = 0;
        let attempts = 0;
        while (attempts < 8) {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 150));
          if (document.documentElement.scrollHeight === prevHeight) {
            break;
          }
          prevHeight = document.documentElement.scrollHeight;
          attempts++;
        }
      });
      await page.waitForTimeout(200);

      const lastCard = cards.last();
      await expect(lastCard).toBeVisible();

      // P0: Verify last card (including status pill) rests fully ABOVE BottomNav with generous clearance
      const lastCardBottomInViewport = await lastCard.evaluate((el) => el.getBoundingClientRect().bottom);
      const bottomNavTopInViewport = await bottomNav.evaluate((el) => el.getBoundingClientRect().top);
      expect(lastCardBottomInViewport).toBeLessThanOrEqual(bottomNavTopInViewport);

      // Ensure last card receives click without being blocked
      await lastCard.click();
    }

    // 3. Test at 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await assertNoHorizontalScroll(page);
    await expect(bottomNav).toBeVisible();
    await expect(filterBtn).toBeVisible();
    await assertTapTarget(filterBtn, 44);
    await assertTapTarget(mobileAddBar, 44);
    await assertNoOverlap(bottomNav, mobileAddBar);

    // Open sheet at 390px - FAB and BottomNav must be hidden
    await filterBtn.click();
    await expect(bottomNav).toBeHidden();
    await expect(mobileAddBar).toBeHidden();
    await expect(applyBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();

    isSheetOverflowing = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const body = dialog?.querySelector('.overflow-y-auto');
      if (!dialog || !body) return false;
      return dialog.scrollWidth > dialog.clientWidth || body.scrollWidth > body.clientWidth;
    });
    expect(isSheetOverflowing).toBe(false);

    const applyBox390 = await applyBtn.boundingBox();
    expect(applyBox390).not.toBeNull();
    expect(applyBox390!.y + applyBox390!.height).toBeLessThanOrEqual(844);

    await applyBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeHidden();
    await expect(bottomNav).toBeVisible();
    await expect(mobileAddBar).toBeVisible();
    // At 390px (>= 360px xs breakpoint), text "Thêm quán" is visible
    await expect(mobileAddBar).toHaveText(/Thêm quán/);

    // Verify card height and last card tappable at 390px
    if ((await cards.count()) > 0) {
      const firstCard390Box = await cards.first().boundingBox();
      expect(firstCard390Box).not.toBeNull();
      expect(firstCard390Box!.height).toBe(112);

      // Scroll until reaching the true bottom of the document
      await page.evaluate(async () => {
        let prevHeight = 0;
        let attempts = 0;
        while (attempts < 8) {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 150));
          if (document.documentElement.scrollHeight === prevHeight) {
            break;
          }
          prevHeight = document.documentElement.scrollHeight;
          attempts++;
        }
      });
      await page.waitForTimeout(200);
      const lastCard390 = cards.last();
      await expect(lastCard390).toBeVisible();

      // P0: Verify last card rests fully ABOVE BottomNav with generous clearance
      const lastCard390BottomInViewport = await lastCard390.evaluate((el) => el.getBoundingClientRect().bottom);
      const bottomNav390TopInViewport = await bottomNav.evaluate((el) => el.getBoundingClientRect().top);
      expect(lastCard390BottomInViewport).toBeLessThanOrEqual(bottomNav390TopInViewport);

      await lastCard390.click();
    }

    // 4. Test at 640px (sm mobile landscape / large mobile)
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto('/');

    isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
    await expect(filterBtn).toBeVisible();

    await filterBtn.click();
    await expect(sheetTitle).toBeVisible();
    await expect(bottomNav).toBeHidden();
    await expect(applyBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();

    isSheetOverflowing = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const body = dialog?.querySelector('.overflow-y-auto');
      if (!dialog || !body) return false;
      return dialog.scrollWidth > dialog.clientWidth || body.scrollWidth > body.clientWidth;
    });
    expect(isSheetOverflowing).toBe(false);

    await applyBtn.click();
    await expect(sheetTitle).toBeHidden();
    await expect(bottomNav).toBeVisible();
  });

  test('responsive verification at 768px tablet portrait viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verify Header height remains h-14 (56px) across breakpoints
    const header = page.locator('header.sticky-header');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBe(56);

    // Verify theme toggle is visible and hamburger is hidden on tablet (>= md)
    const themeToggle = header.locator('button[aria-label*="giao diện"]');
    await expect(themeToggle).toBeVisible();
    const hamburger = header.locator('button[aria-label="Mở menu"]');
    await expect(hamburger).toBeHidden();
    await expect(page.getByText('Menu PhinFind')).toBeHidden();

    // Mobile "Bộ lọc" button should be hidden on tablet
    const mobileFilterBtn = page.locator('button[aria-label="Mở bộ lọc tìm kiếm"]');
    await expect(mobileFilterBtn).toBeHidden();

    // Desktop/Tablet inline filter row should be visible
    const inlineFilterChip = page.locator('.hidden.md\\:block button[aria-label="Lọc quán đang mở cửa"]');
    await expect(inlineFilterChip).toBeVisible();

    // Desktop FAB should be visible, mobile sticky bar should be hidden
    const desktopFab = page.locator('.hidden.md\\:block button[aria-label="Thêm quán cà phê mới"]');
    await expect(desktopFab).toBeVisible();
    await expect(desktopFab).toHaveText(/Thêm quán/);
    const mobileStickyBar = page.locator('.md\\:hidden button[aria-label="Thêm quán cà phê mới"]');
    await expect(mobileStickyBar).toBeHidden();

    // Verify vertical gap below header is ~24px (pt-6)
    const filterCard768 = page.locator('div.hidden.md\\:block.bg-gradient-to-b');
    const filterCard768Box = await filterCard768.boundingBox();
    expect(filterCard768Box).not.toBeNull();
    const gap768 = filterCard768Box!.y - (headerBox!.y + headerBox!.height);
    expect(gap768).toBeGreaterThanOrEqual(20);
    expect(gap768).toBeLessThanOrEqual(36);

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('responsive verification at 1024px tablet landscape viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const mobileFilterBtn = page.locator('button[aria-label="Mở bộ lọc tìm kiếm"]');
    await expect(mobileFilterBtn).toBeHidden();

    const inlineFilterChip = page.locator('.hidden.md\\:block button[aria-label="Lọc quán đang mở cửa"]');
    await expect(inlineFilterChip).toBeVisible();

    // Verify hamburger is hidden on 1024px tablet landscape
    const hamburger1024 = page.locator('header.sticky-header button[aria-label="Mở menu"]');
    await expect(hamburger1024).toBeHidden();
    await expect(page.getByText('Menu PhinFind')).toBeHidden();

    const desktopFab1024 = page.locator('.hidden.md\\:block button[aria-label="Thêm quán cà phê mới"]');
    await expect(desktopFab1024).toBeVisible();
    const mobileStickyBar1024 = page.locator('.md\\:hidden button[aria-label="Thêm quán cà phê mới"]');
    await expect(mobileStickyBar1024).toBeHidden();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('responsive verification at 1280px desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Verify Header height remains h-14 (56px) on desktop
    const header = page.locator('header.sticky-header');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBe(56);

    // Verify theme toggle is visible and hamburger is hidden on desktop (>= md)
    const themeToggle = header.locator('button[aria-label*="giao diện"]');
    await expect(themeToggle).toBeVisible();
    const hamburger = header.locator('button[aria-label="Mở menu"]');
    await expect(hamburger).toBeHidden();
    await expect(page.getByText('Menu PhinFind')).toBeHidden();

    // Verify vertical gap below header is ~32px (md:pt-8)
    const filterCard1280 = page.locator('div.hidden.md\\:block.bg-gradient-to-b');
    const filterCard1280Box = await filterCard1280.boundingBox();
    expect(filterCard1280Box).not.toBeNull();
    const gap1280 = filterCard1280Box!.y - (headerBox!.y + headerBox!.height);
    expect(gap1280).toBeGreaterThanOrEqual(28);
    expect(gap1280).toBeLessThanOrEqual(36);

    const mobileFilterBtn = page.locator('button[aria-label="Mở bộ lọc tìm kiếm"]');
    await expect(mobileFilterBtn).toBeHidden();

    const inlineFilterChip = page.locator('.hidden.md\\:block button[aria-label="Lọc quán đang mở cửa"]');
    await expect(inlineFilterChip).toBeVisible();

    const desktopFab1280 = page.locator('.hidden.md\\:block button[aria-label="Thêm quán cà phê mới"]');
    await expect(desktopFab1280).toBeVisible();
    const mobileStickyBar1280 = page.locator('.md\\:hidden button[aria-label="Thêm quán cà phê mới"]');
    await expect(mobileStickyBar1280).toBeHidden();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test('map page remains full-bleed with zero padding and verifies responsive controls', async ({ page }) => {
    // 1. Mobile (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/map');
    await assertNoHorizontalScroll(page);
    const main = page.locator('main');
    await expect(main).toHaveClass(/p-0/);
    await expect(main).toHaveClass(/m-0/);
    await expect(main).toHaveClass(/h-full/);
    await expect(main).toHaveClass(/overflow-hidden/);

    // Verify FAB and filter trigger are visible
    const fab = page.locator('button[aria-label="Thêm quán cà phê mới"]');
    await expect(fab).toBeVisible();
    const filterBtn = page.locator('button:has-text("Bộ lọc")');
    await expect(filterBtn).toBeVisible();

    const bottomNav = page.locator('nav.md\\:hidden');
    await expect(bottomNav).toBeVisible();
    await assertNoOverlap(bottomNav, fab);
    await assertTapTarget(fab, 44);

    // Verify filter sheet opens as bottom sheet on mobile
    await filterBtn.click();
    const filterSheet = page.locator('[role="dialog"]');
    await expect(filterSheet).toBeVisible();
    await expect(filterSheet).toHaveClass(/rounded-t-\[28px\]/);
    await page.keyboard.press('Escape');
    await expect(filterSheet).toBeHidden();

    // 2. Desktop (1024px)
    await page.setViewportSize({ width: 1024, height: 768 });
    await assertNoHorizontalScroll(page);
    await filterBtn.click();
    await expect(filterSheet).toBeVisible();
    await expect(filterSheet).toHaveClass(/border-l/);
    await page.keyboard.press('Escape');
    await expect(filterSheet).toBeHidden();
  });

  test('mobile featured hero card rendering, constraints, and interaction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const cards = page.locator('[class*="card-glow-border"]');
    await cards.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // First card must always be standard 1x1 (112px tall)
      const firstCardBox = await cards.first().boundingBox();
      expect(firstCardBox).not.toBeNull();
      expect(firstCardBox!.height).toBe(112);

      // Check for featured cards in the loaded list
      const featuredBadges = page.locator('[aria-label="Quán nổi bật"]');
      const featuredCount = await featuredBadges.count();

      // Featured cards are capped at 25% of total cards
      expect(featuredCount).toBeLessThanOrEqual(Math.floor(cardCount * 0.25));

      if (featuredCount > 0) {
        const firstFeaturedCard = page.locator('.col-span-1.row-span-3').first();
        await expect(firstFeaturedCard).toBeVisible();

        // 1x3 featured hero card height should be ~400px (3 * 124 + 2 * 14 gap = 400px)
        const heroBox = await firstFeaturedCard.boundingBox();
        expect(heroBox).not.toBeNull();
        expect(heroBox!.height).toBeGreaterThanOrEqual(365);
        expect(heroBox!.height).toBeLessThanOrEqual(415);

        // Verify NO text is overlaid on the image block in the mobile featured card
        const imageOverlayText = firstFeaturedCard.locator('.aspect-\\[16\\/10\\]').getByText('LỰA CHỌN NỔI BẬT');
        await expect(imageOverlayText).toHaveCount(0);

        // Verify the editorial label is rendered in the content block below the image
        await expect(firstFeaturedCard.getByText('LỰA CHỌN NỔI BẬT')).toBeVisible();

        // Featured card contains dual action buttons: "Chỉ đường" and "Xem chi tiết"
        const navButton = firstFeaturedCard.locator('button:has-text("Chỉ đường")');
        const detailButton = firstFeaturedCard.locator('button:has-text("Xem chi tiết")');
        await expect(navButton).toBeVisible();
        await expect(detailButton).toBeVisible();

        // Verify touch targets for action buttons are >= 44px
        const navBox = await navButton.boundingBox();
        const detailBox = await detailButton.boundingBox();
        expect(navBox?.height).toBeGreaterThanOrEqual(44);
        expect(detailBox?.height).toBeGreaterThanOrEqual(44);

        // Verify no two featured cards are adjacent
        for (let i = 0; i < cardCount - 1; i++) {
          const isCurrFeatured = (await cards.nth(i).getAttribute('class'))?.includes('row-span-3');
          const isNextFeatured = (await cards.nth(i + 1).getAttribute('class'))?.includes('row-span-3');
          expect(Boolean(isCurrFeatured && isNextFeatured)).toBe(false);
        }
      }
    }
  });

  test('mobile header has no hamburger menu and relies on bottom nav (< md)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const hamburger = page.locator('header.sticky-header button[aria-label="Mở menu"]');
    await expect(hamburger).toBeHidden();

    // Verify all primary mobile destinations exist in BottomNav
    const bottomNav = page.locator('nav.md\\:hidden');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Khám phá' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Bản đồ' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Đã lưu' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Hồ sơ' })).toBeVisible();
  });
});

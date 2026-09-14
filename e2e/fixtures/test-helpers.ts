import { test as base, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_TEST_URL = process.env.SUPABASE_TEST_URL;
export const SUPABASE_TEST_SECRET = process.env.SUPABASE_TEST_SECRET;

export const hasSupabaseCredentials = Boolean(
  SUPABASE_TEST_URL &&
  SUPABASE_TEST_SECRET &&
  !SUPABASE_TEST_URL.includes('placeholder')
);

export function getTestSupabaseAdmin() {
  if (!hasSupabaseCredentials) return null;
  return createClient(SUPABASE_TEST_URL!, SUPABASE_TEST_SECRET!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

export async function createTestUser(emailPrefix = 'test'): Promise<TestUser | null> {
  const admin = getTestSupabaseAdmin();
  if (!admin) return null;

  const email = `${emailPrefix}+${Date.now()}@phinfind.test`;
  const password = `PhinFind!Pass${Math.random().toString(36).slice(2)}123`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    console.warn('[test-helpers] Failed to create test user:', error);
    return null;
  }

  return {
    id: data.user.id,
    email,
    password,
  };
}

export async function deleteTestUser(userId: string): Promise<void> {
  const admin = getTestSupabaseAdmin();
  if (!admin || !userId) return;

  try {
    await admin.auth.admin.deleteUser(userId);
  } catch (err) {
    console.warn('[test-helpers] Error deleting test user:', err);
  }
}

export const test = base;
export { expect };

/**
 * RESPONSIVE ASSERTION:
 * Asserts document.documentElement.scrollWidth does not exceed viewport clientWidth (+1px tolerance for subpixel rendering).
 */
export async function assertNoHorizontalScroll(page: import('@playwright/test').Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

/**
 * RESPONSIVE ASSERTION:
 * For primary CTAs at < md viewports, asserts getBoundingClientRect().height >= 44px.
 */
export async function assertTapTarget(
  locator: import('@playwright/test').Locator,
  minHeight = 44
) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(minHeight);
}

/**
 * RESPONSIVE ASSERTION:
 * Asserts that two locators (e.g. BottomNav and FAB) do not visually intersect / collide.
 */
export async function assertNoOverlap(
  locator1: import('@playwright/test').Locator,
  locator2: import('@playwright/test').Locator
) {
  const box1 = await locator1.boundingBox();
  const box2 = await locator2.boundingBox();
  if (!box1 || !box2) return;
  const xOverlap =
    Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
  const yOverlap =
    Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
  const overlaps = xOverlap > 0 && yOverlap > 0;
  expect(overlaps).toBe(false);
}

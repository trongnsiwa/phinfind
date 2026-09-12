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

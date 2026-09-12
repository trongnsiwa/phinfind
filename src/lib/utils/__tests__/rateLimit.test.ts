import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../rateLimit';

describe('rateLimit Utility', () => {
  it('allows requests within the specified limit', () => {
    const key = `user_allow_${Date.now()}`;
    const res1 = checkRateLimit(key, 3, 5000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, 3, 5000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, 3, 5000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('rejects requests exceeding the specified limit', () => {
    const key = `user_block_${Date.now()}`;
    checkRateLimit(key, 2, 5000);
    checkRateLimit(key, 2, 5000);

    const blocked = checkRateLimit(key, 2, 5000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.reset).toBeGreaterThan(0);
  });
});

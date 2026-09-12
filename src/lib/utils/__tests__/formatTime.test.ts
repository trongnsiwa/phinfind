import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../formatTime';

describe('formatTime Utility (FEAT-04)', () => {
  const BASE_TIME = new Date('2026-09-12T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string when iso is invalid or empty', () => {
    expect(formatRelativeTime('')).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });

  it('returns "Vừa xong" for timestamps less than 60 seconds ago or slight clock skew', () => {
    const thirtySecAgo = new Date(BASE_TIME.getTime() - 30 * 1000).toISOString();
    expect(formatRelativeTime(thirtySecAgo)).toBe('Vừa xong');

    const futureSkew = new Date(BASE_TIME.getTime() + 5 * 1000).toISOString();
    expect(formatRelativeTime(futureSkew)).toBe('Vừa xong');
  });

  it('returns "N phút trước" for timestamps between 1 and 59 minutes ago', () => {
    const fiveMinAgo = new Date(BASE_TIME.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5 phút trước');

    const fiftyNineMinAgo = new Date(BASE_TIME.getTime() - 59 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiftyNineMinAgo)).toBe('59 phút trước');
  });

  it('returns "N giờ trước" for timestamps earlier today (< 24 hours)', () => {
    const twoHoursAgo = new Date(BASE_TIME.getTime() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 giờ trước');
  });

  it('returns "Hôm qua" for yesterday', () => {
    const yesterday = new Date(BASE_TIME.getTime() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe('Hôm qua');
  });

  it('returns "N ngày trước" for 2-6 days ago', () => {
    const threeDaysAgo = new Date(BASE_TIME.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 ngày trước');

    const sixDaysAgo = new Date(BASE_TIME.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(sixDaysAgo)).toBe('6 ngày trước');
  });

  it('returns formatted dd/MM/yyyy date for 7+ days ago', () => {
    const tenDaysAgo = new Date('2026-09-02T12:00:00.000Z').toISOString();
    expect(formatRelativeTime(tenDaysAgo)).toMatch(/02\/09\/2026/);
  });
});

import { describe, it, expect } from 'vitest';
import { buildShareTargets } from '../share';

describe('buildShareTargets', () => {
  it('returns targets in the exact expected order: facebook, x, zalo, telegram, copy', () => {
    const targets = buildShareTargets('https://phinfind.vn/shop/123', 'PhinFind Cafe');
    const ids = targets.map((t) => t.id);
    expect(ids).toEqual(['facebook', 'x', 'zalo', 'telegram', 'copy']);
  });

  it('provides expected labels for each target', () => {
    const targets = buildShareTargets('https://phinfind.vn/shop/123', 'PhinFind Cafe');
    expect(targets.map((t) => t.label)).toEqual([
      'Facebook',
      'X (Twitter)',
      'Zalo',
      'Telegram',
      'Sao chép liên kết'
    ]);
  });

  it('correctly encodes special characters, spaces, and Vietnamese diacritics in url and title', () => {
    const testUrl = 'https://phinfind.vn/shop/test-123?utm_source=share&filter=cà phê#reviews';
    const testTitle = 'Cà Phê "Đắk Lắk" & Trà Sữa (Special 100%)';

    const targets = buildShareTargets(testUrl, testTitle);

    const encodedUrl = encodeURIComponent(testUrl);
    const encodedTitle = encodeURIComponent(testTitle);

    // Facebook
    const fb = targets.find((t) => t.id === 'facebook');
    expect(fb?.href).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
    expect(fb?.href).not.toContain(' ');
    expect(fb?.href).not.toContain('"');

    // X (Twitter)
    const x = targets.find((t) => t.id === 'x');
    expect(x?.href).toBe(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    );

    // Zalo
    const zalo = targets.find((t) => t.id === 'zalo');
    expect(zalo?.href).toBe(`https://zalo.me/share?u=${encodedUrl}`);

    // Telegram
    const telegram = targets.find((t) => t.id === 'telegram');
    expect(telegram?.href).toBe(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    );
  });

  it('contains the expected hostnames and schemes for each social platform', () => {
    const url = 'https://phinfind.vn/shop/saigon-roastery';
    const title = 'Saigon Roastery';
    const targets = buildShareTargets(url, title);

    const fb = targets.find((t) => t.id === 'facebook');
    expect(new URL(fb!.href!).hostname).toBe('www.facebook.com');

    const x = targets.find((t) => t.id === 'x');
    expect(new URL(x!.href!).hostname).toBe('twitter.com');

    const zalo = targets.find((t) => t.id === 'zalo');
    expect(new URL(zalo!.href!).hostname).toBe('zalo.me');
    expect(new URL(zalo!.href!).pathname).toBe('/share');

    const tg = targets.find((t) => t.id === 'telegram');
    expect(new URL(tg!.href!).hostname).toBe('t.me');
  });

  it('ensures copy-link sentinel has no href', () => {
    const targets = buildShareTargets('https://phinfind.vn/shop/123', 'Sample');
    const copyTarget = targets.find((t) => t.id === 'copy');
    expect(copyTarget).toBeDefined();
    expect(copyTarget?.href).toBeUndefined();
  });
});

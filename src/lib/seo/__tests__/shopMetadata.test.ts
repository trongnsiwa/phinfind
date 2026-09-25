import { describe, it, expect, vi } from 'vitest';

const { mockRedirect, mockNotFound } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (url: string, type?: any) => {
    mockRedirect(url, type);
    throw new Error('NEXT_REDIRECT');
  },
  RedirectType: { replace: 'replace', push: 'push' },
}));

import ShopDetailPage, {
  cleanAddress,
  cleanCategories,
  truncateToLimit,
  buildShopDescription,
  generateMetadata,
} from '@/../app/(main)/shop/[id]/page';
import type { CoffeeShop } from '@/types/shop';
import * as shopDetailModule from '@/lib/supabase/shop-detail';

describe('Shop Detail Metadata & SEO', () => {
  describe('cleanAddress', () => {
    it('strips 00084 and Vietnam tokens', () => {
      const raw = '27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh, 00084, Vietnam';
      expect(cleanAddress(raw)).toBe('27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh');
    });

    it('strips 5-6 digit postal codes and Việt Nam suffix', () => {
      const raw = '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội 100000, Việt Nam';
      expect(cleanAddress(raw)).toBe('39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội');
    });

    it('strips leading shop name from address to avoid duplicate names', () => {
      const shopName = 'The Workshop Coffee';
      const raw = 'The Workshop Coffee, 27 Ngô Đức Kế, Quận 1, TP.HCM, 00084';
      expect(cleanAddress(raw, shopName)).toBe('27 Ngô Đức Kế, Quận 1, TP.HCM');
    });

    it('returns empty string for missing or placeholder addresses', () => {
      expect(cleanAddress(null)).toBe('');
      expect(cleanAddress('')).toBe('');
      expect(cleanAddress('Address unavailable')).toBe('');
      expect(cleanAddress('Chưa có địa chỉ')).toBe('');
    });
  });

  describe('cleanCategories', () => {
    it('maps known slugs to Vietnamese and filters out junk tokens', () => {
      const categories = [
        'catering.cafe',
        'building',
        'specialty_coffee',
        'catering',
        'air_conditioned',
        'commercial',
      ];
      const result = cleanCategories(categories);
      expect(result).toEqual(['Cà phê phin', 'Cà phê đặc sản', 'Máy lạnh']);
      expect(result).not.toContain('building');
      expect(result).not.toContain('catering');
      expect(result).not.toContain('commercial');
    });

    it('returns empty array when all categories are generic', () => {
      const categories = ['cafe', 'coffee', 'building', 'catering', 'catering.restaurant'];
      expect(cleanCategories(categories)).toEqual([]);
    });
  });

  describe('truncateToLimit', () => {
    it('preserves text when length is within limit', () => {
      const text = 'Khám phá quán cà phê trên PhinFind.';
      expect(truncateToLimit(text, 155)).toBe(text);
    });

    it('truncates at word boundary under limit without cutting words in half', () => {
      const text =
        'Khám phá The Workshop tại 27 Ngô Đức Kế, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh. Quán có không gian rộng rãi thoáng mát và cà phê cực kỳ ngon với các loại hạt cao cấp.';
      const result = truncateToLimit(text, 155);
      expect(result.length).toBeLessThanOrEqual(155);
      expect(result.endsWith('...')).toBe(true);
      const textBeforeEllipsis = result.slice(0, -3);
      expect(text.startsWith(textBeforeEllipsis)).toBe(true);
      // Ensure it cut at a space rather than cutting a word in half
      expect(text[textBeforeEllipsis.length]).toBe(' ');
    });
  });

  describe('buildShopDescription', () => {
    it('produces a natural Vietnamese sentence within 155 characters', () => {
      const shop: CoffeeShop = {
        id: 'shop-1',
        place_id: 'shop-1',
        name: 'The Workshop',
        address: '27 Ngô Đức Kế, Bến Nghé, Quận 1, Hồ Chí Minh, 00084, Vietnam',
        rating: 4.6,
        categories: ['catering.cafe', 'specialty_coffee', 'high_speed_wifi'],
        lat: 10.77,
        lon: 106.7,
        distance: 100,
        distance_text: '0.1 km',
        total_ratings: 120,
      };

      const desc = buildShopDescription(shop);
      expect(desc.length).toBeLessThanOrEqual(155);
      expect(desc).toContain('The Workshop');
      expect(desc).toContain('27 Ngô Đức Kế');
      expect(desc).not.toContain('00084');
      expect(desc).not.toContain('Vietnam');
      expect(desc).not.toContain('catering');
      expect(desc).not.toContain('catering.cafe');
      expect(desc).toContain('4.6/5★');
      expect(desc).toContain('PhinFind');
    });

    it('does not repeat shop name if address begins with shop name', () => {
      const shop: CoffeeShop = {
        id: 'shop-2',
        place_id: 'shop-2',
        name: 'Cà phê Giảng',
        address: 'Cà phê Giảng, 39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội, 00084',
        rating: 4.8,
        categories: ['catering.cafe'],
        lat: 21.03,
        lon: 105.85,
        distance: 200,
        distance_text: '0.2 km',
        total_ratings: 500,
      };

      const desc = buildShopDescription(shop);
      // Count occurrences of "Cà phê Giảng"
      const occurrences = desc.split('Cà phê Giảng').length - 1;
      expect(occurrences).toBe(1);
    });

    it('omits Đặc trưng line entirely when no valid categories remain', () => {
      const shop: CoffeeShop = {
        id: 'shop-3',
        place_id: 'shop-3',
        name: 'Quán Gió',
        address: '12 Tràng Tiền, Hoàn Kiếm, Hà Nội',
        rating: 4.2,
        categories: ['building', 'cafe', 'coffee', 'catering'],
        lat: 21.02,
        lon: 105.85,
        distance: 300,
        distance_text: '0.3 km',
        total_ratings: 15,
      };

      const desc = buildShopDescription(shop);
      expect(desc).not.toContain('Đặc trưng');
      expect(desc).not.toContain('đặc trưng');
      expect(desc).not.toContain('building');
      expect(desc).toContain('Đánh giá 4.2/5★');
      expect(desc.length).toBeLessThanOrEqual(155);
    });

    it('falls back to generic Vietnamese description when address is sparse', () => {
      const shop: CoffeeShop = {
        id: 'shop-4',
        place_id: 'shop-4',
        name: 'Cà phê Mộc',
        address: '',
        rating: 0,
        categories: [],
        lat: 0,
        lon: 0,
        distance: 0,
        distance_text: '0 km',
        total_ratings: 0,
      };

      const desc = buildShopDescription(shop);
      expect(desc).toContain('Cà phê Mộc');
      expect(desc).toContain('PhinFind');
      expect(desc.length).toBeLessThanOrEqual(155);
    });

    it('hard-caps long text at <= 155 characters', () => {
      const shop: CoffeeShop = {
        id: 'shop-5',
        place_id: 'shop-5',
        name: 'Quán Cà Phê Trải Nghiệm Phong Cách Hiện Đại Và Cổ Điển Rất Dài',
        address:
          'Tầng 12, Tòa Nhà Thương Mại Dịch Vụ Phức Hợp, Số 9999 Đại Lộ Nguyễn Văn Linh, Phường Tân Phong, Quận 7, Thành phố Hồ Chí Minh, 00084, Vietnam',
        rating: 4.9,
        categories: ['catering.cafe', 'specialty_coffee', 'high_speed_wifi', 'quiet_workspace'],
        lat: 10.73,
        lon: 106.71,
        distance: 500,
        distance_text: '0.5 km',
        total_ratings: 200,
      };

      const desc = buildShopDescription(shop);
      expect(desc.length).toBeLessThanOrEqual(155);
      expect(desc).toContain('PhinFind');
    });

    it('cleans Cloud Coffee and Highlands Coffee without leaking slugs or postal codes', () => {
      const cloudCoffee: CoffeeShop = {
        id: 'cloud-coffee',
        place_id: 'cloud-coffee',
        name: 'Cloud Coffee',
        address: 'Cloud Coffee, 161, Lương Định Của, Phường Đông Hòa, Dĩ An, 00084, Vietnam',
        rating: 4.5,
        categories: ['building', 'building.catering', 'catering'],
        lat: 10.89,
        lon: 106.78,
        distance: 200,
        distance_text: '0.2 km',
        total_ratings: 10,
      };

      const cloudDesc = buildShopDescription(cloudCoffee);
      expect(cloudDesc.length).toBeLessThanOrEqual(155);
      expect(cloudDesc).not.toMatch(/building|catering|[a-z]+\.[a-z]+/i);
      expect(cloudDesc).not.toContain('00084');
      expect(cloudDesc).not.toContain('Vietnam');
      // No duplicate shop name
      expect(cloudDesc.split('Cloud Coffee').length - 1).toBe(1);

      const highlandsCoffee: CoffeeShop = {
        id: 'highlands-coffee',
        place_id: 'highlands-coffee',
        name: 'Highlands Coffee',
        address:
          'Highlands Coffee, 44, Trang Tien Street, Hoan Kiem Ward, Hà Nội, 11024, Vietnam',
        rating: 4.3,
        categories: ['catering', 'catering.cafe'],
        lat: 21.02,
        lon: 105.85,
        distance: 150,
        distance_text: '0.15 km',
        total_ratings: 80,
      };

      const highlandsDesc = buildShopDescription(highlandsCoffee);
      expect(highlandsDesc.length).toBeLessThanOrEqual(155);
      expect(highlandsDesc).not.toMatch(/building|catering|[a-z]+\.[a-z]+/i);
      expect(highlandsDesc).not.toContain('11024');
      expect(highlandsDesc).not.toContain('Vietnam');
      expect(highlandsDesc).toContain('Cà phê phin');
      // No duplicate shop name
      expect(highlandsDesc.split('Highlands Coffee').length - 1).toBe(1);
    });
  });

  describe('Root Site Identity JSON-LD', () => {
    it('builds valid WebSite JSON-LD with search action pointing to discover page', async () => {
      const { buildWebSiteJsonLd } = await import('@/lib/seo/jsonLd');
      const baseUrl = 'https://phinfind.vercel.app';
      const website = buildWebSiteJsonLd(baseUrl);

      expect(website['@type']).toBe('WebSite');
      expect(website.name).toBe('PhinFind');
      expect(website.alternateName).toBe('PhinFind - Bản đồ Cà phê Việt');
      expect(website.url).toBe(baseUrl);
      expect(website.inLanguage).toBe('vi-VN');
      expect(website.potentialAction).toBeDefined();
    });

    it('builds valid Organization JSON-LD with 512x512 PNG logo', async () => {
      const { buildOrganizationJsonLd } = await import('@/lib/seo/jsonLd');
      const baseUrl = 'https://phinfind.vercel.app';
      const org = buildOrganizationJsonLd(baseUrl) as any;

      expect(org['@type']).toBe('Organization');
      expect(org.name).toBe('PhinFind');
      expect(org.url).toBe(baseUrl);
      expect(org.logo).toEqual({
        '@type': 'ImageObject',
        url: `${baseUrl}/logo-512.png`,
        width: 512,
        height: 512,
      });
      expect(org.areaServed).toBe('VN');
      expect(org.description).toBeDefined();
    });
  });

  describe('generateMetadata', () => {
    it('generates consistent metadata with cleaned descriptions for OG and Twitter', async () => {
      const mockShop: CoffeeShop = {
        id: 'place-abc',
        place_id: 'place-abc',
        name: 'Aroma Cafe',
        address: '88 Phố Huế, Hai Bà Trưng, Hà Nội, 00084, Vietnam',
        rating: 4.5,
        categories: ['catering.cafe', 'building'],
        photos: ['https://example.com/photo.jpg'],
        lat: 21.01,
        lon: 105.85,
        distance: 100,
        distance_text: '0.1 km',
        total_ratings: 40,
      };

      vi.spyOn(shopDetailModule, 'fetchShopForServer').mockResolvedValue(mockShop);

      const meta = await generateMetadata({
        params: Promise.resolve({ id: 'place-abc' }),
      });

      expect(meta.title).toBe('Aroma Cafe | PhinFind');
      expect(meta.description).toBeDefined();
      expect(meta.description!.length).toBeLessThanOrEqual(155);
      expect(meta.description).not.toContain('00084');
      expect(meta.description).not.toContain('building');
      expect(meta.openGraph?.description).toBe(meta.description);
      expect(meta.twitter?.description).toBe(meta.description);
      expect(meta.openGraph?.title).toBe('Aroma Cafe');
      expect(meta.twitter?.title).toBe('Aroma Cafe');
    });
  });

  describe('ShopDetailPage', () => {
    it('redirects to canonical slug URL when accessed via place_id', async () => {
      mockRedirect.mockClear();
      const mockShop: CoffeeShop = {
        id: 'custom_123',
        place_id: 'custom_123',
        slug: 'so-siph-old-bar',
        name: 'SỞ SIPH OLD BAR',
        address: '192 Hẻm 6',
        rating: 5,
        total_ratings: 1,
        lat: 10.8,
        lon: 106.9,
        distance: 0,
        distance_text: '0 m',
        categories: [],
      };

      vi.spyOn(shopDetailModule, 'fetchShopForServer').mockResolvedValue(mockShop);

      await expect(
        ShopDetailPage({
          params: Promise.resolve({ id: 'custom_123' }),
        })
      ).rejects.toThrow('NEXT_REDIRECT');

      expect(mockRedirect).toHaveBeenCalledWith('/shop/so-siph-old-bar', 'replace');
    });

    it('renders without redirecting when accessed via canonical slug', async () => {
      mockRedirect.mockClear();
      const mockShop: CoffeeShop = {
        id: 'custom_123',
        place_id: 'custom_123',
        slug: 'so-siph-old-bar',
        name: 'SỞ SIPH OLD BAR',
        address: '192 Hẻm 6',
        rating: 5,
        total_ratings: 1,
        lat: 10.8,
        lon: 106.9,
        distance: 0,
        distance_text: '0 m',
        categories: [],
      };

      vi.spyOn(shopDetailModule, 'fetchShopForServer').mockResolvedValue(mockShop);

      const result = await ShopDetailPage({
        params: Promise.resolve({ id: 'so-siph-old-bar' }),
      });

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('calls notFound when shop does not exist', async () => {
      mockNotFound.mockClear();
      vi.spyOn(shopDetailModule, 'fetchShopForServer').mockResolvedValue(null);

      await expect(
        ShopDetailPage({
          params: Promise.resolve({ id: 'non-existent' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});


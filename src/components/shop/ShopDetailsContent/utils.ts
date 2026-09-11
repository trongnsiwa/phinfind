import type { CoffeeShop } from '@/types/shop';
import type { ComputedSchedule, DaySchedule, GalleryPhoto } from './types';

export function parseHHMM(timeStr?: string): { hours: number; minutes: number; formatted: string } {
  if (!timeStr) {
    return { hours: 0, minutes: 0, formatted: '--:--' };
  }
  const clean = timeStr.replace(/[^0-9]/g, '').padStart(4, '0');
  const h = parseInt(clean.slice(0, 2), 10);
  const m = parseInt(clean.slice(2, 4), 10);
  if (isNaN(h) || isNaN(m)) {
    return { hours: 0, minutes: 0, formatted: '--:--' };
  }
  const displayH = h < 10 ? `0${h}` : `${h}`;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return {
    hours: h,
    minutes: m,
    formatted: `${displayH}:${displayM}`
  };
}

export function getShopSchedule(openingHours?: CoffeeShop['opening_hours']): ComputedSchedule {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const DAYS_ORDER = [
    { name: 'Thứ Hai', short: 'T2', index: 1 },
    { name: 'Thứ Ba', short: 'T3', index: 2 },
    { name: 'Thứ Tư', short: 'T4', index: 3 },
    { name: 'Thứ Năm', short: 'T5', index: 4 },
    { name: 'Thứ Sáu', short: 'T6', index: 5 },
    { name: 'Thứ Bảy', short: 'T7', index: 6 },
    { name: 'Chủ Nhật', short: 'CN', index: 0 }
  ];

  const periods = openingHours?.periods;

  if (periods && periods.length > 0) {
    const scheduleList: DaySchedule[] = DAYS_ORDER.map((d) => {
      const period = periods.find(
        (p) => p.open.day === d.index || (p.open.day === 0 && d.index === 0)
      );

      if (!period) {
        return {
          dayName: d.name,
          dayShort: d.short,
          dayIndex: d.index,
          isToday: d.index === currentDay,
          timeText: 'Đóng cửa',
          isOpenDay: false
        };
      }

      const openParsed = parseHHMM(period.open.time);
      const closeParsed = parseHHMM(period.close.time);

      return {
        dayName: d.name,
        dayShort: d.short,
        dayIndex: d.index,
        isToday: d.index === currentDay,
        timeText: `${openParsed.formatted} – ${closeParsed.formatted}`,
        isOpenDay: true
      };
    });

    const todayPeriod = periods.find((p) => p.open.day === currentDay);
    let isOpenNow = false;
    let statusText = 'Đã đóng cửa';

    if (todayPeriod) {
      const openTime = parseHHMM(todayPeriod.open.time);
      const closeTime = parseHHMM(todayPeriod.close.time);
      const openMins = openTime.hours * 60 + openTime.minutes;
      const closeMins = closeTime.hours * 60 + closeTime.minutes;

      if (currentMinutes >= openMins && currentMinutes < closeMins) {
        isOpenNow = true;
        statusText = `Đang mở cửa • Đóng cửa lúc ${closeTime.formatted}`;
      } else if (currentMinutes < openMins) {
        isOpenNow = false;
        statusText = `Đã đóng cửa • Mở cửa lúc ${openTime.formatted}`;
      } else {
        isOpenNow = false;
        statusText = 'Đã đóng cửa hôm nay';
      }
    } else {
      isOpenNow = false;
      statusText = 'Đóng cửa hôm nay';
    }

    const todaySchedule = scheduleList.find((s) => s.isToday);

    return {
      isOpenNow,
      statusText,
      scheduleList,
      todaySchedule,
      hasRealSchedule: true,
      isApproximate: false,
      peakVibeTime: undefined
    };
  }

  // When periods are not available: do not fabricate fake hours
  const isOpenNow = openingHours?.open_now;
  const statusText =
    isOpenNow === true
      ? 'Đang mở cửa'
      : isOpenNow === false
        ? 'Đã đóng cửa'
        : 'Chưa có thông tin giờ mở cửa';

  return {
    isOpenNow,
    statusText,
    scheduleList: [],
    todaySchedule: undefined,
    hasRealSchedule: false,
    isApproximate: false,
    peakVibeTime: undefined
  };
}

export interface ReviewPhotoSource {
  images?: string[] | null;
  author?: string | null;
  profiles?: { full_name?: string | null } | null;
}

export function buildGalleryPhotos(
  shop: CoffeeShop,
  reviews: ReviewPhotoSource[] = []
): GalleryPhoto[] {
  const list: GalleryPhoto[] = [];
  const seenUrls = new Set<string>();

  // 1. Official shop photos
  if (shop.photos && shop.photos.length > 0) {
    shop.photos.forEach((url, i) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        list.push({
          url,
          title: `${shop.name} - Ảnh ${i + 1}`,
          category: i === 0 ? 'Nổi bật' : i % 2 === 0 ? 'Không gian' : 'Cà phê',
          isCommunity: false
        });
      }
    });
  }

  // 2. Aggregated review photos from community
  if (reviews && reviews.length > 0) {
    reviews.forEach((rev) => {
      if (rev.images && Array.isArray(rev.images)) {
        rev.images.forEach((imgUrl) => {
          if (imgUrl && !seenUrls.has(imgUrl)) {
            seenUrls.add(imgUrl);
            list.push({
              url: imgUrl,
              title: `${shop.name} - Ảnh từ đánh giá của ${rev.author || rev.profiles?.full_name || 'cộng đồng'}`,
              category: 'Từ đánh giá cộng đồng',
              isCommunity: true
            });
          }
        });
      }
    });
  }

  return list;
}

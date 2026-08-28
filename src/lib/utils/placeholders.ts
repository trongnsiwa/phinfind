export const SHOP_PLACEHOLDER_ILLUSTRATIONS = [
  '/illustrations/coffee-phin.svg',
  '/illustrations/coffee-cup.svg',
  '/illustrations/cozy-table.svg',
  '/illustrations/shop-interior.svg',
  '/illustrations/coffee-beans.svg',
  '/illustrations/outdoor-terrace.svg',
  '/illustrations/takeaway-cup.svg',
  '/illustrations/roastery-corner.svg',
] as const;


export function getShopPlaceholderIllustration(seed?: string): string {
  if (!seed) return SHOP_PLACEHOLDER_ILLUSTRATIONS[0];
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SHOP_PLACEHOLDER_ILLUSTRATIONS[Math.abs(hash) % SHOP_PLACEHOLDER_ILLUSTRATIONS.length];
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'catering.cafe': 'Cà phê phin',
  'catering.coffee_shop': 'Cà phê đặc sản',
  'specialty_coffee': 'Cà phê đặc sản',
  'specialty_drinks': 'Đồ uống đặc sản',
  'bakery_dessert': 'Bánh ngọt',
  'air_conditioned': 'Máy lạnh',
  'high_speed_wifi': 'Wi-Fi tốc độ cao',
  'quiet_workspace': 'Yên tĩnh học tập',
  'private_room': 'Phòng riêng',
  'outdoor_garden': 'Sân vườn',
  'outdoor_seating': 'Không gian ngoài trời',
  'parking_available': 'Chỗ đỗ xe',
  'pet_friendly': 'Thú cưng',
  'open_24_7': 'Mở 24/7',
  'live_music_acoustic': 'Nhạc sống / Acoustic',
  'kids_play_area': 'Khu vui chơi trẻ em',
  'takeaway_service': 'Dịch vụ mang đi',
  'internet_access': 'Wi-Fi tốc độ cao',
  'internet access': 'Wi-Fi tốc độ cao',
  'internet access free': 'Wi-Fi miễn phí',
};

export function cleanCategoryLabel(raw: string): string {
  const normalized = raw.toLowerCase().trim();
  if (CATEGORY_TRANSLATIONS[normalized]) {
    return CATEGORY_TRANSLATIONS[normalized];
  }
  const stripped = raw
    .replace(/^catering\./i, '')
    .replace(/^catering/i, '')
    .replace(/^cafe\./i, '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .trim();

  const lower = stripped.toLowerCase();
  if (CATEGORY_TRANSLATIONS[lower]) {
    return CATEGORY_TRANSLATIONS[lower];
  }
  if (['cafe', 'coffee', 'catering', 'coffee shop', 'internet access', 'cafe coffee'].includes(lower)) {
    return '';
  }
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

export function formatShopCategoryTagline(categories?: string[]): string {
  if (!categories || categories.length === 0) {
    return 'Quán cà phê được yêu thích với hương vị nguyên bản & không gian ấm cúng.';
  }
  const cleaned = categories
    .map(cleanCategoryLabel)
    .filter((c) => c.length > 0);

  if (cleaned.length === 0) {
    return 'Quán cà phê được yêu thích với hương vị nguyên bản & không gian ấm cúng.';
  }
  return `Không gian cà phê với ${cleaned.slice(0, 2).join(' • ')} & trải nghiệm ấm cúng.`;
}

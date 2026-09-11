import type React from 'react';
import {
  Clock,
  Coffee,
  CreditCard,
  Heart,
  Navigation,
  Sparkles,
  Sun,
  Utensils,
  Wifi,
  Wind,
  Zap
} from 'lucide-react';

/**
 * Predefined amenities mapping for display in Shop Details view.
 *
 * NOTE: Amenity IDs here are reused across FEAT-07 (filters) and FEAT-08 (edit suggestions)
 * and must not drift from POPULAR_CATEGORIES in the AddShopDialog constants.
 */
export const PREDEFINED_AMENITIES_MAP: Record<
  string,
  { icon: React.ElementType; title: string; badge: string; desc: string }
> = {
  'catering.cafe': {
    icon: Coffee,
    title: 'Cà phê phin truyền thống',
    badge: 'Đậm đà',
    desc: 'Phục vụ cà phê phin nguyên chất Robusta và Arabica rang mộc truyền thống'
  },
  'catering.cafe.specialty': {
    icon: Coffee,
    title: 'Cà Phê Đặc Sản Specialty',
    badge: 'Chất lượng cao',
    desc: 'Tuyển chọn các mẻ hạt rang thủ công chất lượng cao từ Cầu Đất & Buôn Ma Thuột'
  },
  specialty_coffee: {
    icon: Coffee,
    title: 'Cà phê đặc sản',
    badge: 'Chất lượng cao',
    desc: 'Tuyển chọn các mẻ hạt rang thủ công chất lượng cao từ Cầu Đất & Buôn Ma Thuột'
  },
  wifi: {
    icon: Wifi,
    title: 'Wi-Fi Tốc Độ Cao',
    badge: '100+ Mbps',
    desc: 'Kết nối mạng tốc độ cao tối ưu cho làm việc từ xa, gọi video và lướt web'
  },
  high_speed_wifi: {
    icon: Wifi,
    title: 'Wi-Fi tốc độ cao',
    badge: '100+ Mbps',
    desc: 'Kết nối mạng tốc độ cao 100+ Mbps, ổn định cho làm việc từ xa và giải trí'
  },
  power: {
    icon: Zap,
    title: 'Nhiều Ổ Cắm Điện',
    badge: 'Tại các bàn',
    desc: 'Ổ cắm sạc thuận tiện bố trí tại hầu hết các bàn và góc ngồi'
  },
  air_conditioning: {
    icon: Wind,
    title: 'Không Gian Điều Hòa Mát Lạnh',
    badge: 'Mát mẻ',
    desc: 'Nhiệt độ phòng luôn mát mẻ và dễ chịu quanh năm'
  },
  air_conditioned: {
    icon: Wind,
    title: 'Máy lạnh',
    badge: 'Mát mẻ',
    desc: 'Không gian điều hòa mát lạnh, thoáng đãng và dễ chịu quanh năm'
  },
  outdoor_seating: {
    icon: Sun,
    title: 'Ban Công & Sân Vườn',
    badge: 'Thoáng đãng',
    desc: 'Khu vực bàn ngoài trời thoáng đãng rợp bóng cây xanh'
  },
  outdoor_garden: {
    icon: Sun,
    title: 'Sân vườn',
    badge: 'Thoáng đãng',
    desc: 'Khu vực ngoài trời rợp bóng cây xanh, có quạt hơi nước thoáng mát'
  },
  quiet_space: {
    icon: Sparkles,
    title: 'Không Gian Học Tập & Yên Tĩnh',
    badge: 'Yên tĩnh',
    desc: 'Không gian học tập yên tĩnh, bàn rộng và ánh sáng dịu mắt phù hợp làm việc'
  },
  quiet_workspace: {
    icon: Sparkles,
    title: 'Yên tĩnh học tập',
    badge: 'Yên tĩnh',
    desc: 'Không gian yên tĩnh, bàn rộng, ánh sáng dịu mắt tối ưu cho làm việc và học tập'
  },
  bakery: {
    icon: Utensils,
    title: 'Bánh Ngọt & Đồ Ăn Nhẹ',
    badge: 'Tươi mỗi ngày',
    desc: 'Bánh sừng bò nóng hổi, bánh mì thủ công và bánh ngọt tươi mỗi ngày'
  },
  bakery_dessert: {
    icon: Utensils,
    title: 'Bánh ngọt',
    badge: 'Tươi mỗi ngày',
    desc: 'Bánh ngọt tươi mới mỗi ngày, bánh mì thủ công và đồ ăn nhẹ'
  },
  parking: {
    icon: Navigation,
    title: 'Chỗ Đỗ Xe Thuận Tiện',
    badge: 'Rộng rãi',
    desc: 'Khu vực đỗ xe máy và ô tô thuận tiện, có bảo vệ trông giữ an toàn'
  },
  parking_available: {
    icon: Navigation,
    title: 'Chỗ đỗ xe',
    badge: 'Rộng rãi',
    desc: 'Bãi đỗ xe máy và ô tô thuận tiện, có người trông giữ an toàn'
  },
  pet_friendly: {
    icon: Heart,
    title: 'Thú cưng',
    badge: 'Thân thiện',
    desc: 'Chào đón thú cưng, không gian thân thiện và thoải mái'
  },
  open_24_7: {
    icon: Clock,
    title: 'Mở 24/7',
    badge: '24/7',
    desc: 'Mở cửa phục vụ 24/7 suốt ngày đêm'
  },
  takeaway_service: {
    icon: Coffee,
    title: 'Dịch vụ mang đi',
    badge: 'Nhanh chóng',
    desc: 'Phục vụ mang đi nhanh chóng, đóng gói cẩn thận giữ trọn hương vị'
  },
  'payment.cards': {
    icon: CreditCard,
    title: 'Thanh Toán Không Tiền Mặt',
    badge: 'Đa dạng',
    desc: 'Hỗ trợ VietQR, Apple Pay, chuyển khoản ngân hàng và thẻ Visa/Mastercard'
  }
};

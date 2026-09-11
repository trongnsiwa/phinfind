import {
  Clock,
  Coffee,
  Heart,
  Navigation,
  Sparkles,
  Sun,
  Utensils,
  Wifi,
  Wind
} from 'lucide-react';
import { z } from 'zod';
import type { DayConfig, PredefinedCategoryConfig, PriceOption } from './types';

export const POPULAR_CATEGORIES: PredefinedCategoryConfig[] = [
  {
    id: 'catering.cafe',
    label: 'Cà phê phin',
    icon: Coffee,
    defaultDescription: 'Phục vụ cà phê phin nguyên chất Robusta và Arabica rang mộc truyền thống'
  },
  {
    id: 'specialty_coffee',
    label: 'Cà phê đặc sản',
    icon: Coffee,
    defaultDescription: 'Tuyển chọn các mẻ hạt rang thủ công chất lượng cao từ Cầu Đất & Buôn Ma Thuột'
  },
  {
    id: 'bakery_dessert',
    label: 'Bánh ngọt',
    icon: Utensils,
    defaultDescription: 'Bánh ngọt tươi mới mỗi ngày, bánh mì thủ công và đồ ăn nhẹ'
  },
  {
    id: 'air_conditioned',
    label: 'Máy lạnh',
    icon: Wind,
    defaultDescription: 'Không gian điều hòa mát lạnh, thoáng đãng và dễ chịu quanh năm'
  },
  {
    id: 'high_speed_wifi',
    label: 'Wi-Fi tốc độ cao',
    icon: Wifi,
    defaultDescription: 'Kết nối mạng tốc độ cao 100+ Mbps, ổn định cho làm việc từ xa và giải trí'
  },
  {
    id: 'quiet_workspace',
    label: 'Yên tĩnh học tập',
    icon: Sparkles,
    defaultDescription: 'Không gian yên tĩnh, bàn rộng, ánh sáng dịu mắt tối ưu cho làm việc và học tập'
  },
  {
    id: 'outdoor_garden',
    label: 'Sân vườn',
    icon: Sun,
    defaultDescription: 'Khu vực ngoài trời rợp bóng cây xanh, có quạt hơi nước thoáng mát'
  },
  {
    id: 'parking_available',
    label: 'Chỗ đỗ xe',
    icon: Navigation,
    defaultDescription: 'Bãi đỗ xe máy và ô tô thuận tiện, có người trông giữ an toàn'
  },
  {
    id: 'pet_friendly',
    label: 'Thú cưng',
    icon: Heart,
    defaultDescription: 'Chào đón thú cưng, không gian thân thiện và thoải mái'
  },
  {
    id: 'open_24_7',
    label: 'Mở 24/7',
    icon: Clock,
    defaultDescription: 'Mở cửa phục vụ 24/7 suốt ngày đêm'
  },
  {
    id: 'takeaway_service',
    label: 'Dịch vụ mang đi',
    icon: Coffee,
    defaultDescription: 'Phục vụ mang đi nhanh chóng, đóng gói cẩn thận giữ trọn hương vị'
  }
];

export const PRICE_OPTIONS: PriceOption[] = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];

export const TIME_GROUPS = [
  {
    label: 'Buổi sáng (06:00 - 11:30)',
    options: [
      '06:00',
      '06:30',
      '07:00',
      '07:30',
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30'
    ]
  },
  {
    label: 'Buổi chiều (12:00 - 17:30)',
    options: [
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30'
    ]
  },
  {
    label: 'Buổi tối (18:00 - 23:30)',
    options: [
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
      '21:30',
      '22:00',
      '22:30',
      '23:00',
      '23:30'
    ]
  },
  {
    label: 'Đêm & Sáng sớm (00:00 - 05:30)',
    options: [
      '00:00',
      '00:30',
      '01:00',
      '01:30',
      '02:00',
      '02:30',
      '03:00',
      '03:30',
      '04:00',
      '04:30',
      '05:00',
      '05:30'
    ]
  }
];

export const POPULAR_TIME_PRESETS = [
  { label: '07:00 - 22:00', open: '07:00', close: '22:00' },
  { label: '06:30 - 22:30', open: '06:30', close: '22:30' },
  { label: '07:00 - 23:00', open: '07:00', close: '23:00' },
  { label: '08:00 - 22:00', open: '08:00', close: '22:00' },
  { label: '24/7 (Cả ngày)', open: '00:00', close: '23:59' }
];

export const DAYS_LIST: DayConfig[] = [
  { day: 1, name: 'Thứ Hai', short: 'T2' },
  { day: 2, name: 'Thứ Ba', short: 'T3' },
  { day: 3, name: 'Thứ Tư', short: 'T4' },
  { day: 4, name: 'Thứ Năm', short: 'T5' },
  { day: 5, name: 'Thứ Sáu', short: 'T6' },
  { day: 6, name: 'Thứ Bảy', short: 'T7' },
  { day: 0, name: 'Chủ Nhật', short: 'CN' }
];

export const openingPeriodSchema = z.object({
  open: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  }),
  close: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  })
});

export const openingHoursFormSchema = z.object({
  open_now: z.boolean(),
  periods: z.array(openingPeriodSchema).optional()
});

export const addShopFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên quán cà phê')
    .max(200, 'Tên quán không được quá 200 ký tự'),
  address: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ quán')
    .max(500, 'Địa chỉ không được quá 500 ký tự'),
  lat: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  lon: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  phone: z.string().optional(),
  website: z.string().optional(),
  price_range: z.enum(['₫', '₫₫', '₫₫₫', '₫₫₫₫']).optional(),
  photos: z.array(z.string()),
  opening_hours: openingHoursFormSchema
});

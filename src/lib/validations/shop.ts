import { z } from 'zod';

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

export const openingHoursSchema = z.object({
  open_now: z.boolean().default(true),
  periods: z.array(openingPeriodSchema).optional()
});

export const customAmenitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên tiện ích không được để trống')
    .max(100, 'Tên tiện ích tối đa 100 ký tự'),
  description: z.string().trim().max(300, 'Mô tả tiện ích tối đa 300 ký tự').optional().default('')
});

export const amenitySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, 'Tên tiện ích không được để trống').max(100),
  type: z.enum(['predefined', 'custom']).default('custom'),
  description: z.string().trim().max(500).default('')
});

export const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên quán không được để trống')
    .max(200, 'Tên quán tối đa 200 ký tự'),
  address: z
    .string()
    .trim()
    .min(1, 'Địa chỉ không được để trống')
    .max(500, 'Địa chỉ tối đa 500 ký tự'),
  lat: z.number().min(-90, 'Vĩ độ phải từ -90 đến 90').max(90, 'Vĩ độ phải từ -90 đến 90'),
  lon: z
    .number()
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180'),
  phone: z
    .string()
    .trim()
    .max(50, 'Số điện thoại tối đa 50 ký tự')
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  website: z
    .string()
    .trim()
    .url('Đường dẫn website không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  price_range: z
    .enum(['₫', '₫₫', '₫₫₫', '₫₫₫₫'])
    .optional()
    .nullable()
    .transform((val) => val || null),
  categories: z.array(z.string().trim().min(1)).optional().default([]),
  custom_amenities: z.array(customAmenitySchema).optional().default([]),
  amenities: z.array(amenitySchema).optional().default([]),
  photos: z.array(z.string().trim().url('Đường dẫn ảnh không hợp lệ')).optional().default([]),
  opening_hours: openingHoursSchema.optional().default({ open_now: true })
});

export type CreateShopInput = z.infer<typeof createShopSchema>;

export const updateShopSchema = createShopSchema.extend({
  place_id: z.string().trim().min(1, 'Mã định danh quán không được để trống')
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;

'use client';

import axios from 'axios';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  Copy,
  Eye,
  Heart,
  Image,
  Link,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  Upload,
  Utensils,
  Wifi,
  Wind,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { LocationPickerMap } from '@/components/shop/LocationPickerMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

export interface PredefinedCategoryConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  defaultDescription: string;
}

const POPULAR_CATEGORIES: PredefinedCategoryConfig[] = [
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

const PRICE_OPTIONS: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'> = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];

const TIME_GROUPS = [
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

const POPULAR_TIME_PRESETS = [
  { label: '07:00 - 22:00', open: '07:00', close: '22:00' },
  { label: '06:30 - 22:30', open: '06:30', close: '22:30' },
  { label: '07:00 - 23:00', open: '07:00', close: '23:00' },
  { label: '08:00 - 22:00', open: '08:00', close: '22:00' },
  { label: '24/7 (Cả ngày)', open: '00:00', close: '23:59' }
];

export interface DayConfig {
  day: number;
  name: string;
  short: string;
}

export const DAYS_LIST: DayConfig[] = [
  { day: 1, name: 'Thứ Hai', short: 'T2' },
  { day: 2, name: 'Thứ Ba', short: 'T3' },
  { day: 3, name: 'Thứ Tư', short: 'T4' },
  { day: 4, name: 'Thứ Năm', short: 'T5' },
  { day: 5, name: 'Thứ Sáu', short: 'T6' },
  { day: 6, name: 'Thứ Bảy', short: 'T7' },
  { day: 0, name: 'Chủ Nhật', short: 'CN' }
];

export interface DayScheduleState {
  enabled: boolean;
  open: string;
  close: string;
}

const openingPeriodSchema = z.object({
  open: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  }),
  close: z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Định dạng giờ phải là HH:MM')
  })
});

const openingHoursFormSchema = z.object({
  open_now: z.boolean(),
  periods: z.array(openingPeriodSchema).optional()
});

export interface Amenity {
  id: string; // category key or custom ID
  name: string; // display name
  type: 'predefined' | 'custom';
  description: string; // user-editable
}

const addShopFormSchema = z.object({
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

type AddShopFormData = z.infer<typeof addShopFormSchema>;

interface AddShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newShop: CoffeeShop) => void;
}

export function AddShopDialog({ open, onOpenChange, onSuccess }: AddShopDialogProps) {
  const queryClient = useQueryClient();
  const {
    lat: userLat,
    lng: userLng,
    loading: locationLoading,
    isFallback: isLocationFallback,
    refetchLocation
  } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [customAmenityName, setCustomAmenityName] = useState('');
  const [customAmenityDesc, setCustomAmenityDesc] = useState('');
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialLat =
    typeof userLat === 'number' && !isNaN(userLat) && !isLocationFallback
      ? userLat
      : DEFAULT_LOCATION.lat;
  const initialLon =
    typeof userLng === 'number' && !isNaN(userLng) && !isLocationFallback
      ? userLng
      : DEFAULT_LOCATION.lng;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<AddShopFormData>({
    resolver: zodResolver(addShopFormSchema),
    defaultValues: {
      name: '',
      address: '',
      lat: initialLat,
      lon: initialLon,
      phone: '',
      website: '',
      price_range: undefined,
      photos: [],
      opening_hours: {
        open_now: true,
        periods: []
      }
    }
  });

  // Schedule state for simple vs per-day mode
  const [isCustomPerDay, setIsCustomPerDay] = useState(false);
  const [sameOpenTime, setSameOpenTime] = useState('');
  const [sameCloseTime, setSameCloseTime] = useState('');
  const [weekSchedule, setWeekSchedule] = useState<Record<number, DayScheduleState>>(() => {
    const initial: Record<number, DayScheduleState> = {};
    DAYS_LIST.forEach((d) => {
      initial[d.day] = { enabled: true, open: '', close: '' };
    });
    return initial;
  });

  // Set user's current location when modal opens or when GPS coords become available
  useEffect(() => {
    if (open) {
      if (!isLocationFallback && typeof userLat === 'number' && !isNaN(userLat)) {
        setValue('lat', userLat, { shouldValidate: true });
        setValue('lon', userLng, { shouldValidate: true });
      }
    }
  }, [open, isLocationFallback, userLat, userLng, setValue]);


  const watchedName = watch('name');
  const watchedAddress = watch('address');
  const watchedLat = watch('lat');
  const watchedLon = watch('lon');
  const watchedPhotos = watch('photos') || [];
  const watchedPrice = watch('price_range');
  const watchedOpenNow = watch('opening_hours.open_now') ?? true;

  const handleToggleDay = (day: number) => {
    setWeekSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled
      }
    }));
  };

  const handleDayTimeChange = (day: number, field: 'open' | 'close', value: string) => {
    setWeekSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value === '__NONE__' ? '' : value
      }
    }));
  };

  const handleCopyToAllDays = (sourceDay: number) => {
    const source = weekSchedule[sourceDay];
    if (!source || !source.open || !source.close) {
      toast.info('Vui lòng chọn cả giờ mở và giờ đóng cửa trước khi sao chép.');
      return;
    }

    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open: source.open,
          close: source.close
        };
      });
      return next;
    });

    toast.success(`Đã sao chép khung giờ (${source.open} - ${source.close}) sang tất cả 7 ngày.`);
  };

  const applyTimePreset = (open: string, close: string) => {
    setSameOpenTime(open);
    setSameCloseTime(close);
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open,
          close
        };
      });
      return next;
    });
  };

  const clearAllHours = () => {
    setSameOpenTime('');
    setSameCloseTime('');
    const resetWeek: Record<number, DayScheduleState> = {};
    DAYS_LIST.forEach((d) => {
      resetWeek[d.day] = { enabled: true, open: '', close: '' };
    });
    setWeekSchedule(resetWeek);
  };

  const enableAllDays = () => {
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = { ...next[d.day], enabled: true };
      });
      return next;
    });
  };

  const closeWeekendDays = () => {
    setWeekSchedule((prev) => ({
      ...prev,
      6: { ...prev[6], enabled: false },
      0: { ...prev[0], enabled: false }
    }));
    toast.info('Đã tắt ngày Thứ Bảy và Chủ Nhật.');
  };

  const handlePresetAllDays = (open = '07:00', close = '22:00') => {
    setSameOpenTime(open);
    setSameCloseTime(close);
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        next[d.day] = {
          enabled: true,
          open,
          close
        };
      });
      return next;
    });
    toast.success(`Đã áp dụng khung giờ (${open} - ${close}) cho cả 7 ngày.`);
  };

  const handlePresetWeekdays = (open = '07:00', close = '22:00') => {
    setWeekSchedule((prev) => {
      const next = { ...prev };
      DAYS_LIST.forEach((d) => {
        if (d.day === 6 || d.day === 0) {
          next[d.day] = { enabled: false, open: '', close: '' };
        } else {
          next[d.day] = { enabled: true, open, close };
        }
      });
      return next;
    });
    toast.success(`Đã cài đặt mở T2-T6 (${open} - ${close}), đóng T7 & CN.`);
  };

  const handlePreset247 = () => {
    handlePresetAllDays('00:00', '23:59');
  };

  const computedPeriods = useMemo(() => {
    if (isCustomPerDay) {
      return DAYS_LIST
        .filter(
          (d) =>
            weekSchedule[d.day]?.enabled &&
            weekSchedule[d.day]?.open &&
            weekSchedule[d.day]?.close
        )
        .map((d) => ({
          open: { day: d.day, time: weekSchedule[d.day].open },
          close: { day: d.day, time: weekSchedule[d.day].close }
        }));
    } else {
      if (sameOpenTime && sameCloseTime) {
        return DAYS_LIST.map((d) => ({
          open: { day: d.day, time: sameOpenTime },
          close: { day: d.day, time: sameCloseTime }
        }));
      }
      return [];
    }
  }, [isCustomPerDay, weekSchedule, sameOpenTime, sameCloseTime]);

  const hasAnyHoursSet =
    (isCustomPerDay && computedPeriods.length > 0) ||
    (!isCustomPerDay && Boolean(sameOpenTime || sameCloseTime));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để tải ảnh lên.');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`Định dạng tệp "${file.name}" không hợp lệ. Chỉ chấp nhận tệp hình ảnh.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_SIZE) {
        toast.error(`Tệp "${file.name}" vượt quá dung lượng tối đa 5MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);
    const newUploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 30);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filePath = `shops/${user.id}/${timestamp}_${randomStr}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('shop-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Lỗi khi tải ảnh lên Supabase Storage:', uploadError);
          toast.error(`Không thể tải lên tệp "${file.name}": ${uploadError.message}`, { id: toastId });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('shop-photos')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          newUploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        setValue('photos', [...watchedPhotos, ...newUploadedUrls], { shouldValidate: true });
        toast.success(`Đã tải lên thành công ${newUploadedUrls.length} ảnh!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('Lỗi ngoại lệ khi tải ảnh:', err);
      toast.error('Đã xảy ra lỗi trong quá trình tải ảnh. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddPhoto = () => {
    const trimmed = newPhotoUrl.trim();
    if (!trimmed) return;

    if (!/^https?:\/\/.+/i.test(trimmed)) {
      toast.error('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    if (watchedPhotos.includes(trimmed)) {
      toast.info('Ảnh này đã có trong danh sách');
      return;
    }

    setValue('photos', [...watchedPhotos, trimmed], { shouldValidate: true });
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setValue(
      'photos',
      watchedPhotos.filter((_, i) => i !== indexToRemove),
      { shouldValidate: true }
    );
  };

  const togglePredefinedCategory = (cat: PredefinedCategoryConfig) => {
    setAmenities((prev) => {
      const exists = prev.some((a) => a.id === cat.id);
      if (exists) {
        return prev.filter((a) => a.id !== cat.id);
      }
      return [
        ...prev,
        {
          id: cat.id,
          name: cat.label,
          type: 'predefined',
          description: cat.defaultDescription
        }
      ];
    });
  };

  const handleUpdateAmenityDescription = (id: string, description: string) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, description } : a))
    );
  };

  const handleRemoveAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddCustomAmenity = () => {
    const name = customAmenityName.trim();
    if (!name) {
      toast.info('Vui lòng nhập tên tiện ích');
      return;
    }
    if (amenities.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      toast.info('Tiện ích này đã tồn tại trong danh sách');
      return;
    }
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setAmenities((prev) => [
      ...prev,
      {
        id: customId,
        name,
        type: 'custom',
        description: customAmenityDesc.trim()
      }
    ]);
    setCustomAmenityName('');
    setCustomAmenityDesc('');
  };

  const onSubmit = async (data: AddShopFormData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện thêm quán cà phê.');
      return;
    }

    setIsSubmitting(true);

    try {
      const openingHoursPayload = {
        open_now: data.opening_hours?.open_now ?? true,
        periods: computedPeriods.length > 0 ? computedPeriods : undefined
      };

      const payload = {
        name: data.name.trim(),
        address: data.address.trim(),
        lat: Number(data.lat),
        lon: Number(data.lon),
        phone: data.phone?.trim() || undefined,
        website: data.website?.trim() || undefined,
        price_range: data.price_range || undefined,
        amenities,
        categories: amenities.map((a) => a.id),
        custom_amenities: amenities
          .filter((a) => a.type === 'custom')
          .map((a) => ({ name: a.name, description: a.description })),
        photos: data.photos,
        opening_hours: openingHoursPayload
      };


      const response = await axios.post<{
        success: boolean;
        message: string;
        shop: CoffeeShop;
      }>(API_ENDPOINTS.CREATE_SHOP, payload);

      if (response.data.success) {
        toast.success('Thêm quán cà phê thành công!', {
          description: 'Quán đã được lưu vào hệ thống và đang chờ quản trị viên xác minh.'
        });

        // Invalidate React Query caches so lists & maps immediately refresh
        await queryClient.invalidateQueries({ queryKey: ['shops'] });

        if (onSuccess && response.data.shop) {
          onSuccess(response.data.shop);
        }

        reset();
        clearAllHours();
        setIsCustomPerDay(false);
        setShowUrlInput(false);
        setAmenities([]);
        setCustomAmenityName('');
        setCustomAmenityDesc('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onOpenChange(false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Không thể thêm quán cà phê. Vui lòng thử lại.';
      toast.error('Lỗi khi thêm quán', { description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='w-[94vw] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-3xl'
        aria-describedby='add-shop-dialog-desc'
      >
        {/* Header */}
        <DialogHeader className='px-5 sm:px-6 pt-5 pb-3 border-b border-border/80 flex-shrink-0'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-2xl bg-amber-gold/15 border border-amber-gold/30 flex items-center justify-center text-amber-gold flex-shrink-0'>
              <Coffee size={20} />
            </div>
            <div>
              <DialogTitle className='font-sans font-bold text-lg sm:text-xl text-foreground'>
                Thêm Quán Cà Phê Mới
              </DialogTitle>
              <DialogDescription
                id='add-shop-dialog-desc'
                className='text-xs text-muted-foreground mt-0.5'
              >
                Chia sẻ không gian cà phê yêu thích của bạn cùng cộng đồng PhinFind
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form
          id='add-shop-form'
          onSubmit={handleSubmit(onSubmit)}
          className='flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 space-y-5'
        >
          {/* Section 1: Basic Information */}
          <div className='space-y-3.5'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <Coffee size={14} className='text-amber-gold' />
                <span>1. Thông tin cơ bản</span>
              </h3>
              <span className='text-[11px] text-muted-foreground'>* Bắt buộc</span>
            </div>

            {/* Shop Name */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='shop-name'
                className='text-xs font-semibold text-foreground flex items-center gap-1'
              >
                Tên quán cà phê <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='shop-name'
                {...register('name')}
                placeholder='VD: Cà Phê Giảng, All Day Coffee...'
                className={cn(
                  'h-10 bg-secondary/50 border-border text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold',
                  errors.name && 'border-rose-500 focus-visible:ring-rose-500'
                )}
              />
              {errors.name && (
                <p className='text-[11px] text-rose-500 flex items-center gap-1 mt-1'>
                  <AlertCircle size={12} />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Address */}
            <div className='space-y-1.5'>
              <Label
                htmlFor='shop-address'
                className='text-xs font-semibold text-foreground flex items-center gap-1'
              >
                Địa chỉ chi tiết <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='shop-address'
                {...register('address')}
                placeholder='VD: Số 39 Nguyễn Hữu Huân, Hàng Bạc, Hoàn Kiếm, Hà Nội'
                className={cn(
                  'h-10 bg-secondary/50 border-border text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-amber-gold',
                  errors.address && 'border-rose-500 focus-visible:ring-rose-500'
                )}
              />
              {errors.address && (
                <p className='text-[11px] text-rose-500 flex items-center gap-1 mt-1'>
                  <AlertCircle size={12} />
                  <span>{errors.address.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Location Map Picker */}
          <div className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
                <MapPin size={14} className='text-amber-gold' />
                <span>
                  2. Vị trí trên bản đồ <span className='text-rose-500'>*</span>
                </span>
              </h3>

              <button
                type='button'
                onClick={() => setShowManualCoords(!showManualCoords)}
                className='text-[11px] text-amber-gold hover:underline font-medium cursor-pointer'
              >
                {showManualCoords ? 'Ẩn nhập tọa độ tay' : 'Nhập tọa độ thủ công'}
              </button>
            </div>

            {/* Subtle Location Status Message */}
            <div className='flex items-center justify-between text-[11px] text-muted-foreground px-0.5'>
              {locationLoading ? (
                <span className='flex items-center gap-1.5 text-amber-gold animate-pulse'>
                  <Loader2 size={12} className='animate-spin' />
                  <span>Đang xác định vị trí của bạn...</span>
                </span>
              ) : !isLocationFallback ? (
                <span className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium'>
                  <Navigation size={12} className='fill-emerald-500 text-emerald-500' />
                  <span>Đã định vị theo vị trí hiện tại của bạn</span>
                </span>
              ) : (
                <span className='flex items-center gap-1.5 text-muted-foreground/80'>
                  <MapPin size={12} className='text-muted-foreground' />
                  <span>Đang sử dụng vị trí mặc định (Hà Nội)</span>
                </span>
              )}
            </div>

            {/* Embedded Leaflet Map */}
            <div className='h-52 sm:h-60 w-full rounded-2xl overflow-hidden border border-border'>
              <Controller
                control={control}
                name='lat'
                render={({ field: { value: currentLat } }) => (
                  <Controller
                    control={control}
                    name='lon'
                    render={({ field: { value: currentLon } }) => (
                      <LocationPickerMap
                        lat={currentLat}
                        lon={currentLon}
                        onChange={(newLat, newLon) => {
                          setValue('lat', newLat, { shouldValidate: true });
                          setValue('lon', newLon, { shouldValidate: true });
                        }}
                      />
                    )}
                  />
                )}
              />
            </div>

            {/* Manual Lat/Lon Inputs */}
            {showManualCoords && (
              <div className='grid grid-cols-2 gap-3 p-3 bg-secondary/40 border border-border/80 rounded-xl animate-in fade-in duration-200'>
                <div className='space-y-1'>
                  <Label
                    htmlFor='shop-lat'
                    className='text-[11px] text-muted-foreground font-medium'
                  >
                    Vĩ độ (Latitude)
                  </Label>
                  <Input
                    id='shop-lat'
                    type='number'
                    step='any'
                    {...register('lat', { valueAsNumber: true })}
                    className='h-8 text-xs font-mono bg-background'
                  />
                </div>
                <div className='space-y-1'>
                  <Label
                    htmlFor='shop-lon'
                    className='text-[11px] text-muted-foreground font-medium'
                  >
                    Kinh độ (Longitude)
                  </Label>
                  <Input
                    id='shop-lon'
                    type='number'
                    step='any'
                    {...register('lon', { valueAsNumber: true })}
                    className='h-8 text-xs font-mono bg-background'
                  />
                </div>
              </div>
            )}
            {(errors.lat || errors.lon) && (
              <p className='text-[11px] text-rose-500 flex items-center gap-1'>
                <AlertCircle size={12} />
                <span>Tọa độ không hợp lệ. Vui lòng chọn vị trí trên bản đồ.</span>
              </p>
            )}
          </div>

          {/* Section 3: Categories & Price Range */}
          <div className='space-y-3.5'>
            <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <Tag size={14} className='text-amber-gold' />
              <span>3. Thể loại &amp; Tiện ích</span>
            </h3>

            {/* Category Chips */}
            <div className='space-y-3'>
              <div className='space-y-2'>
                <Label className='text-xs font-semibold text-foreground'>
                  Đặc điểm &amp; Tiện ích nổi bật
                </Label>
                <div className='flex flex-wrap gap-2'>
                  {POPULAR_CATEGORIES.map((cat) => {
                    const isSelected = amenities.some((a) => a.id === cat.id);
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type='button'
                        onClick={() => togglePredefinedCategory(cat)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-150 cursor-pointer select-none',
                          isSelected
                            ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-xs'
                            : 'bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        {isSelected ? (
                          <Check size={12} className='stroke-[3] flex-shrink-0' />
                        ) : (
                          <CatIcon size={12} className='flex-shrink-0 text-muted-foreground' />
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Amenities List with Editable Descriptions */}
              {amenities.length > 0 && (
                <div className='space-y-2 pt-1'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <Check size={13} className='text-teal stroke-[2.5]' />
                      <span>Tiện ích đã chọn ({amenities.length})</span>
                    </Label>
                    <span className='text-[10px] text-muted-foreground'>
                      Nhấp vào ô mô tả để chỉnh sửa theo ý bạn
                    </span>
                  </div>

                  <div className='space-y-2'>
                    {amenities.map((amenity) => {
                      const predefinedCat = POPULAR_CATEGORIES.find((p) => p.id === amenity.id);
                      const Icon = predefinedCat?.icon || (amenity.type === 'custom' ? Sparkles : Tag);
                      return (
                        <div
                          key={amenity.id}
                          className='p-3 bg-secondary/35 rounded-2xl border border-border/80 space-y-2 shadow-2xs'
                        >
                          <div className='flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-2 min-w-0'>
                              <div className='w-6 h-6 rounded-lg bg-amber-gold/15 text-amber-gold flex items-center justify-center flex-shrink-0'>
                                <Icon size={13} />
                              </div>
                              <span className='text-xs font-bold text-foreground truncate'>
                                {amenity.name}
                              </span>
                              <Badge
                                variant='outline'
                                className={cn(
                                  'text-[9px] px-1.5 py-0',
                                  amenity.type === 'custom'
                                    ? 'bg-amber-gold/10 text-amber-gold border-amber-gold/30'
                                    : 'bg-secondary text-muted-foreground border-border'
                                )}
                              >
                                {amenity.type === 'custom' ? 'Tự định nghĩa' : 'Có sẵn'}
                              </Badge>
                            </div>
                            <button
                              type='button'
                              onClick={() => handleRemoveAmenity(amenity.id)}
                              className='p-1 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground rounded-lg transition-colors cursor-pointer shrink-0'
                              title='Xóa tiện ích này'
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className='flex items-start gap-2 pt-0.5'>
                            <span className='text-[11px] text-muted-foreground font-medium shrink-0 pt-1'>
                              Mô tả:
                            </span>
                            <textarea
                              value={amenity.description}
                              onChange={(e) =>
                                handleUpdateAmenityDescription(amenity.id, e.target.value)
                              }
                              placeholder='Nhập hoặc chỉnh sửa mô tả cho tiện ích này...'
                              rows={2}
                              className='w-full text-xs bg-background border border-border/80 focus:border-amber-gold focus:ring-1 focus:ring-amber-gold rounded-xl px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/60 resize-y min-h-[38px] transition-all'
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Amenities with Descriptions */}
              <div className='p-3 bg-secondary/25 rounded-2xl border border-border/80 space-y-2.5 mt-2'>
                <div className='flex items-center justify-between'>
                  <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                    <Sparkles size={13} className='text-amber-gold' />
                    <span>Thêm tiện ích tự định nghĩa</span>
                  </Label>
                  <span className='text-[10px] text-muted-foreground'>Viết tên &amp; mô tả riêng</span>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Input
                      value={customAmenityName}
                      onChange={(e) => setCustomAmenityName(e.target.value)}
                      placeholder='Tên tiện ích (VD: Phòng họp riêng, Đỗ xe ô tô, Ghế công thái học...)'
                      className='h-8 text-xs bg-background border-border rounded-xl flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAddCustomAmenity}
                      disabled={!customAmenityName.trim()}
                      className='h-8 px-3 text-xs rounded-xl flex-shrink-0 cursor-pointer font-medium'
                    >
                      <Plus size={13} className='mr-1' />
                      <span>Thêm</span>
                    </Button>
                  </div>
                  <Input
                    value={customAmenityDesc}
                    onChange={(e) => setCustomAmenityDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                    placeholder='Mô tả ngắn (VD: 5 phòng họp cách âm, trang bị máy chiếu...)'
                    className='h-8 text-xs bg-background border-border rounded-xl'
                  />
                </div>
              </div>
            </div>

            {/* Price Range Selector */}
            <div className='space-y-2'>
              <Label className='text-xs font-semibold text-foreground'>Mức giá tham khảo</Label>
              <div className='grid grid-cols-4 gap-2'>
                {PRICE_OPTIONS.map((price) => {
                  const isSelected = watchedPrice === price;
                  return (
                    <button
                      key={price}
                      type='button'
                      onClick={() => setValue('price_range', isSelected ? undefined : price)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer select-none',
                        isSelected
                          ? 'bg-primary/20 text-foreground border-primary/50 ring-1 ring-primary'
                          : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {price}
                      <span className='block text-[9px] font-normal text-muted-foreground mt-0.5'>
                        {price === '₫'
                          ? '< 30k'
                          : price === '₫₫'
                            ? '30k - 60k'
                            : price === '₫₫₫'
                              ? '60k - 100k'
                              : '> 100k'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Photos */}
          <div className='space-y-3.5'>
            <h3 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <Phone size={14} className='text-amber-gold' />
              <span>4. Liên hệ &amp; Hình ảnh (Tùy chọn)</span>
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label htmlFor='shop-phone' className='text-xs font-medium text-foreground'>
                  Số điện thoại
                </Label>
                <Input
                  id='shop-phone'
                  {...register('phone')}
                  placeholder='VD: 0912 345 678'
                  className='h-9 bg-secondary/50 border-border text-xs rounded-xl'
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='shop-website' className='text-xs font-medium text-foreground'>
                  Website / Fanpage URL
                </Label>
                <Input
                  id='shop-website'
                  {...register('website')}
                  placeholder='https://facebook.com/...'
                  className='h-9 bg-secondary/50 border-border text-xs rounded-xl'
                />
                {errors.website && (
                  <p className='text-[10px] text-rose-500'>{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Opening Hours Section (Google Maps style 7-day schedule) */}
            <div className='space-y-3 pt-1'>
              <div className='flex items-center justify-between flex-wrap gap-2'>
                <div className='flex items-center gap-1.5'>
                  <Clock size={14} className='text-amber-gold' />
                  <span className='text-xs font-bold text-foreground uppercase tracking-wider'>
                    Khung giờ hoạt động
                  </span>
                  <span className='text-[10px] text-muted-foreground font-normal'>(Tùy chọn)</span>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      const nextMode = !isCustomPerDay;
                      setIsCustomPerDay(nextMode);
                      if (nextMode && sameOpenTime && sameCloseTime) {
                        setWeekSchedule((prev) => {
                          const next = { ...prev };
                          DAYS_LIST.forEach((d) => {
                            next[d.day] = {
                              enabled: true,
                              open: sameOpenTime,
                              close: sameCloseTime
                            };
                          });
                          return next;
                        });
                      }
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none',
                      isCustomPerDay
                        ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40'
                        : 'bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <CalendarDays size={12} />
                    <span>{isCustomPerDay ? 'Đặt theo từng ngày' : 'Cùng giờ cả tuần'}</span>
                  </button>

                  {hasAnyHoursSet && (
                    <button
                      type='button'
                      onClick={clearAllHours}
                      className='text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1 px-1.5 py-1'
                      title='Xóa toàn bộ giờ đã chọn'
                    >
                      <Trash2 size={11} />
                      <span>Xóa giờ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mode 1: Same Hours For All Days */}
              {!isCustomPerDay ? (
                <div className='p-3.5 bg-secondary/30 rounded-2xl border border-border/80 space-y-3 animate-in fade-in duration-200'>
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                    <span>Áp dụng một khung giờ mở/đóng cho tất cả các ngày (T2 - CN)</span>
                    <button
                      type='button'
                      onClick={() => setIsCustomPerDay(true)}
                      className='text-amber-gold hover:underline font-medium cursor-pointer'
                    >
                      Tùy chỉnh từng ngày &rarr;
                    </button>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {/* Open Time */}
                    <div className='space-y-1'>
                      <Label
                        htmlFor='same-open-time'
                        className='text-[11px] font-medium text-muted-foreground flex items-center gap-1'
                      >
                        <span>Giờ mở cửa (Hàng ngày)</span>
                      </Label>
                      <div className='relative flex items-center'>
                        <Select
                          value={sameOpenTime || undefined}
                          onValueChange={(val) => {
                            const newOpen = val === '__NONE__' ? '' : val;
                            setSameOpenTime(newOpen);
                            if (newOpen) {
                              setWeekSchedule((prev) => {
                                const next = { ...prev };
                                DAYS_LIST.forEach((d) => {
                                  next[d.day] = { ...next[d.day], open: newOpen };
                                });
                                return next;
                              });
                            }
                          }}
                        >
                          <SelectTrigger
                            id='same-open-time'
                            className={cn(
                              'h-10 bg-background/80 border-border text-xs rounded-xl focus:ring-1 focus:ring-amber-gold focus:border-amber-gold/60 text-foreground transition-all',
                              !sameOpenTime && 'text-muted-foreground'
                            )}
                          >
                            <div className='flex items-center gap-2 truncate pr-4'>
                              <Clock size={13} className='text-amber-gold shrink-0' />
                              <SelectValue placeholder='Chọn giờ mở (VD: 07:00)' />
                            </div>
                          </SelectTrigger>
                          <SelectContent className='max-h-56 bg-popover border-border rounded-xl shadow-xl z-50'>
                            <SelectItem
                              value='__NONE__'
                              className='text-xs text-muted-foreground font-medium cursor-pointer'
                            >
                              -- Chưa chọn --
                            </SelectItem>
                            {TIME_GROUPS.map((group) => (
                              <SelectGroup key={group.label}>
                                <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                                  {group.label}
                                </SelectLabel>
                                {group.options.map((time) => (
                                  <SelectItem
                                    key={time}
                                    value={time}
                                    className='text-xs font-mono py-1.5 cursor-pointer'
                                  >
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        {sameOpenTime && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setSameOpenTime('');
                            }}
                            className='absolute right-8 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer'
                            title='Xóa giờ mở cửa'
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Close Time */}
                    <div className='space-y-1'>
                      <Label
                        htmlFor='same-close-time'
                        className='text-[11px] font-medium text-muted-foreground flex items-center gap-1'
                      >
                        <span>Giờ đóng cửa (Hàng ngày)</span>
                      </Label>
                      <div className='relative flex items-center'>
                        <Select
                          value={sameCloseTime || undefined}
                          onValueChange={(val) => {
                            const newClose = val === '__NONE__' ? '' : val;
                            setSameCloseTime(newClose);
                            if (newClose) {
                              setWeekSchedule((prev) => {
                                const next = { ...prev };
                                DAYS_LIST.forEach((d) => {
                                  next[d.day] = { ...next[d.day], close: newClose };
                                });
                                return next;
                              });
                            }
                          }}
                        >
                          <SelectTrigger
                            id='same-close-time'
                            className={cn(
                              'h-10 bg-background/80 border-border text-xs rounded-xl focus:ring-1 focus:ring-amber-gold focus:border-amber-gold/60 text-foreground transition-all',
                              !sameCloseTime && 'text-muted-foreground'
                            )}
                          >
                            <div className='flex items-center gap-2 truncate pr-4'>
                              <Clock size={13} className='text-amber-gold shrink-0' />
                              <SelectValue placeholder='Chọn giờ đóng (VD: 22:30)' />
                            </div>
                          </SelectTrigger>
                          <SelectContent className='max-h-56 bg-popover border-border rounded-xl shadow-xl z-50'>
                            <SelectItem
                              value='__NONE__'
                              className='text-xs text-muted-foreground font-medium cursor-pointer'
                            >
                              -- Chưa chọn --
                            </SelectItem>
                            {TIME_GROUPS.map((group) => (
                              <SelectGroup key={group.label}>
                                <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                                  {group.label}
                                </SelectLabel>
                                {group.options.map((time) => (
                                  <SelectItem
                                    key={time}
                                    value={time}
                                    className='text-xs font-mono py-1.5 cursor-pointer'
                                  >
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        {sameCloseTime && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setSameCloseTime('');
                            }}
                            className='absolute right-8 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer'
                            title='Xóa giờ đóng cửa'
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Popular Presets */}
                  <div className='flex items-center flex-wrap gap-1.5 pt-0.5'>
                    <span className='text-[11px] text-muted-foreground font-medium mr-1'>
                      Gợi ý nhanh:
                    </span>
                    {POPULAR_TIME_PRESETS.map((preset) => {
                      const isMatch =
                        sameOpenTime === preset.open && sameCloseTime === preset.close;
                      return (
                        <button
                          key={preset.label}
                          type='button'
                          onClick={() => applyTimePreset(preset.open, preset.close)}
                          className={cn(
                            'text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all duration-150 cursor-pointer select-none',
                            isMatch
                              ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40 font-semibold shadow-xs'
                              : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Mode 2: Google Maps-Style 7-Day Schedule Editor */
                <div className='p-2.5 sm:p-3 bg-secondary/25 rounded-2xl border border-border/80 space-y-2.5 animate-in fade-in duration-200'>
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-1.5 pb-1 border-b border-border/60'>
                    <span className='font-medium text-foreground/80'>Lịch theo từng ngày:</span>
                    <div className='flex items-center gap-2 text-[10px]'>
                      <button
                        type='button'
                        onClick={enableAllDays}
                        className='text-amber-gold hover:underline font-medium cursor-pointer'
                      >
                        Bật tất cả
                      </button>
                      <span>•</span>
                      <button
                        type='button'
                        onClick={closeWeekendDays}
                        className='text-muted-foreground hover:text-foreground font-medium cursor-pointer'
                      >
                        Đóng T7 &amp; CN
                      </button>
                    </div>
                  </div>

                  {/* Day by Day Rows */}
                  <div className='space-y-1.5'>
                    {DAYS_LIST.map((d) => {
                      const dayState = weekSchedule[d.day] || { enabled: true, open: '', close: '' };
                      const isDayOpen = dayState.enabled;

                      return (
                        <div
                          key={d.day}
                          className={cn(
                            'p-2 rounded-xl border transition-all duration-150',
                            isDayOpen
                              ? 'bg-background/95 border-border/80 shadow-2xs'
                              : 'bg-secondary/30 border-dashed border-border/50 opacity-70'
                          )}
                        >
                          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2'>
                            {/* Left: Switch and Day label */}
                            <div className='flex items-center justify-between sm:justify-start sm:w-28 shrink-0 gap-1.5'>
                              <div className='flex items-center gap-1.5 min-w-0'>
                                <Switch
                                  id={`switch-day-${d.day}`}
                                  checked={isDayOpen}
                                  onCheckedChange={() => handleToggleDay(d.day)}
                                  className='data-[state=checked]:bg-amber-gold scale-75 origin-left'
                                />
                                <Label
                                  htmlFor={`switch-day-${d.day}`}
                                  className='text-xs font-bold text-foreground cursor-pointer truncate'
                                >
                                  {d.name}
                                </Label>
                              </div>

                              {/* Mobile actions & status */}
                              <div className='sm:hidden flex items-center gap-1'>
                                {isDayOpen ? (
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleCopyToAllDays(d.day)}
                                    disabled={!dayState.open || !dayState.close}
                                    title='Sao chép giờ sang các ngày khác'
                                    className='h-6 px-1.5 text-[10px] text-muted-foreground hover:text-amber-gold hover:bg-amber-gold/10 rounded-md cursor-pointer disabled:opacity-30'
                                  >
                                    <Copy size={11} className='mr-1' />
                                    <span>Sao chép</span>
                                  </Button>
                                ) : (
                                  <Badge
                                    variant='outline'
                                    className='text-[9px] px-1.5 py-0 bg-rose-500/10 text-rose-500 border-rose-500/20'
                                  >
                                    Đóng cửa
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Middle: Open & Close Time selects */}
                            {isDayOpen ? (
                              <div className='flex-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2'>
                                <div className='grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 flex-1'>
                                  {/* Open Time */}
                                  <div className='relative flex-1'>
                                    <Select
                                      value={dayState.open || undefined}
                                      onValueChange={(val) =>
                                        handleDayTimeChange(d.day, 'open', val)
                                      }
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          'h-8 text-xs bg-secondary/50 border-border rounded-lg focus:ring-1 focus:ring-amber-gold text-foreground transition-all px-2',
                                          !dayState.open && 'text-muted-foreground'
                                        )}
                                      >
                                        <div className='flex items-center gap-1.5 truncate'>
                                          <Clock size={11} className='text-amber-gold shrink-0' />
                                          <SelectValue placeholder='Giờ mở' />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className='max-h-52 bg-popover border-border rounded-xl shadow-xl z-50'>
                                        <SelectItem
                                          value='__NONE__'
                                          className='text-xs text-muted-foreground font-medium cursor-pointer'
                                        >
                                          -- Chưa chọn --
                                        </SelectItem>
                                        {TIME_GROUPS.map((group) => (
                                          <SelectGroup key={group.label}>
                                            <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                                              {group.label}
                                            </SelectLabel>
                                            {group.options.map((time) => (
                                              <SelectItem
                                                key={time}
                                                value={time}
                                                className='text-xs font-mono py-1.5 cursor-pointer'
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <span className='hidden sm:inline text-xs text-muted-foreground font-semibold'>
                                    -
                                  </span>

                                  {/* Close Time */}
                                  <div className='relative flex-1'>
                                    <Select
                                      value={dayState.close || undefined}
                                      onValueChange={(val) =>
                                        handleDayTimeChange(d.day, 'close', val)
                                      }
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          'h-8 text-xs bg-secondary/50 border-border rounded-lg focus:ring-1 focus:ring-amber-gold text-foreground transition-all px-2',
                                          !dayState.close && 'text-muted-foreground'
                                        )}
                                      >
                                        <div className='flex items-center gap-1.5 truncate'>
                                          <Clock size={11} className='text-amber-gold shrink-0' />
                                          <SelectValue placeholder='Giờ đóng' />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className='max-h-52 bg-popover border-border rounded-xl shadow-xl z-50'>
                                        <SelectItem
                                          value='__NONE__'
                                          className='text-xs text-muted-foreground font-medium cursor-pointer'
                                        >
                                          -- Chưa chọn --
                                        </SelectItem>
                                        {TIME_GROUPS.map((group) => (
                                          <SelectGroup key={group.label}>
                                            <SelectLabel className='text-[10px] uppercase font-bold text-amber-gold/90 px-2 py-1 tracking-wider'>
                                              {group.label}
                                            </SelectLabel>
                                            {group.options.map((time) => (
                                              <SelectItem
                                                key={time}
                                                value={time}
                                                className='text-xs font-mono py-1.5 cursor-pointer'
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Desktop Copy Button */}
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleCopyToAllDays(d.day)}
                                  disabled={!dayState.open || !dayState.close}
                                  title='Sao chép khung giờ này sang các ngày khác'
                                  className='hidden sm:inline-flex h-8 px-2 text-[11px] text-muted-foreground hover:text-amber-gold hover:bg-amber-gold/10 rounded-lg shrink-0 cursor-pointer disabled:opacity-30'
                                >
                                  <Copy size={11} className='mr-1' />
                                  <span>Sao chép</span>
                                </Button>
                              </div>
                            ) : (
                              /* When Closed (Desktop) */
                              <div className='hidden sm:flex flex-1 items-center justify-end gap-2 text-[11px] text-muted-foreground py-0.5'>
                                <Badge
                                  variant='outline'
                                  className='text-[9px] px-2 py-0.5 bg-secondary text-muted-foreground border-border'
                                >
                                  Đóng cửa cả ngày
                                </Badge>
                                <button
                                  type='button'
                                  onClick={() => handleToggleDay(d.day)}
                                  className='text-amber-gold hover:underline font-medium text-[11px] cursor-pointer'
                                >
                                  Bật mở cửa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Preset Buttons below schedule */}
                  <div className='p-2 bg-secondary/35 rounded-xl border border-border/60 space-y-1.5 mt-2'>
                    <span className='text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1'>
                      <Sparkles size={11} className='text-amber-gold' />
                      <span>Cài đặt mẫu nhanh cho cả tuần:</span>
                    </span>
                    <div className='flex items-center flex-wrap gap-1.5'>
                      <button
                        type='button'
                        onClick={() => handlePresetAllDays('07:00', '22:00')}
                        className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
                      >
                        Mở tất cả (07:00 - 22:00)
                      </button>
                      <button
                        type='button'
                        onClick={() => handlePresetWeekdays('07:00', '22:00')}
                        className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
                      >
                        Mở T2-T6, đóng T7 &amp; CN
                      </button>
                      <button
                        type='button'
                        onClick={handlePreset247}
                        className='text-[11px] px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary border-border text-foreground hover:border-amber-gold/40 transition-all cursor-pointer font-medium shadow-2xs'
                      >
                        Mở 24/7 cả tuần
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photos Upload & URLs Section */}
            <div className='space-y-2.5 pt-1'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                  <Image size={13} className='text-amber-gold' />
                  <span>Hình ảnh quán ({watchedPhotos.length})</span>
                  <span className='text-[10px] text-muted-foreground font-normal'>(Tối đa 5MB/ảnh)</span>
                </Label>
                <button
                  type='button'
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className='text-[11px] text-amber-gold hover:underline font-medium cursor-pointer flex items-center gap-1'
                >
                  <Link size={11} />
                  <span>{showUrlInput ? 'Ẩn dán URL' : 'Hoặc dán URL ảnh'}</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
                multiple
                onChange={handleFileUpload}
                className='hidden'
              />

              {/* Main Upload Dropzone / Trigger Area */}
              <div
                onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed border-border/80 hover:border-amber-gold/60 bg-secondary/20 hover:bg-secondary/35 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group select-none',
                  isUploadingPhoto && 'pointer-events-none opacity-70'
                )}
              >
                <div className='w-10 h-10 rounded-2xl bg-amber-gold/15 text-amber-gold flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200'>
                  {isUploadingPhoto ? (
                    <Loader2 size={20} className='animate-spin' />
                  ) : (
                    <Upload size={20} />
                  )}
                </div>
                <div className='space-y-0.5'>
                  <p className='text-xs font-bold text-foreground group-hover:text-amber-gold transition-colors'>
                    {isUploadingPhoto ? 'Đang tải ảnh lên hệ thống...' : 'Tải ảnh lên từ thiết bị'}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Hỗ trợ chọn nhiều ảnh JPG, PNG, WEBP (tối đa 5MB/tệp)
                  </p>
                </div>
              </div>

              {/* Collapsible URL Input fallback */}
              {showUrlInput && (
                <div className='p-3 bg-secondary/30 rounded-xl border border-border/70 space-y-2 animate-in fade-in duration-150'>
                  <Label className='text-[11px] font-medium text-muted-foreground'>
                    Dán liên kết ảnh trực tiếp (Unsplash, Cloudinary, Imgur...):
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhoto();
                        }
                      }}
                      placeholder='https://images.unsplash.com/...'
                      className='h-8 text-xs bg-background border-border rounded-lg'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAddPhoto}
                      disabled={!newPhotoUrl.trim()}
                      className='h-8 px-3 text-xs rounded-lg flex-shrink-0 cursor-pointer'
                    >
                      <Plus size={13} className='mr-1' />
                      <span>Thêm</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Photo Thumbnails List */}
              {watchedPhotos.length > 0 && (
                <div className='space-y-1.5 pt-1'>
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                    <span>Ảnh đã chọn ({watchedPhotos.length}):</span>
                    <span className='text-[10px] text-amber-gold font-medium'>
                      Ảnh đầu tiên là ảnh đại diện
                    </span>
                  </div>
                  <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                    {watchedPhotos.map((url, index) => (
                      <div
                        key={index}
                        className='relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/80 group shadow-2xs'
                      >
                        <img
                          src={url}
                          alt={`Ảnh quán ${index + 1}`}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                        />
                        {index === 0 && (
                          <div className='absolute bottom-1 left-1 bg-black/75 text-amber-gold text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs'>
                            Ảnh đại diện
                          </div>
                        )}
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(index);
                          }}
                          className='absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer opacity-90 group-hover:opacity-100 shadow-sm'
                          title='Xóa ảnh này'
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Toggle & Card */}
          <div className='border-t border-border/60 pt-3'>
            <button
              type='button'
              onClick={() => setShowPreview(!showPreview)}
              className='flex items-center justify-between w-full text-left py-1 text-xs font-bold text-foreground hover:text-amber-gold transition-colors cursor-pointer'
            >
              <span className='flex items-center gap-1.5'>
                <Eye size={14} className='text-amber-gold' />
                <span>Xem trước thẻ quán (Live Preview)</span>
              </span>
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', showPreview && 'rotate-180')}
              />
            </button>

            {showPreview && (
              <div className='mt-3 p-3 bg-secondary/30 rounded-2xl border border-border/80 space-y-2 animate-in fade-in duration-200'>
                <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                  <span>Mô phỏng hiển thị trên trang Khám phá</span>
                  <Badge
                    variant='outline'
                    className='bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-bold'
                  >
                    <Clock size={10} className='mr-1' /> Chờ xác minh
                  </Badge>
                </div>

                <div className='p-3 bg-card rounded-xl border border-border flex items-start gap-3 shadow-sm'>
                  <div className='w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/40'>
                    {watchedPhotos[0] ? (
                      <img
                        src={watchedPhotos[0]}
                        alt='Preview'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='flex flex-col items-center justify-center text-muted-foreground/50'>
                        <Coffee size={20} />
                        <span className='text-[8px] mt-0.5'>Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-bold text-xs text-foreground truncate'>
                      {watchedName || (
                        <span className='text-muted-foreground/50 font-normal italic'>
                          Chưa nhập tên quán
                        </span>
                      )}
                    </h4>
                    <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                      {watchedAddress ? (
                        <>
                          <MapPin size={10} className='inline mr-1 text-amber-gold' />
                          {watchedAddress}
                        </>
                      ) : (
                        <span className='text-muted-foreground/50 italic'>
                          Chưa nhập địa chỉ
                        </span>
                      )}
                    </p>
                    <div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
                      <Badge
                        variant='outline'
                        className='text-[9px] px-1.5 py-0 bg-teal/20 text-teal border-teal/40'
                      >
                        {watchedOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                      </Badge>
                      {computedPeriods.length > 0 && (
                        <Badge
                          variant='outline'
                          className='text-[9px] px-1.5 py-0 border-amber-gold/40 text-amber-gold bg-amber-gold/10 flex items-center gap-1'
                        >
                          <Clock size={9} />
                          <span>
                            {isCustomPerDay
                              ? `${computedPeriods.length}/7 ngày đặt giờ`
                              : `${sameOpenTime} - ${sameCloseTime}`}
                          </span>
                        </Badge>
                      )}
                      {watchedPrice && (
                        <Badge variant='secondary' className='text-[9px] px-1.5 py-0'>
                          {watchedPrice}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Footer */}
        <DialogFooter className='px-5 sm:px-6 py-3.5 border-t border-border/80 bg-card flex-shrink-0 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className='rounded-xl text-xs h-9 px-4 cursor-pointer'
          >
            Hủy bỏ
          </Button>
          <Button
            type='submit'
            form='add-shop-form'
            disabled={isSubmitting || !watchedName?.trim() || !watchedAddress?.trim()}
            className='bg-amber-gold hover:bg-amber-gold-hover text-primary-foreground font-bold text-xs rounded-xl h-9 px-5 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className='animate-spin' />
                <span>Đang gửi thông tin...</span>
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                <span>Thêm quán cà phê</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

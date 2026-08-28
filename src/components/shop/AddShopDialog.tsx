'use client';

import axios from 'axios';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  Coffee,
  Eye,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Tag,
  Trash2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { LocationPickerMap } from '@/components/shop/LocationPickerMap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { CoffeeShop } from '@/types/shop';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

const POPULAR_CATEGORIES = [
  { id: 'catering.cafe', label: 'Cà phê phin' },
  { id: 'specialty_coffee', label: 'Cà phê đặc sản' },
  // { id: 'specialty_drinks', label: 'Đồ uống đặc sản' },
  { id: 'bakery_dessert', label: 'Bánh ngọt' },
  { id: 'air_conditioned', label: 'Máy lạnh' },
  { id: 'high_speed_wifi', label: 'Wi-Fi tốc độ cao' },
  { id: 'quiet_workspace', label: 'Yên tĩnh học tập' },
  // { id: 'private_room', label: 'Phòng riêng' },
  { id: 'outdoor_garden', label: 'Sân vườn' },
  // { id: 'outdoor_seating', label: 'Không gian ngoài trời' },
  { id: 'parking_available', label: 'Chỗ đỗ xe' },
  { id: 'pet_friendly', label: 'Thú cưng' },
  { id: 'open_24_7', label: 'Mở 24/7' },
  // { id: 'live_music_acoustic', label: 'Acoustic' },
  // { id: 'kids_play_area', label: 'Khu vui chơi trẻ em' },
  { id: 'takeaway_service', label: 'Dịch vụ mang đi' }
];

const PRICE_OPTIONS: Array<'₫' | '₫₫' | '₫₫₫' | '₫₫₫₫'> = ['₫', '₫₫', '₫₫₫', '₫₫₫₫'];

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
  categories: z.array(z.string()),
  photos: z.array(z.string()),
  open_now: z.boolean(),
  open_time: z.string(),
  close_time: z.string()
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
  const { isAuthenticated } = useAuth();

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoCenteredRef = useRef(false);

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
      categories: ['catering.cafe'],
      photos: [],
      open_now: true,
      open_time: '07:00',
      close_time: '22:30'
    }
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
  const watchedCategories = watch('categories') || [];
  const watchedPhotos = watch('photos') || [];
  const watchedPrice = watch('price_range');
  const watchedOpenNow = watch('open_now');

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

  const toggleCategory = (catId: string) => {
    const exists = watchedCategories.includes(catId);
    const updated = exists
      ? watchedCategories.filter((c) => c !== catId)
      : [...watchedCategories, catId];
    setValue('categories', updated.length > 0 ? updated : ['catering.cafe'], {
      shouldValidate: true
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (watchedCategories.includes(trimmed)) {
      setCustomTag('');
      return;
    }
    setValue('categories', [...watchedCategories, trimmed], { shouldValidate: true });
    setCustomTag('');
  };

  const onSubmit = async (data: AddShopFormData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện thêm quán cà phê.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name.trim(),
        address: data.address.trim(),
        lat: Number(data.lat),
        lon: Number(data.lon),
        phone: data.phone?.trim() || undefined,
        website: data.website?.trim() || undefined,
        price_range: data.price_range || undefined,
        categories: data.categories,
        photos: data.photos,
        opening_hours: {
          open_now: data.open_now,
          periods: [
            {
              open: { day: 0, time: data.open_time || '07:00' },
              close: { day: 0, time: data.close_time || '22:30' }
            }
          ]
        }
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
            <div className='space-y-2'>
              <Label className='text-xs font-semibold text-foreground'>
                Đặc điểm &amp; Tiện ích nổi bật
              </Label>
              <div className='flex flex-wrap gap-2'>
                {POPULAR_CATEGORIES.map((cat) => {
                  const isSelected = watchedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type='button'
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-150 cursor-pointer select-none',
                        isSelected
                          ? 'bg-amber-gold text-primary-foreground border-amber-gold font-bold shadow-xs'
                          : 'bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {isSelected && <Check size={12} className='stroke-[3] flex-shrink-0' />}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className='flex items-center gap-2 pt-1'>
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder='Thêm tiện ích khác (VD: Acoustic, boardgame...)'
                  className='h-8 text-xs bg-secondary/40 border-border rounded-xl'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                  className='h-8 px-2.5 text-xs rounded-xl flex-shrink-0'
                >
                  <Plus size={13} />
                  <span>Thêm</span>
                </Button>
              </div>

              {/* Custom Tags Added */}
              {watchedCategories.filter((c) => !POPULAR_CATEGORIES.some((p) => p.id === c)).length >
                0 && (
                <div className='flex flex-wrap gap-1.5 pt-1'>
                  {watchedCategories
                    .filter((c) => !POPULAR_CATEGORIES.some((p) => p.id === c))
                    .map((tag) => (
                      <span
                        key={tag}
                        className='inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-gold text-primary-foreground shadow-xs'
                      >
                        <span>{tag}</span>
                        <button
                          type='button'
                          onClick={() => toggleCategory(tag)}
                          className='hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer'
                          aria-label={`Xóa tiện ích ${tag}`}
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                </div>
              )}
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

            {/* Photos URLs List */}
            <div className='space-y-2 pt-1'>
              <Label className='text-xs font-semibold text-foreground flex items-center justify-between'>
                <span>Hình ảnh quán ({watchedPhotos.length})</span>
                <span className='text-[10px] text-muted-foreground font-normal'>
                  URL trực tiếp (.jpg, .png, Unsplash)
                </span>
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
                  placeholder='Dán đường dẫn ảnh https://...'
                  className='h-9 text-xs bg-secondary/50 border-border rounded-xl'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className='h-9 px-3 text-xs rounded-xl flex-shrink-0'
                >
                  <Plus size={14} />
                  <span>Thêm ảnh</span>
                </Button>
              </div>

              {/* Photo Thumbnails List */}
              {watchedPhotos.length > 0 && (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1'>
                  {watchedPhotos.map((url, index) => (
                    <div
                      key={index}
                      className='relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group'
                    >
                      <img
                        src={url}
                        alt={`Ảnh quán ${index + 1}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => handleRemovePhoto(index)}
                        className='absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors'
                        title='Xóa ảnh này'
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
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
                  <div className='w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0'>
                    <img
                      src={
                        watchedPhotos[0] ||
                        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt='Preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-bold text-xs text-foreground truncate'>
                      {watchedName || 'Tên quán cà phê'}
                    </h4>
                    <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                      <MapPin size={10} className='inline mr-1 text-amber-gold' />
                      {watchedAddress || 'Địa chỉ quán'}
                    </p>
                    <div className='flex items-center gap-1.5 mt-1.5'>
                      <Badge
                        variant='outline'
                        className='text-[9px] px-1.5 py-0 bg-teal/20 text-teal border-teal/40'
                      >
                        {watchedOpenNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                      </Badge>
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

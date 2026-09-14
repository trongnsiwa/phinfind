'use client';

import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { API_ENDPOINTS, DEFAULT_LOCATION } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import dynamic from 'next/dynamic';
import { AddShopDialogFooter } from './AddShopDialogFooter';
import { AddShopDialogHeader } from './AddShopDialogHeader';
import { AmenitiesStep } from './AmenitiesStep';
import { BasicInfoStep } from './BasicInfoStep';
import { ContactStep } from './ContactStep';
import { LivePreviewCard } from './LivePreviewCard';
import { PriceStep } from './PriceStep';

const LocationStep = dynamic(
  () => import('./LocationStep').then((mod) => mod.LocationStep),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-xl border border-border bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Đang tải bản đồ...
      </div>
    ),
  }
);
const HoursStep = dynamic(
  () => import('./HoursStep').then((mod) => mod.HoursStep),
  { ssr: false }
);
const PhotosStep = dynamic(
  () => import('./PhotosStep').then((mod) => mod.PhotosStep),
  { ssr: false }
);
import type {
  AddShopDialogProps,
  AddShopFormData,
  PriceOption
} from './types';
import { useAddShopForm } from './useAddShopForm';
import { useShopAmenities } from './useShopAmenities';
import { useShopPhotos } from './useShopPhotos';
import { useShopSchedule } from './useShopSchedule';

export { DAYS_LIST, POPULAR_CATEGORIES } from './constants';
export type {
  AddShopDialogProps,
  AddShopFormData,
  Amenity,
  DayConfig,
  DayScheduleState,
  OpeningPeriod,
  PredefinedCategoryConfig,
  PriceOption
} from './types';

export function AddShopDialog({ open, onOpenChange, onSuccess, shop }: AddShopDialogProps) {
  const queryClient = useQueryClient();
  const setIsAddShopDialogOpen = useUIStore((state) => state.setIsAddShopDialogOpen);
  const scrollContainerRef = useRef<HTMLFormElement | null>(null);

  // RESPONSIVE: single-page form on mobile mirrors desktop; wizard removed due to implicit-submit regression.
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);

  const {
    lat: userLat,
    lng: userLng,
    loading: locationLoading,
    isFallback: isLocationFallback
  } = useLocation();
  const { user, isAuthenticated } = useAuth();
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
    resetToDefaults,
    resetToShop,
    errors,
    watchedName,
    watchedAddress,
    watchedPhotos,
    watchedPrice,
    watchedOpenNow
  } = useAddShopForm(initialLat, initialLon);

  const {
    isCustomPerDay,
    setIsCustomPerDay,
    sameOpenTime,
    setSameOpenTime,
    sameCloseTime,
    setSameCloseTime,
    weekSchedule,
    setWeekSchedule,
    handleToggleDay,
    handleDayTimeChange,
    handleCopyToAllDays,
    applyTimePreset,
    clearAllHours,
    enableAllDays,
    closeWeekendDays,
    handlePresetAllDays,
    handlePresetWeekdays,
    handlePreset247,
    computedPeriods,
    hasAnyHoursSet,
    populateSchedule
  } = useShopSchedule();

  const {
    amenities,
    customAmenityName,
    setCustomAmenityName,
    customAmenityDesc,
    setCustomAmenityDesc,
    togglePredefinedCategory,
    handleUpdateAmenityDescription,
    handleRemoveAmenity,
    handleAddCustomAmenity,
    populateAmenities,
    resetAmenities
  } = useShopAmenities();

  const {
    newPhotoUrl,
    setNewPhotoUrl,
    showUrlInput,
    setShowUrlInput,
    isUploadingPhoto,
    fileInputRef,
    handleFileUpload,
    handleAddPhoto,
    handleRemovePhoto,
    resetPhotos
  } = useShopPhotos({
    photos: watchedPhotos,
    onPhotosChange: (photos) => setValue('photos', photos, { shouldValidate: true }),
    user,
    isAuthenticated
  });

  // Initialize or reset form based on open state and shop
  useEffect(() => {
    if (open) {
      setIsCancelConfirmOpen(false);
      if (shop) {
        resetToShop(shop);
        populateAmenities(shop);
        populateSchedule(shop.opening_hours?.periods);
      } else {
        resetToDefaults(initialLat, initialLon);
        resetAmenities();
        clearAllHours();
        setIsCustomPerDay(false);
      }
    }
  }, [open, shop, initialLat, initialLon]);

  // Sync open state with global UI store so BottomNav is hidden on mobile
  useEffect(() => {
    setIsAddShopDialogOpen(open);
    return () => {
      setIsAddShopDialogOpen(false);
    };
  }, [open, setIsAddShopDialogOpen]);

  // Scroll listener for bottom fade affordance
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <= 10;
    setShowBottomFade(!isAtBottom);
  }, []);

  const handleCancel = () => {
    if (isMobile) {
      setIsCancelConfirmOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelConfirmOpen(false);
    onOpenChange(false);
  };

  // Validation feedback: scroll to first invalid field and shake
  const onInvalid = (fieldErrors: FieldErrors<AddShopFormData>) => {
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length === 0) return;

    const firstKey = errorKeys[0];
    const target =
      document.querySelector<HTMLElement>(`[name="${firstKey}"]`) ||
      document.getElementById(firstKey);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus({ preventScroll: true });
      target.classList.add('animate-shake');
      setTimeout(() => {
        target.classList.remove('animate-shake');
      }, 600);
    }
  };

  const onSubmit = async (data: AddShopFormData) => {
    if (!isAuthenticated) {
      toast.error(
        shop
          ? 'Vui lòng đăng nhập để cập nhật quán cà phê.'
          : 'Vui lòng đăng nhập để thêm quán cà phê.'
      );
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

      if (shop) {
        const updatePayload = {
          ...payload,
          place_id: shop.place_id || shop.id
        };

        const response = await axios.put<{
          success: boolean;
          message: string;
          shop: CoffeeShop;
        }>(API_ENDPOINTS.UPDATE_SHOP, updatePayload);

        if (response.data.success) {
          toast.success('Cập nhật quán cà phê thành công!', {
            description:
              'Thông tin quán đã được cập nhật và đang chờ quản trị viên xác minh lại.'
          });

          await queryClient.invalidateQueries({ queryKey: ['shops'] });

          if (onSuccess && response.data.shop) {
            onSuccess(response.data.shop);
          }

          onOpenChange(false);
        }
      } else {
        const response = await axios.post<{
          success: boolean;
          message: string;
          shop: CoffeeShop;
        }>(API_ENDPOINTS.CREATE_SHOP, payload);

        if (response.data.success) {
          toast.success('Thêm quán cà phê thành công!', {
            description:
              'Quán đã được lưu vào hệ thống và đang chờ quản trị viên xác minh.'
          });

          await queryClient.invalidateQueries({ queryKey: ['shops'] });

          if (onSuccess && response.data.shop) {
            onSuccess(response.data.shop);
          }

          resetToDefaults(initialLat, initialLon);
          clearAllHours();
          setIsCustomPerDay(false);
          resetPhotos();
          resetAmenities();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (shop
          ? 'Không thể cập nhật quán cà phê. Vui lòng thử lại.'
          : 'Không thể thêm quán cà phê. Vui lòng thử lại.');
      toast.error(shop ? 'Lỗi khi cập nhật quán' : 'Lỗi khi thêm quán', {
        description: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* RESPONSIVE: multi-step forms use full-screen dialog on mobile per platform conventions. */}
      <DialogContent
        className='fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 w-full max-w-none h-[100dvh] max-h-[100dvh] rounded-none border-none p-0 flex flex-col overflow-hidden bg-card md:fixed md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:inset-auto md:w-full md:max-w-2xl md:h-auto md:max-h-[92vh] md:rounded-3xl md:border md:border-border shadow-2xl [&>button:last-of-type]:hidden md:[&>button:last-of-type]:flex'
        aria-describedby='add-shop-dialog-desc'
      >
        <AddShopDialogHeader
          isEditMode={Boolean(shop)}
          onClose={handleCancel}
        />

        {/* Scrollable Form Body Container with Fade Mask */}
        <div className='relative flex-1 min-h-0 flex flex-col'>
          {/* RESPONSIVE: single-page form on mobile mirrors desktop; wizard removed due to implicit-submit regression */}
          <form
            id='add-shop-form'
            ref={scrollContainerRef}
            onScroll={handleScroll}
            // RESPONSIVE: prevent Enter-key form submission in mobile wizard steps
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLElement;
                if (target.tagName?.toLowerCase() === 'input') {
                  e.preventDefault();
                }
              }
            }}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className='flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 space-y-5'
          >
            <BasicInfoStep register={register} errors={errors} />

            <LocationStep
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              locationLoading={locationLoading}
              isLocationFallback={isLocationFallback}
            />

            <AmenitiesStep
              amenities={amenities}
              togglePredefinedCategory={togglePredefinedCategory}
              handleUpdateAmenityDescription={handleUpdateAmenityDescription}
              handleRemoveAmenity={handleRemoveAmenity}
              customAmenityName={customAmenityName}
              setCustomAmenityName={setCustomAmenityName}
              customAmenityDesc={customAmenityDesc}
              setCustomAmenityDesc={setCustomAmenityDesc}
              handleAddCustomAmenity={handleAddCustomAmenity}
            />

            <PriceStep
              value={watchedPrice}
              onChange={(val) => setValue('price_range', val)}
            />

            <HoursStep
              isCustomPerDay={isCustomPerDay}
              setIsCustomPerDay={setIsCustomPerDay}
              sameOpenTime={sameOpenTime}
              setSameOpenTime={setSameOpenTime}
              sameCloseTime={sameCloseTime}
              setSameCloseTime={setSameCloseTime}
              weekSchedule={weekSchedule}
              setWeekSchedule={setWeekSchedule}
              handleToggleDay={handleToggleDay}
              handleDayTimeChange={handleDayTimeChange}
              handleCopyToAllDays={handleCopyToAllDays}
              applyTimePreset={applyTimePreset}
              clearAllHours={clearAllHours}
              enableAllDays={enableAllDays}
              closeWeekendDays={closeWeekendDays}
              handlePresetAllDays={handlePresetAllDays}
              handlePresetWeekdays={handlePresetWeekdays}
              handlePreset247={handlePreset247}
              hasAnyHoursSet={hasAnyHoursSet}
            />

            <ContactStep register={register} errors={errors} />

            <PhotosStep
              photos={watchedPhotos}
              fileInputRef={fileInputRef}
              isUploadingPhoto={isUploadingPhoto}
              showUrlInput={showUrlInput}
              setShowUrlInput={setShowUrlInput}
              newPhotoUrl={newPhotoUrl}
              setNewPhotoUrl={setNewPhotoUrl}
              handleFileUpload={handleFileUpload}
              handleAddPhoto={handleAddPhoto}
              handleRemovePhoto={handleRemovePhoto}
            />

            <LivePreviewCard
              name={watchedName}
              address={watchedAddress}
              photo={watchedPhotos[0]}
              price={watchedPrice}
              openNow={watchedOpenNow}
              computedPeriods={computedPeriods}
              isCustomPerDay={isCustomPerDay}
              sameOpenTime={sameOpenTime}
              sameCloseTime={sameCloseTime}
            />
          </form>

          {/* Bottom Scroll Fade Indicator (mobile only) */}
          <div
            aria-hidden='true'
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent md:hidden transition-opacity duration-200',
              showBottomFade ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>

        <AddShopDialogFooter
          isEditMode={Boolean(shop)}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!watchedName?.trim() || !watchedAddress?.trim()}
          onCancel={handleCancel}
        />
      </DialogContent>

      {/* Confirmation dialog for canceling on Step 1 */}
      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent className='bg-card text-card-foreground border-border'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hủy bỏ thêm quán?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn hủy? Mọi thông tin đã nhập sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Tiếp tục
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Hủy bỏ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

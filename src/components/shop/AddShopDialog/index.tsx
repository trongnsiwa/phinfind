'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { API_ENDPOINTS, DEFAULT_LOCATION } from '@/lib/utils/constants';
import type { CoffeeShop } from '@/types/shop';
import { AddShopDialogFooter } from './AddShopDialogFooter';
import { AddShopDialogHeader } from './AddShopDialogHeader';
import { AmenitiesStep } from './AmenitiesStep';
import { BasicInfoStep } from './BasicInfoStep';
import { ContactStep } from './ContactStep';
import { HoursStep } from './HoursStep';
import { LivePreviewCard } from './LivePreviewCard';
import { LocationStep } from './LocationStep';
import { PhotosStep } from './PhotosStep';
import { PriceStep } from './PriceStep';
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

  // Initialize or reset form based on open state and shop (create vs edit mode)
  useEffect(() => {
    if (open) {
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
      <DialogContent
        className='w-[94vw] sm:w-full max-w-2xl max-h-[90vh] sm:max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-3xl'
        aria-describedby='add-shop-dialog-desc'
      >
        <AddShopDialogHeader isEditMode={Boolean(shop)} />

        {/* Scrollable Form Body */}
        <form
          id='add-shop-form'
          onSubmit={handleSubmit(onSubmit)}
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

          <ContactStep register={register} errors={errors} />

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

        <AddShopDialogFooter
          isEditMode={Boolean(shop)}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!watchedName?.trim() || !watchedAddress?.trim()}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

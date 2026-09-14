import { AlertCircle, Loader2, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import { LocationPickerMap } from '@/components/shop/LocationPickerMap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddShopFormData } from './types';

interface LocationStepProps {
  control: Control<AddShopFormData>;
  register: UseFormRegister<AddShopFormData>;
  setValue: UseFormSetValue<AddShopFormData>;
  errors: FieldErrors<AddShopFormData>;
  locationLoading: boolean;
  isLocationFallback: boolean;
}

export function LocationStep({
  control,
  register,
  setValue,
  errors,
  locationLoading,
  isLocationFallback
}: LocationStepProps) {
  const [showManualCoords, setShowManualCoords] = useState(false);

  return (
    <div id='step-2' data-step='2' className='space-y-3 pt-5 border-t border-border/40'>
      {/* MOBILE HEADER ( < md ): Two-line hierarchy */}
      <div className='md:hidden space-y-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-amber-gold'>Bước 2</span>
            <h3 className='text-sm font-bold text-foreground'>Vị trí trên bản đồ</h3>
          </div>
          <button
            type='button'
            onClick={() => setShowManualCoords(!showManualCoords)}
            className='text-[11px] text-amber-gold hover:underline font-medium cursor-pointer'
          >
            {showManualCoords ? 'Ẩn tọa độ tay' : 'Nhập tọa độ thủ công'}
          </button>
        </div>
        <div className='flex items-center justify-between text-[11px]'>
          <span className='font-medium text-rose-500'>* Bắt buộc</span>
          {/* Green Status as Subtitle */}
          <div>
            {locationLoading ? (
              <span className='flex items-center gap-1 text-amber-gold animate-pulse text-[10px]'>
                <Loader2 size={11} className='animate-spin' />
                <span>Đang định vị...</span>
              </span>
            ) : !isLocationFallback ? (
              <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]'>
                <Navigation size={11} className='fill-emerald-500 text-emerald-500' />
                <span>Đã định vị theo vị trí hiện tại</span>
              </span>
            ) : (
              <span className='flex items-center gap-1 text-muted-foreground/80 text-[10px]'>
                <MapPin size={11} className='text-muted-foreground' />
                <span>Vị trí mặc định (Hà Nội)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABLET / DESKTOP HEADER ( >= md ): Preserved */}
      <div className='hidden md:block space-y-2'>
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
      </div>

      {/* Embedded Leaflet Map */}
      <div className='h-52 md:h-60 w-full rounded-2xl overflow-hidden border border-border shadow-xs'>
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

      {/* MOBILE FOOTER STRIP ( < md ): Coordinate bar & OSM attribution outside map container */}
      <Controller
        control={control}
        name='lat'
        render={({ field: { value: currentLat } }) => (
          <Controller
            control={control}
            name='lon'
            render={({ field: { value: currentLon } }) => (
              <div className='md:hidden flex items-center justify-between px-3 py-1.5 bg-secondary/35 rounded-xl border border-border/70 text-muted-foreground text-[10px]'>
                <span>
                  Tọa độ:{' '}
                  <strong className='text-foreground font-mono font-medium'>
                    {Number(currentLat ?? 0).toFixed(5)}, {Number(currentLon ?? 0).toFixed(5)}
                  </strong>
                </span>
                <a
                  href='https://www.openstreetmap.org/copyright'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[9px] text-muted-foreground hover:underline'
                >
                  &copy; OpenStreetMap
                </a>
              </div>
            )}
          />
        )}
      />

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
  );
}

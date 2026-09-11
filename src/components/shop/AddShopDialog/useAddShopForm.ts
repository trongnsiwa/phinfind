import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { CoffeeShop } from '@/types/shop';
import { addShopFormSchema } from './constants';
import type { AddShopFormData, PriceOption } from './types';

export function useAddShopForm(defaultLat: number, defaultLon: number) {
  const form = useForm<AddShopFormData>({
    resolver: zodResolver(addShopFormSchema),
    defaultValues: {
      name: '',
      address: '',
      lat: defaultLat,
      lon: defaultLon,
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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = form;

  const watchedName = form.watch('name');
  const watchedAddress = form.watch('address');
  const watchedLat = form.watch('lat');
  const watchedLon = form.watch('lon');
  const watchedPhotos = form.watch('photos') || [];
  const watchedPrice = form.watch('price_range');
  const watchedOpenNow = form.watch('opening_hours.open_now') ?? true;

  const resetToDefaults = (lat: number, lon: number) => {
    reset({
      name: '',
      address: '',
      lat,
      lon,
      phone: '',
      website: '',
      price_range: undefined,
      photos: [],
      opening_hours: {
        open_now: true,
        periods: []
      }
    });
  };

  const resetToShop = (shop: CoffeeShop) => {
    reset({
      name: shop.name || '',
      address: shop.address || '',
      lat: shop.lat,
      lon: shop.lon,
      phone: shop.phone || '',
      website: shop.website || '',
      price_range: (['₫', '₫₫', '₫₫₫', '₫₫₫₫'].includes(shop.price_range as any)
        ? (shop.price_range as PriceOption)
        : undefined),
      photos: shop.photos || [],
      opening_hours: {
        open_now: shop.opening_hours?.open_now ?? true,
        periods: shop.opening_hours?.periods || []
      }
    });
  };

  return {
    form,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    resetToDefaults,
    resetToShop,
    errors,
    watchedName,
    watchedAddress,
    watchedLat,
    watchedLon,
    watchedPhotos,
    watchedPrice,
    watchedOpenNow
  };
}

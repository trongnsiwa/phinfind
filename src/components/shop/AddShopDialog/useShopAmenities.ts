import { useState } from 'react';
import { toast } from 'sonner';
import { POPULAR_CATEGORIES } from './constants';
import type { Amenity, PredefinedCategoryConfig } from './types';
import type { CoffeeShop } from '@/types/shop';

export function useShopAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [customAmenityName, setCustomAmenityName] = useState('');
  const [customAmenityDesc, setCustomAmenityDesc] = useState('');

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

  const populateAmenities = (shop?: CoffeeShop) => {
    if (!shop) {
      setAmenities([]);
      setCustomAmenityName('');
      setCustomAmenityDesc('');
      return;
    }

    if (shop.amenities && Array.isArray(shop.amenities) && shop.amenities.length > 0) {
      setAmenities(
        shop.amenities.map((a) => ({
          id: a.id || a.name,
          name: a.name,
          type: a.type === 'predefined' ? 'predefined' : 'custom',
          description: a.description || ''
        }))
      );
    } else if (shop.categories && Array.isArray(shop.categories) && shop.categories.length > 0) {
      const mappedAmenities: Amenity[] = [];
      shop.categories.forEach((catId: string) => {
        const predefined = POPULAR_CATEGORIES.find((c) => c.id === catId);
        if (predefined) {
          mappedAmenities.push({
            id: predefined.id,
            name: predefined.label,
            type: 'predefined',
            description: predefined.defaultDescription
          });
        }
      });
      setAmenities(mappedAmenities);
    } else {
      setAmenities([]);
    }
    setCustomAmenityName('');
    setCustomAmenityDesc('');
  };

  const resetAmenities = () => {
    setAmenities([]);
    setCustomAmenityName('');
    setCustomAmenityDesc('');
  };

  return {
    amenities,
    setAmenities,
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
  };
}

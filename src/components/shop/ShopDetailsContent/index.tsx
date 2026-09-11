'use client';

import { useRouter } from 'next/navigation';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AddShopDialog } from '@/components/shop/AddShopDialog';
import { SuggestEditDialog } from '@/components/shop/SuggestEditDialog';
import { VisitNoteDialog } from '@/components/shop/VisitNoteDialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import {
  useDeleteShop,
  useShopReviews,
  useToggleVisit,
  useUserSuggestions,
  useUserVisits
} from '@/hooks/useShops';
import { cn } from '@/lib/utils';
import { useShopStore } from '@/stores/useShopStore';
import { useUIStore } from '@/stores/useUIStore';
import type { CoffeeShop } from '@/types/shop';
import { AmenitiesTab } from './AmenitiesTab';
import { DeleteShopDialog } from './DeleteShopDialog';
import { Gallery } from './Gallery';
import { Header } from './Header';
import { OverviewTab } from './OverviewTab';
import { PhotosTab } from './PhotosTab';
import { ReviewsTab } from './ReviewsTab';
import { TabBar } from './TabBar';
import type {
  AmenitiesTabProps,
  ComputedSchedule,
  DaySchedule,
  ShopDetailsContentProps
} from './types';
import { buildGalleryPhotos, getShopSchedule } from './utils';

export type {
  AmenitiesTabProps,
  ComputedSchedule,
  DaySchedule,
  ShopDetailsContentProps
};
export {
  AmenitiesTab,
  getShopSchedule,
  OverviewTab,
  PhotosTab,
  ReviewsTab
};

const EXPERIENCE_TAGLINE =
  'Quán cà phê thủ công ấm cúng với các mẻ rang đặc sản, góc ngồi học tập yên tĩnh & đồ uống thơm ngon.';

export const ShopDetailsContent = memo(function ShopDetailsContent({
  shop,
  isSidebar = false,
  isStandalone = false,
  hideActions = false,
  hideInlineActions = false,
  onSelectShop,
  scrollRef,
  onTabChange,
  isVisited: isVisitedProp
}: ShopDetailsContentProps) {
  const { shops, setSelectedShop } = useShopStore();
  const openImagePreview = useUIStore((state) => state.openImagePreview);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const deleteShopMutation = useDeleteShop();
  const { data: userVisits = [] } = useUserVisits();
  const toggleVisitMutation = useToggleVisit();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'amenities'>('overview');
  const isFirstRender = useRef(true);

  const isOwner = Boolean(user && shop.created_by && user.id === shop.created_by);
  const shopPlaceId = shop.place_id || shop.id;

  const { data: userSuggestionData } = useUserSuggestions(
    isAuthenticated && !isOwner ? shopPlaceId : undefined
  );
  const hasPendingSuggestion = Boolean(userSuggestionData?.hasPending);
  const currentVisit = userVisits.find((v) => v.shop_place_id === shopPlaceId);
  const storeIsVisited = useShopStore((state) => state.visits.includes(shopPlaceId));
  const currentIsVisited =
    isVisitedProp !== undefined ? isVisitedProp : Boolean(storeIsVisited || currentVisit);
  const currentVisitNote = currentVisit?.note || null;

  const handleConfirmVisitNote = (note: string | null) => {
    toggleVisitMutation(shopPlaceId, {
      name: shop.name,
      address: shop.address,
      note,
      updateOnly: true
    });
  };

  const handleDeleteShop = async () => {
    try {
      await deleteShopMutation.mutateAsync(shop.place_id || shop.id);
      setIsDeleteDialogOpen(false);
      setSelectedShop(null);
      if (isStandalone) {
        router.push('/');
      }
    } catch {
      // Error is handled by useDeleteShop toast
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onTabChange) {
      onTabChange();
    }
  }, [activeTab, onTabChange]);

  useEffect(() => {
    setActiveTab('overview');
    isFirstRender.current = true;
  }, [shop?.id]);

  const handleSelectShop = (s: CoffeeShop) => {
    if (onSelectShop) {
      onSelectShop(s);
    } else {
      setSelectedShop(s);
    }
  };

  const scheduleInfo = useMemo(() => getShopSchedule(shop.opening_hours), [shop.opening_hours]);

  const similarShops = useMemo(() => {
    if (!shops) return [];
    return shops.filter((s) => s.id !== shop.id).slice(0, 3);
  }, [shop.id, shops]);

  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
  };

  const placeId = shop.place_id || shop.id || '';
  const { data: reviews = [], isLoading: isReviewsLoading } = useShopReviews(placeId);

  const galleryPhotos = useMemo(() => buildGalleryPhotos(shop, reviews), [shop, reviews]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as any)}
      className='flex-1 flex flex-col min-h-0 h-full w-full'
    >
      {/* HEADER SECTION: Gallery collage, title, metrics, and tab navigation */}
      <div
        className={cn(
          'flex-shrink-0 space-y-3.5 select-none',
          isSidebar ? 'px-4 pt-3' : isStandalone ? 'px-0 pt-0' : 'px-4 sm:px-6 pt-2'
        )}
      >
        <Gallery
          shop={shop}
          galleryPhotos={galleryPhotos}
          isLoading={isReviewsLoading}
          onOpenPhoto={(idx) => openImagePreview(galleryPhotos, idx)}
        />

        <Header
          shop={shop}
          scheduleInfo={scheduleInfo}
          isAuthenticated={isAuthenticated}
          isOwner={isOwner}
          hasPendingSuggestion={hasPendingSuggestion}
          onEditShop={() => setIsEditDialogOpen(true)}
          onDeleteShop={() => setIsDeleteDialogOpen(true)}
          onSuggestEdit={() => setIsSuggestDialogOpen(true)}
        />

        <TabBar onTabChange={onTabChange} isStandalone={isStandalone} />
      </div>

      {/* SCROLLABLE BODY SECTION */}
      <div
        ref={isStandalone ? undefined : scrollRef}
        data-vaul-no-drag={!isStandalone}
        className={cn(
          isStandalone
            ? 'w-full pt-3'
            : 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pt-3 pb-24 sm:pb-28',
          isSidebar ? 'px-4' : isStandalone ? 'px-0' : 'px-4 sm:px-6'
        )}
      >
        <TabsContent value='overview' className='mt-0 focus-visible:outline-none'>
          <OverviewTab
            shop={shop}
            experienceTagline={EXPERIENCE_TAGLINE}
            getDirectionsUrl={getDirectionsUrl}
            onSelectShop={handleSelectShop}
            similarShops={similarShops}
            scheduleInfo={scheduleInfo}
            isStandalone={isStandalone}
            hideActions={hideActions}
            hideInlineActions={hideInlineActions}
            isVisited={currentIsVisited}
            visitNote={currentVisitNote}
            onEditNote={() => setIsNoteDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value='photos' className='mt-0 focus-visible:outline-none'>
          <PhotosTab shop={shop} photos={galleryPhotos} />
        </TabsContent>

        <TabsContent value='reviews' className='mt-0 focus-visible:outline-none'>
          <ReviewsTab shop={shop} isSidebar={isSidebar} isStandalone={isStandalone} />
        </TabsContent>

        <TabsContent value='amenities' className='mt-0 focus-visible:outline-none'>
          <AmenitiesTab shop={shop} />
        </TabsContent>
      </div>

      {/* Dialogs for Shop Owner */}
      {isOwner && (
        <>
          <AddShopDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            shop={shop}
            onSuccess={(updatedShop) => {
              setSelectedShop(updatedShop);
            }}
          />

          <DeleteShopDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            shopName={shop.name}
            isPending={deleteShopMutation.isPending}
            onConfirmDelete={handleDeleteShop}
          />
        </>
      )}

      {/* Community Suggest Edit Dialog */}
      {isAuthenticated && !isOwner && (
        <SuggestEditDialog
          open={isSuggestDialogOpen}
          onOpenChange={setIsSuggestDialogOpen}
          shop={shop}
        />
      )}

      {/* Visit Note Dialog for Editing/Adding Notes from Overview tab */}
      <VisitNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        shop={shop}
        existingNote={currentVisitNote}
        onConfirm={handleConfirmVisitNote}
      />
    </Tabs>
  );
});

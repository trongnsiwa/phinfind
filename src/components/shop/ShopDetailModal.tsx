'use client';

import React from 'react';
import { ShopDrawer, ShopDrawerProps } from '@/components/shop/ShopDrawer';

export type ShopDetailModalProps = ShopDrawerProps;

/**
 * ShopDetailModal
 * Backwards-compatible wrapper delegating to the unified Google Maps-style ShopDrawer.
 */
export function ShopDetailModal(props: ShopDetailModalProps) {
  return <ShopDrawer {...props} />;
}

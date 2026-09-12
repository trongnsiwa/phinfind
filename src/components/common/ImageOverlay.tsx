'use client';

import dynamic from 'next/dynamic';
import { useUIStore } from '@/stores/useUIStore';

const ImageOverlayModal = dynamic(
  () => import('./ImageOverlayModal').then((mod) => mod.ImageOverlayModal),
  { ssr: false, loading: () => null }
);

export function ImageOverlay() {
  const isOpen = useUIStore((state) => state.imagePreview.isOpen);
  if (!isOpen) return null;
  return <ImageOverlayModal />;
}

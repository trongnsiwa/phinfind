import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { PhotosStep } from '../PhotosStep';

describe('PhotosStep', () => {
  const samplePhotos = [
    'https://images.unsplash.com/photo-1?w=400',
    'https://images.unsplash.com/photo-2?w=400',
    'https://images.unsplash.com/photo-3?w=400'
  ];

  function TestWrapper({
    initialPhotos = samplePhotos,
    onPhotosChangeSpy,
    useExternalHandleSetCover = false
  }: {
    initialPhotos?: string[];
    onPhotosChangeSpy?: (photos: string[]) => void;
    useExternalHandleSetCover?: boolean;
  }) {
    const [photos, setPhotos] = useState<string[]>(initialPhotos);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = useState('');

    const handlePhotosChange = (newPhotos: string[]) => {
      setPhotos(newPhotos);
      onPhotosChangeSpy?.(newPhotos);
    };

    const handleSetCover = (index: number) => {
      const next = [...photos];
      const temp = next[0];
      next[0] = next[index];
      next[index] = temp;
      handlePhotosChange(next);
    };

    return (
      <PhotosStep
        photos={photos}
        fileInputRef={fileInputRef}
        isUploadingPhoto={false}
        showUrlInput={showUrlInput}
        setShowUrlInput={setShowUrlInput}
        newPhotoUrl={newPhotoUrl}
        setNewPhotoUrl={setNewPhotoUrl}
        handleFileUpload={vi.fn()}
        handleAddPhoto={vi.fn()}
        handleRemovePhoto={(index) => {
          handlePhotosChange(photos.filter((_, i) => i !== index));
        }}
        handleSetCover={useExternalHandleSetCover ? handleSetCover : undefined}
        onPhotosChange={handlePhotosChange}
      />
    );
  }

  it('renders three images, clicks "Set as cover" on the second image, and asserts the second image is now at index 0 with the badge while the first image is at index 1 without the badge', () => {
    const onPhotosChangeSpy = vi.fn();
    render(<TestWrapper onPhotosChangeSpy={onPhotosChangeSpy} />);

    // Initially: image 1 is at index 0, image 2 is at index 1, image 3 is at index 2
    const initialImages = screen.getAllByRole('img');
    expect(initialImages).toHaveLength(3);
    expect(initialImages[0]).toHaveAttribute('src', expect.stringContaining('photo-1'));
    expect(initialImages[1]).toHaveAttribute('src', expect.stringContaining('photo-2'));
    expect(initialImages[2]).toHaveAttribute('src', expect.stringContaining('photo-3'));

    // Check cover badge on the first image initially
    const initialBadge = screen.getByText('Ảnh đại diện');
    expect(initialBadge.closest('div.relative')).toContainElement(initialImages[0]);
    expect(initialBadge.closest('div.relative')).not.toContainElement(initialImages[1]);

    // There should be 2 "Chọn làm ảnh đại diện" buttons (for index 1 and index 2)
    const setCoverButtons = screen.getAllByRole('button', { name: 'Chọn làm ảnh đại diện' });
    expect(setCoverButtons).toHaveLength(2);

    // Click "Set as cover" button on the second image (first button in setCoverButtons)
    fireEvent.click(setCoverButtons[0]);

    // Assert that onPhotosChange was called with the swapped array
    expect(onPhotosChangeSpy).toHaveBeenCalledWith([
      samplePhotos[1],
      samplePhotos[0],
      samplePhotos[2]
    ]);

    // Re-query the updated images in DOM
    const updatedImages = screen.getAllByRole('img');
    expect(updatedImages[0]).toHaveAttribute('src', expect.stringContaining('photo-2'));
    expect(updatedImages[1]).toHaveAttribute('src', expect.stringContaining('photo-1'));
    expect(updatedImages[2]).toHaveAttribute('src', expect.stringContaining('photo-3'));

    // Assert that the second image is now at index 0 and displays the "Ảnh đại diện" badge
    const updatedBadge = screen.getByText('Ảnh đại diện');
    expect(updatedBadge.closest('div.relative')).toContainElement(updatedImages[0]);

    // Assert that the original first image is now at index 1 and no longer displays the badge
    expect(updatedBadge.closest('div.relative')).not.toContainElement(updatedImages[1]);

    // The original first image (now at index 1) should now have a "Chọn làm ảnh đại diện" button
    const updatedSetCoverButtons = screen.getAllByRole('button', { name: 'Chọn làm ảnh đại diện' });
    expect(updatedSetCoverButtons).toHaveLength(2);
    expect(updatedSetCoverButtons[0].closest('div.relative')).toContainElement(updatedImages[1]);
  });

  it('does not display "Chọn làm ảnh đại diện" button on the current cover image at index 0', () => {
    render(<TestWrapper />);

    const images = screen.getAllByRole('img');
    const firstImageContainer = images[0].closest('div.relative');
    expect(firstImageContainer).not.toBeNull();

    // The first image container must not contain any button with "Chọn làm ảnh đại diện"
    const setCoverInFirstContainer = firstImageContainer?.querySelector(
      'button[aria-label="Chọn làm ảnh đại diện"]'
    );
    expect(setCoverInFirstContainer).toBeNull();
  });

  it('renders "Chọn làm ảnh đại diện" button with minimum 44px tap target on mobile and accessible titles', () => {
    render(<TestWrapper />);

    const setCoverButtons = screen.getAllByRole('button', { name: 'Chọn làm ảnh đại diện' });
    expect(setCoverButtons.length).toBeGreaterThan(0);

    const firstButton = setCoverButtons[0];
    expect(firstButton).toHaveAttribute('title', 'Chọn làm ảnh đại diện');
    expect(firstButton.className).toContain('min-h-[44px]');
    expect(firstButton.className).toContain('min-w-[44px]');
  });

  it('promotes the second image to cover when the cover image is deleted', () => {
    const onPhotosChangeSpy = vi.fn();
    render(<TestWrapper onPhotosChangeSpy={onPhotosChangeSpy} />);

    // Delete the cover image (index 0)
    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa ảnh này' });
    fireEvent.click(deleteButtons[0]);

    expect(onPhotosChangeSpy).toHaveBeenCalledWith([samplePhotos[1], samplePhotos[2]]);

    const updatedImages = screen.getAllByRole('img');
    expect(updatedImages).toHaveLength(2);
    expect(updatedImages[0]).toHaveAttribute('src', expect.stringContaining('photo-2'));

    // The previous photo 2 is now the cover image with badge
    const badge = screen.getByText('Ảnh đại diện');
    expect(badge.closest('div.relative')).toContainElement(updatedImages[0]);
  });

  it('renders three staged blob images, clicks "Set as cover" on the second image, and asserts the second image is now at index 0 with cover badge', () => {
    const stagedPhotos = [
      'blob:http://localhost:3000/stage-1',
      'blob:http://localhost:3000/stage-2',
      'blob:http://localhost:3000/stage-3'
    ];
    const onPhotosChangeSpy = vi.fn();
    render(<TestWrapper initialPhotos={stagedPhotos} onPhotosChangeSpy={onPhotosChangeSpy} />);

    const initialImages = screen.getAllByRole('img');
    expect(initialImages[0]).toHaveAttribute('src', expect.stringContaining('stage-1'));
    expect(initialImages[1]).toHaveAttribute('src', expect.stringContaining('stage-2'));

    const setCoverButtons = screen.getAllByRole('button', { name: 'Chọn làm ảnh đại diện' });
    fireEvent.click(setCoverButtons[0]);

    expect(onPhotosChangeSpy).toHaveBeenCalledWith([
      'blob:http://localhost:3000/stage-2',
      'blob:http://localhost:3000/stage-1',
      'blob:http://localhost:3000/stage-3'
    ]);

    const updatedImages = screen.getAllByRole('img');
    expect(updatedImages[0]).toHaveAttribute('src', expect.stringContaining('stage-2'));
    expect(updatedImages[1]).toHaveAttribute('src', expect.stringContaining('stage-1'));

    const badge = screen.getByText('Ảnh đại diện');
    expect(badge.closest('div.relative')).toContainElement(updatedImages[0]);
    expect(badge.closest('div.relative')).not.toContainElement(updatedImages[1]);
  });
});

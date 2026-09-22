import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareMenu } from '../ShareMenu';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ShareMenu', () => {
  const defaultProps = {
    url: 'https://phinfind.vn/shop/shop-123',
    title: 'PhinFind Coffee Roastery'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default matchMedia mock (desktop viewport: matches is false for max-width: 767px)
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders trigger button with accessible label and minimum 44px touch target', () => {
    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    expect(trigger).toBeInTheDocument();
    expect(trigger.className).toContain('min-h-[44px]');
    expect(trigger.className).toContain('h-11');
  });

  it('opens dropdown menu on desktop with five items', async () => {
    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /Facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /X \(Twitter\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Zalo/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Telegram/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Sao chép liên kết/i })).toBeInTheDocument();
    });
  });

  it('renders Facebook item with valid link attributes and URL encoding', async () => {
    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    fireEvent.click(trigger);

    const fbItem = await screen.findByRole('menuitem', { name: 'Chia sẻ qua Facebook' });
    expect(fbItem).toBeInTheDocument();
    expect(fbItem).toHaveAttribute('target', '_blank');
    expect(fbItem).toHaveAttribute('rel', 'noopener noreferrer');
    expect(fbItem.getAttribute('href')).toContain('facebook.com/sharer/sharer.php?u=');
    expect(fbItem.getAttribute('href')).toContain(encodeURIComponent(defaultProps.url));
  });

  it('copies URL to clipboard and displays toast exactly once on copy action', async () => {
    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    fireEvent.click(trigger);

    // Opening dropdown should NOT fire any toast
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    const copyItem = await screen.findByRole('menuitem', { name: 'Sao chép liên kết' });
    fireEvent.click(copyItem);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith('Đã sao chép liên kết vào bộ nhớ tạm!');
    });
  });

  it('invokes native navigator.share on mobile without opening dropdown when supported', async () => {
    // Set matchMedia to match mobile
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 767px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      share: mockShare
    });

    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    fireEvent.click(trigger);

    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: defaultProps.title,
        url: defaultProps.url
      })
    );

    // Dropdown items should NOT be shown
    expect(screen.queryByRole('menuitem', { name: /Facebook/i })).not.toBeInTheDocument();
  });

  it('handles navigator.share AbortError gracefully on mobile', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width: 767px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    const mockShare = vi.fn().mockRejectedValue(abortError);
    Object.assign(navigator, {
      share: mockShare
    });

    render(<ShareMenu {...defaultProps} />);

    const trigger = screen.getByRole('button', { name: 'Chia sẻ' });
    // Should not throw
    expect(() => fireEvent.click(trigger)).not.toThrow();
  });
});

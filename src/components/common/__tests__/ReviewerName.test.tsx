import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ReviewerName } from '../ReviewerName';

describe('ReviewerName', () => {
  it('renders a public profile link when username is present and valid', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <ReviewerName author="Nguyễn Sĩ Trọng" username="trongnsi" />
      </div>
    );

    const link = screen.getByRole('link', { name: 'Nguyễn Sĩ Trọng' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/u/trongnsi');
    expect(link.className).toContain('min-h-[44px]');
    expect(link.className).toContain('cursor-pointer');
    expect(link.className).toContain('hover:text-primary');
    expect(link.className).toContain('focus-visible:ring-amber-gold');

    // Clicking link should stopPropagation and not trigger parent click
    fireEvent.click(link);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('encodes special characters in username URL', () => {
    render(<ReviewerName author="Alice" username="alice foo&bar" />);
    const link = screen.getByRole('link', { name: 'Alice' });
    expect(link).toHaveAttribute('href', '/u/alice%20foo%26bar');
  });

  it('renders subtle hint and aria-disabled without link when username is null', () => {
    const { container } = render(<ReviewerName author="Trọng Đi Trốn" username={null} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Trọng Đi Trốn')).toBeInTheDocument();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    const disabledWrapper = container.querySelector('[aria-disabled="true"]');
    expect(disabledWrapper).toBeInTheDocument();
    expect(disabledWrapper?.className).toContain('text-muted-foreground');
    expect(disabledWrapper?.className).toContain('min-h-[44px]');
    expect(disabledWrapper?.className).toContain('cursor-default');
  });

  it('renders subtle hint without link when username is "null" or "undefined" or empty string', () => {
    const { rerender } = render(<ReviewerName author="User A" username="null" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(<ReviewerName author="User B" username="undefined" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(<ReviewerName author="User C" username="" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(<ReviewerName author="User D" username="   " />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();
  });
});

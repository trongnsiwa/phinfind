import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PublicReviewCard } from '../PublicReviewCard';
import type { ReviewData } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

const mockReview: ReviewData = {
  id: 'rev-1',
  author: 'Trong Nguyen',
  shop_place_id: 'place-123',
  shop_name: 'Phin Xanh Coffee',
  shop_address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  rating: 5,
  comment: 'Cà phê phin đậm đà chuẩn vị, không gian thoáng đãng.',
  images: ['https://example.com/review1.jpg'],
  created_at: '2026-09-20T10:00:00Z',
  user_id: 'user-1',
};

describe('PublicReviewCard', () => {
  it('renders shop info, rating, date, and comment without mobile divider', () => {
    const { container } = render(<PublicReviewCard review={mockReview} />);

    expect(screen.getByText('Phin Xanh Coffee')).toBeInTheDocument();
    expect(screen.getByText('123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(
      screen.getByText('Cà phê phin đậm đà chuẩn vị, không gian thoáng đãng.')
    ).toBeInTheDocument();

    // Comment container should have md:border-t (no border on mobile < md)
    const commentContainer = container.querySelector('.md\\:border-t');
    expect(commentContainer).toBeInTheDocument();
    expect(commentContainer?.className).not.toMatch(/(^|\s)border-t(\s|$)/);
  });

  it('renders mobile kebab action with >= 44x44px tap target and desktop inline actions', () => {
    render(
      <PublicReviewCard
        review={mockReview}
        action={
          <>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Tùy chọn đánh giá"
                    className="w-11 h-11 min-h-[44px] min-w-[44px] p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 flex items-center justify-center cursor-pointer"
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil size={14} />
                    <span>Chỉnh sửa đánh giá</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 size={14} />
                    <span>Xóa đánh giá</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Button variant="ghost" size="sm">
                <Pencil size={13} />
                <span>Sửa</span>
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 size={13} />
                <span>Xóa</span>
              </Button>
            </div>
          </>
        }
      />
    );

    const kebabBtn = screen.getByRole('button', { name: 'Tùy chọn đánh giá' });
    expect(kebabBtn).toBeInTheDocument();
    expect(kebabBtn.className).toContain('min-h-[44px]');
    expect(kebabBtn.className).toContain('min-w-[44px]');

    const editBtn = screen.getByRole('button', { name: /sửa/i });
    expect(editBtn.parentElement?.className).toContain('hidden md:flex');
  });

  it('renders reviewer name as link to /u/[username] with >= 44px tap target when username exists', () => {
    const reviewWithUsername: ReviewData = {
      ...mockReview,
      username: 'trongnsi',
    };

    render(<PublicReviewCard review={reviewWithUsername} />);

    const reviewerLink = screen.getByRole('link', { name: 'Trong Nguyen' });
    expect(reviewerLink).toBeInTheDocument();
    expect(reviewerLink).toHaveAttribute('href', '/u/trongnsi');
    expect(reviewerLink.className).toContain('min-h-[44px]');
    expect(reviewerLink.className).toContain('cursor-pointer');
    expect(reviewerLink.className).toContain('hover:text-primary');
  });

  it('renders reviewer name with subtle hint "(chưa có hồ sơ)" and aria-disabled without link when username is missing', () => {
    const { container } = render(<PublicReviewCard review={mockReview} />);

    // Should not render reviewer as link
    expect(screen.queryByRole('link', { name: /trong nguyen/i })).toBeNull();
    expect(screen.getByText('Trong Nguyen')).toBeInTheDocument();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    const disabledAuthor = container.querySelector('[aria-disabled="true"]');
    expect(disabledAuthor).toBeInTheDocument();
    expect(disabledAuthor?.className).toContain('text-muted-foreground');
  });

  it('safely handles edge case usernames like "null", "undefined", and empty string', () => {
    const { rerender } = render(
      <PublicReviewCard review={{ ...mockReview, username: 'null' }} />
    );
    expect(screen.queryByRole('link', { name: /trong nguyen/i })).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(<PublicReviewCard review={{ ...mockReview, username: 'undefined' }} />);
    expect(screen.queryByRole('link', { name: /trong nguyen/i })).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();

    rerender(<PublicReviewCard review={{ ...mockReview, username: '' }} />);
    expect(screen.queryByRole('link', { name: /trong nguyen/i })).toBeNull();
    expect(screen.getByText('(chưa có hồ sơ)')).toBeInTheDocument();
  });
});

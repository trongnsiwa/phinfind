import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileSocialLinks } from '../ProfileSocialLinks';

describe('ProfileSocialLinks', () => {
  it('renders null when no links are present', () => {
    const { container } = render(
      <ProfileSocialLinks
        profile={{
          full_name: 'Nguyễn Văn A',
          username: 'anguyen',
          facebook_url: null,
          instagram_url: null,
          tiktok_url: null,
          website_url: null,
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders only populated links with target="_blank", rel="noopener noreferrer", and aria-label', () => {
    render(
      <ProfileSocialLinks
        profile={{
          full_name: 'Nguyễn Văn A',
          username: 'anguyen',
          facebook_url: 'https://facebook.com/anguyen',
          instagram_url: null,
          tiktok_url: null,
          website_url: 'https://anguyen.dev',
        }}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    const fbLink = screen.getByRole('link', { name: /mở facebook của nguyễn văn a/i });
    expect(fbLink).toHaveAttribute('href', 'https://facebook.com/anguyen');
    expect(fbLink).toHaveAttribute('target', '_blank');
    expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(fbLink.className).toContain('min-h-[44px]');

    const webLink = screen.getByRole('link', { name: /mở website của nguyễn văn a/i });
    expect(webLink).toHaveAttribute('href', 'https://anguyen.dev');
    expect(webLink).toHaveAttribute('target', '_blank');
    expect(webLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(webLink.className).toContain('min-h-[44px]');
  });

  it('renders all four links when all are populated', () => {
    render(
      <ProfileSocialLinks
        profile={{
          full_name: null,
          username: 'coffee_lover',
          facebook_url: 'https://facebook.com/coffeelover',
          instagram_url: 'https://instagram.com/coffeelover',
          tiktok_url: 'https://tiktok.com/@coffeelover',
          website_url: 'https://coffeelover.vn',
        }}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);

    expect(screen.getByRole('link', { name: /mở facebook của coffee_lover/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mở instagram của coffee_lover/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mở tiktok của coffee_lover/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mở website của coffee_lover/i })).toBeInTheDocument();
  });

  it('accepts UserProfile object from private profile page', () => {
    const userProfile = {
      id: 'usr_1',
      user_id: 'usr_1',
      email: 'trongnsi.dev@gmail.com',
      full_name: 'Nguyễn Sĩ Trọng',
      username: 'trongnsi',
      bio: 'Thích đi cà phê một mình',
      avatar_url: 'https://example.com/avatar.jpg',
      role: 'user' as const,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      facebook_url: 'https://facebook.com/quancafe',
      instagram_url: null,
      tiktok_url: null,
      website_url: 'https://phinfind.vn',
    };

    render(<ProfileSocialLinks profile={userProfile} className="pt-1.5" />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(screen.getByRole('link', { name: /mở facebook của nguyễn sĩ trọng/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mở website của nguyễn sĩ trọng/i })).toBeInTheDocument();
  });
});

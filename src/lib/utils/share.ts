export interface ShareTarget {
  id: 'facebook' | 'x' | 'zalo' | 'telegram' | 'copy';
  label: string;
  href?: string;
}

export function buildShareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`
    },
    {
      id: 'x',
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`
    },
    {
      id: 'zalo',
      label: 'Zalo',
      href: `https://zalo.me/share?u=${u}`
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${u}&text=${t}`
    },
    {
      id: 'copy',
      label: 'Sao chép liên kết'
    }
  ];
}

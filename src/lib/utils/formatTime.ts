/**
 * Format an ISO date string into a localized Vietnamese relative time string.
 * Examples:
 * - < 1 minute: "Vừa xong"
 * - < 60 minutes: "X phút trước"
 * - < 24 hours (today): "X giờ trước"
 * - Yesterday: "Hôm qua"
 * - < 7 days: "X ngày trước"
 * - Older: "dd/MM/yyyy" (e.g. "12/03/2026")
 */
export function formatRelativeTime(iso: string): string {
  if (!iso) return '';

  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If timestamp is slightly in the future (clock skew) or < 60 seconds
  if (diffMs < 60 * 1000) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

  // Check if date is yesterday by calendar date
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round((today.getTime() - itemDate.getTime()) / (24 * 60 * 60 * 1000));

  if (dayDifference === 0) {
    return `${diffHours} giờ trước`;
  }

  if (dayDifference === 1) {
    return 'Hôm qua';
  }

  if (dayDifference < 7) {
    return `${dayDifference} ngày trước`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

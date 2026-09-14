import { useShopStore } from '@/stores/useShopStore';

/**
 * Short-lived set of recently deleted shop IDs to prevent resurrecting from
 * stale React Query caches during or immediately after deletion.
 */
const recentlyDeletedShopIds = new Set<string>();

/**
 * Records shop ID(s) as recently deleted for a cooldown window (~5s).
 */
export function markShopAsDeleted(
  idOrIds: string | (string | null | undefined)[] | null | undefined,
  ttlMs = 5000
): void {
  if (!idOrIds) return;
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  ids.forEach((id) => {
    if (!id) return;
    recentlyDeletedShopIds.add(id);
    setTimeout(() => {
      recentlyDeletedShopIds.delete(id);
    }, ttlMs);
  });
}

/**
 * Checks if a shop ID was recently deleted within the cooldown window.
 */
export function isShopRecentlyDeleted(id: string | null | undefined): boolean {
  if (!id) return false;
  return recentlyDeletedShopIds.has(id);
}

/**
 * Removes the 'shop' query parameter from the URL using window.history.replaceState
 * without creating a new history entry.
 */
export function clearShopQueryParam(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('shop')) {
      url.searchParams.delete('shop');
      const newSearch = url.searchParams.toString();
      const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash;
      window.history.replaceState(null, '', newUrl);
    }
  } catch {
    // Ignore URL parse errors in non-browser or test environments
  }
}

/**
 * Single source of truth for closing any active shop drawer or sidebar cleanly.
 * (a) Sets selectedShop to null in the store.
 * (b) Cleans the ?shop= query parameter from window.location via replaceState if clearUrl is true.
 */
export function closeActiveShop({ clearUrl = true }: { clearUrl?: boolean } = {}): void {
  useShopStore.getState().setSelectedShop(null);
  if (clearUrl) {
    clearShopQueryParam();
  }
}

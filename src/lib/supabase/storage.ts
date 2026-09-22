export interface StorageDeletionSummary {
  deleted: number;
  skipped: number;
  failed: number;
}

/**
 * Extracts the storage object path from a Supabase Storage public URL.
 * e.g., "https://xyz.supabase.co/storage/v1/object/public/shop-photos/reviews/user-1/img.jpg?t=123"
 * -> "reviews/user-1/img.jpg"
 */
export function extractStoragePath(url: string, bucket: string = 'shop-photos'): string | null {
  if (!url || typeof url !== 'string') return null;

  const marker = `/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  const pathWithQuery = url.slice(markerIndex + marker.length);
  if (!pathWithQuery) return null;

  const cleanPath = pathWithQuery.split('?')[0].split('#')[0];
  if (!cleanPath) return null;

  try {
    return decodeURIComponent(cleanPath);
  } catch {
    return cleanPath;
  }
}

/**
 * Best-effort deletion of storage files given an array of public URLs.
 * Strict ownership guard: only paths starting with expectedPathPrefix will be deleted.
 * Deduplicates paths and never throws on error.
 */
export async function deleteStorageFilesFromUrls(
  supabase: any,
  urls: string[],
  expectedPathPrefix: string,
  bucket: string = 'shop-photos'
): Promise<StorageDeletionSummary> {
  let skipped = 0;
  let deleted = 0;
  let failed = 0;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return { deleted: 0, skipped: 0, failed: 0 };
  }

  const validPathsSet = new Set<string>();

  for (const url of urls) {
    const path = extractStoragePath(url, bucket);
    if (!path || !path.startsWith(expectedPathPrefix)) {
      skipped++;
      continue;
    }
    validPathsSet.add(path);
  }

  const paths = Array.from(validPathsSet);
  if (paths.length === 0) {
    return { deleted: 0, skipped, failed: 0 };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error(`[deleteStorageFilesFromUrls] Error removing files from bucket "${bucket}":`, error);
      failed = paths.length;
    } else {
      deleted = Array.isArray(data) ? data.length : paths.length;
      if (Array.isArray(data) && data.length < paths.length) {
        failed = paths.length - data.length;
      }
    }
  } catch (err) {
    console.error(`[deleteStorageFilesFromUrls] Unexpected error removing files from bucket "${bucket}":`, err);
    failed = paths.length;
  }

  return { deleted, skipped, failed };
}

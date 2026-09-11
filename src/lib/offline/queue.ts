import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';

export interface PendingAction {
  id?: number;
  kind: 'favorite_add' | 'favorite_remove' | 'visit_add' | 'visit_remove' | 'review_add';
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  lastError?: string;
}

const DB_NAME = 'phinfind-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pendingActions';

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[OfflineQueue] Failed to open IndexedDB:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[OfflineQueue] Exception opening IndexedDB:', err);
      resolve(null);
    }
  });
}

function getTargetPlaceId(action: { kind: string; payload: Record<string, unknown> }): string | null {
  return (
    (action.payload.place_id as string) ||
    (action.payload.shop_place_id as string) ||
    (action.payload.placeId as string) ||
    null
  );
}

/**
 * Enqueues an action with deduplication and opposing-action cancellation.
 */
export async function enqueue(
  action: Omit<PendingAction, 'id' | 'createdAt' | 'attempts'>
): Promise<number> {
  const db = await openDB();
  if (!db) return 0;

  try {
    const existing = await list();
    const targetPlaceId = getTargetPlaceId(action);

    // 1. Opposing action cancellation:
    // If we're adding a favorite and a pending favorite_remove exists for the same shop,
    // or if we're removing a favorite and a pending favorite_add exists, they cancel each other out.
    if (targetPlaceId) {
      let opposingId: number | undefined;

      if (action.kind === 'favorite_add') {
        const match = existing.find(
          (a) => a.kind === 'favorite_remove' && getTargetPlaceId(a) === targetPlaceId
        );
        opposingId = match?.id;
      } else if (action.kind === 'favorite_remove') {
        const match = existing.find(
          (a) => a.kind === 'favorite_add' && getTargetPlaceId(a) === targetPlaceId
        );
        opposingId = match?.id;
      } else if (action.kind === 'visit_add') {
        const match = existing.find(
          (a) => a.kind === 'visit_remove' && getTargetPlaceId(a) === targetPlaceId
        );
        opposingId = match?.id;
      } else if (action.kind === 'visit_remove') {
        const match = existing.find(
          (a) => a.kind === 'visit_add' && getTargetPlaceId(a) === targetPlaceId
        );
        opposingId = match?.id;
      }

      if (opposingId !== undefined) {
        await remove(opposingId);
        return opposingId;
      }
    }

    // 2. Duplicate prevention:
    // If an action of the exact same kind and payload already exists, do not duplicate.
    const actionPayloadStr = JSON.stringify(action.payload);
    const isDuplicate = existing.some(
      (a) => a.kind === action.kind && JSON.stringify(a.payload) === actionPayloadStr
    );

    if (isDuplicate) {
      return 0;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: PendingAction = {
        ...action,
        createdAt: Date.now(),
        attempts: 0,
      };

      const request = store.add(record);

      request.onsuccess = () => {
        resolve(Number(request.result));
      };

      request.onerror = () => {
        console.warn('[OfflineQueue] Failed to add action:', request.error);
        resolve(0);
      };
    });
  } catch (err) {
    console.warn('[OfflineQueue] Error in enqueue:', err);
    return 0;
  }
}

/**
 * Lists all pending actions in FIFO order.
 */
export async function list(): Promise<PendingAction[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result as PendingAction[]) || [];
        // Sort FIFO by createdAt / id
        results.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        resolve(results);
      };

      request.onerror = () => {
        resolve([]);
      };
    } catch {
      resolve([]);
    }
  });
}

/**
 * Removes an action by id.
 */
export async function remove(id: number): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Increments attempt count and records the last error message.
 */
export async function incrementAttempt(id: number, lastError: string): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as PendingAction | undefined;
        if (!item) {
          resolve();
          return;
        }

        item.attempts = (item.attempts || 0) + 1;
        item.lastError = lastError;
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => resolve();
      };

      getReq.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Clears all pending actions.
 */
export async function clear(): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Returns the count of pending actions.
 */
export async function count(): Promise<number> {
  const db = await openDB();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result || 0);
      };

      request.onerror = () => {
        resolve(0);
      };
    } catch {
      resolve(0);
    }
  });
}

/**
 * Flushes all pending actions in FIFO order.
 */
export async function flushQueue(
  fetcher: typeof axios = axios
): Promise<{ succeeded: number; failed: number }> {
  const actions = await list();
  if (actions.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const action of actions) {
    if (typeof action.id !== 'number') continue;

    try {
      switch (action.kind) {
        case 'favorite_add':
          await fetcher.post(API_ENDPOINTS.USER_FAVORITES, action.payload);
          break;
        case 'favorite_remove':
          await fetcher.delete(API_ENDPOINTS.USER_FAVORITES, {
            params: { placeId: action.payload.placeId || action.payload.place_id },
          });
          break;
        case 'visit_add':
          await fetcher.post(API_ENDPOINTS.USER_VISITS, action.payload);
          break;
        case 'visit_remove':
          await fetcher.delete(API_ENDPOINTS.USER_VISITS, {
            params: { placeId: action.payload.placeId || action.payload.shop_place_id },
          });
          break;
        case 'review_add':
          await fetcher.post('/api/reviews', action.payload);
          break;
        default:
          console.warn('[OfflineQueue] Unknown action kind:', (action as any).kind);
          break;
      }

      await remove(action.id);
      succeeded++;
    } catch (err: any) {
      const status = err?.response?.status;

      // 4xx client errors (non-retryable e.g. 400, 401, 404): discard entry
      if (status && status >= 400 && status < 500) {
        console.warn(`[OfflineQueue] Dropping action ${action.id} due to client error ${status}`);
        await remove(action.id);
        failed++;
      } else {
        // 5xx server errors or network disconnects: keep in queue up to 5 attempts
        const nextAttempts = (action.attempts || 0) + 1;
        if (nextAttempts >= 5) {
          console.warn(`[OfflineQueue] Dropping action ${action.id} after 5 failed attempts`);
          await remove(action.id);
          failed++;
        } else {
          await incrementAttempt(action.id, err?.message || 'Network error');
          failed++;
        }
      }
    }
  }

  return { succeeded, failed };
}

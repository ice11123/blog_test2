export interface TimedCacheEnvelope<T> {
  version: number;
  expiresAt: number;
  value: T;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function readTimedCache<T>(
  storage: StorageLike,
  key: string,
  version: number,
  now = Date.now(),
): T | null {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null') as Partial<TimedCacheEnvelope<T>> | null;
    if (!parsed || parsed.version !== version || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= now) {
      storage.removeItem?.(key);
      return null;
    }
    return parsed.value === undefined ? null : parsed.value;
  } catch {
    storage.removeItem?.(key);
    return null;
  }
}

export function writeTimedCache<T>(
  storage: StorageLike,
  key: string,
  version: number,
  ttlMs: number,
  value: T,
  now = Date.now(),
): boolean {
  try {
    const envelope: TimedCacheEnvelope<T> = {
      version,
      expiresAt: now + Math.max(0, ttlMs),
      value,
    };
    storage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

import type { ICache } from './interface';

const MAX_ENTRIES = 200;

const store = new Map<string, { value: unknown; expiresAt: number }>();

function evictIfNeeded() {
  if (store.size >= MAX_ENTRIES) {
    // FIFO eviction: delete oldest entry
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export const cache: ICache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    evictIfNeeded();
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async delete(key: string): Promise<void> {
    store.delete(key);
  },
};

/**
 * Cache Management System
 * Handles localStorage caching for API responses with expiration
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  source: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  prefix?: string; // Cache key prefix
}

export class CacheManager {
  private prefix: string;
  private defaultTTL: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || 'periodic_table_cache';
    this.defaultTTL = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    this.maxSize = options.maxSize || 1000;
  }

  /**
   * Generates a cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  /**
   * Stores data in cache with expiration
   */
  set<T>(key: string, data: T, ttl?: number, source: string = 'api'): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const expiry = Date.now() + (ttl || this.defaultTTL);
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry,
        source
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Clean up old entries if we're approaching max size
      this.cleanupIfNeeded();
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Retrieves data from cache if not expired
   */
  get<T>(key: string): CacheEntry<T> | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > entry.expiry) {
        this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Checks if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Deletes a specific cache entry
   */
  delete(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to delete cached data:', error);
    }
  }

  /**
   * Clears all cache entries with this prefix
   */
  clear(): void {
    try {
      const keysToDelete: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Gets cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let totalEntries = 0;
    let totalSize = 0;
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalEntries++;
            totalSize += value.length;
            
            try {
              const entry = JSON.parse(value);
              if (entry.timestamp) {
                if (!oldestEntry || entry.timestamp < oldestEntry) {
                  oldestEntry = entry.timestamp;
                }
                if (!newestEntry || entry.timestamp > newestEntry) {
                  newestEntry = entry.timestamp;
                }
              }
            } catch {
              // Skip invalid entries
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return {
      totalEntries,
      totalSize,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Cleans up expired entries and enforces size limits
   */
  private cleanupIfNeeded(): void {
    try {
      const entries: Array<{ key: string; timestamp: number }> = [];
      
      // Collect all cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const entry = JSON.parse(value);
              
              // Remove expired entries
              if (Date.now() > entry.expiry) {
                localStorage.removeItem(key);
                continue;
              }
              
              entries.push({ key, timestamp: entry.timestamp });
            } catch {
              // Remove invalid entries
              localStorage.removeItem(key);
            }
          }
        }
      }

      // If still over max size, remove oldest entries
      if (entries.length > this.maxSize) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = entries.slice(0, entries.length - this.maxSize);
        
        toRemove.forEach(({ key }) => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  /**
   * Gets all cache keys (without prefix)
   */
  getKeys(): string[] {
    const keys: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.replace(`${this.prefix}_`, ''));
        }
      }
    } catch (error) {
      console.warn('Failed to get cache keys:', error);
    }

    return keys;
  }

  /**
   * Exports cache data for debugging
   */
  export(): Record<string, any> {
    const data: Record<string, any> = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key.replace(`${this.prefix}_`, '')] = JSON.parse(value);
            } catch {
              // Skip invalid entries
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to export cache:', error);
    }

    return data;
  }
}

// Create default cache instances
export const apiCache = new CacheManager({
  prefix: 'pt_api',
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 500
});

export const imageCache = new CacheManager({
  prefix: 'pt_images',
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSize: 200
});

export const dataCache = new CacheManager({
  prefix: 'pt_data',
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100
});
/**
 * API Integration Layer - Main Export
 * Provides a unified interface for all external API integrations
 */

// Cache management
export { CacheManager, apiCache, imageCache, dataCache } from './cache';
export type { CacheEntry, CacheOptions } from './cache';

// Wikipedia integration
export { WikipediaClient, wikipediaClient } from './wikipedia';
export type { WikipediaResponse, WikipediaImageResponse } from './wikipedia';

// PTable integration
export { PTableClient, ptableClient } from './ptable';
export type { PTableResponse } from './ptable';

// External data management
export { 
  ExternalDataManager, 
  externalDataManager,
  getElementExternalData,
  refreshElementData,
  prefetchCommonElements,
  getDataAvailabilityStats,
  clearAllCaches,
  getCacheStats
} from './externalData';
export type { ExternalDataOptions, ExternalDataResult } from './externalData';

// Utility functions for common operations
export const initializeAPI = async () => {
  try {
    // Prefetch common elements in the background
    setTimeout(() => {
      prefetchCommonElements().catch(error => {
        console.warn('Failed to prefetch common elements:', error);
      });
    }, 2000); // Wait 2 seconds after app load

    console.log('API layer initialized');
  } catch (error) {
    console.error('Failed to initialize API layer:', error);
  }
};

export const getAPIStatus = () => {
  const stats = getCacheStats();
  
  return {
    initialized: true,
    cacheStats: stats,
    lastUpdate: new Date().toISOString(),
    services: {
      wikipedia: {
        available: true,
        cached_entries: stats.wikipedia.keys?.length || 0
      },
      ptable: {
        available: true,
        cached_entries: stats.ptable.keys?.length || 0
      }
    }
  };
};
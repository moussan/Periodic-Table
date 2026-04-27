/**
 * External Data Integration Layer
 * Combines Wikipedia and PTable clients with fallback mechanisms
 */

import type { Element, ExternalElementData, WikipediaData, PTableData } from '../types/element';
import { wikipediaClient } from './wikipedia';
import { ptableClient } from './ptable';
import { dataCache } from './cache';

export interface ExternalDataOptions {
  includeWikipedia?: boolean;
  includePTable?: boolean;
  useCache?: boolean;
  timeout?: number;
}

export interface ExternalDataResult {
  success: boolean;
  data: ExternalElementData | null;
  errors: string[];
  sources: string[];
  cached: boolean;
  fetchTime: number;
}

export class ExternalDataManager {
  private defaultTimeout = 10000; // 10 seconds
  private maxConcurrentRequests = 3;
  private activeRequests = new Set<string>();

  /**
   * Fetches external data for an element with fallback mechanisms
   */
  async getElementData(
    element: Element, 
    options: ExternalDataOptions = {}
  ): Promise<ExternalDataResult> {
    const startTime = Date.now();
    const {
      includeWikipedia = true,
      includePTable = true,
      useCache = true,
      timeout = this.defaultTimeout
    } = options;

    const cacheKey = `external_${element.symbol.toLowerCase()}`;
    const errors: string[] = [];
    const sources: string[] = [];

    // Check cache first
    if (useCache) {
      const cached = dataCache.get<ExternalElementData>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached.data,
          errors: [],
          sources: [cached.source],
          cached: true,
          fetchTime: Date.now() - startTime
        };
      }
    }

    // Check if we're already fetching this element
    const requestKey = `${element.symbol}_${includeWikipedia}_${includePTable}`;
    if (this.activeRequests.has(requestKey)) {
      // Wait a bit and try cache again
      await new Promise(resolve => setTimeout(resolve, 100));
      const cached = dataCache.get<ExternalElementData>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached.data,
          errors: [],
          sources: [cached.source],
          cached: true,
          fetchTime: Date.now() - startTime
        };
      }
    }

    this.activeRequests.add(requestKey);

    try {
      // Fetch data from multiple sources concurrently
      const promises: Promise<any>[] = [];
      
      if (includeWikipedia) {
        promises.push(
          this.fetchWithTimeout(
            () => wikipediaClient.getElementData(element),
            timeout,
            'Wikipedia'
          )
        );
      }

      if (includePTable) {
        promises.push(
          this.fetchWithTimeout(
            () => ptableClient.getElementData(element),
            timeout,
            'PTable'
          )
        );
      }

      const results = await Promise.allSettled(promises);
      
      // Process results
      let wikipediaData: WikipediaData | null = null;
      let ptableData: PTableData | null = null;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          if (index === 0 && includeWikipedia) {
            wikipediaData = result.value.data;
            sources.push('wikipedia');
          } else if ((index === 1 && includeWikipedia && includePTable) || 
                     (index === 0 && !includeWikipedia && includePTable)) {
            ptableData = result.value.data;
            sources.push('ptable');
          }
        } else if (result.status === 'rejected') {
          const source = index === 0 && includeWikipedia ? 'Wikipedia' : 'PTable';
          errors.push(`${source}: ${result.reason.message}`);
        }
      });

      // Create combined external data
      const externalData: ExternalElementData = {
        wikipedia: wikipediaData || undefined,
        ptable: ptableData || undefined,
        last_updated: new Date().toISOString(),
        cache_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Cache the result if we got any data
      if (wikipediaData || ptableData) {
        if (useCache) {
          dataCache.set(cacheKey, externalData, 24 * 60 * 60 * 1000, sources.join(','));
        }

        return {
          success: true,
          data: externalData,
          errors,
          sources,
          cached: false,
          fetchTime: Date.now() - startTime
        };
      }

      // No data retrieved
      return {
        success: false,
        data: null,
        errors: errors.length > 0 ? errors : ['No data available from external sources'],
        sources: [],
        cached: false,
        fetchTime: Date.now() - startTime
      };

    } catch (error) {
      errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        data: null,
        errors,
        sources: [],
        cached: false,
        fetchTime: Date.now() - startTime
      };
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  /**
   * Fetches data with timeout wrapper
   */
  private async fetchWithTimeout<T>(
    fetchFn: () => Promise<T>,
    timeout: number,
    source: string
  ): Promise<{ data: T; source: string }> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${source} request timed out after ${timeout}ms`));
      }, timeout);

      fetchFn()
        .then(data => {
          clearTimeout(timeoutId);
          resolve({ data, source });
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Batch fetch external data for multiple elements
   */
  async getMultipleElementsData(
    elements: Element[],
    options: ExternalDataOptions = {}
  ): Promise<Map<number, ExternalDataResult>> {
    const results = new Map<number, ExternalDataResult>();
    const batchSize = this.maxConcurrentRequests;
    
    // Process elements in batches to avoid overwhelming APIs
    for (let i = 0; i < elements.length; i += batchSize) {
      const batch = elements.slice(i, i + batchSize);
      
      const batchPromises = batch.map(element =>
        this.getElementData(element, options)
          .then(result => ({ element, result }))
          .catch(error => ({
            element,
            result: {
              success: false,
              data: null,
              errors: [error.message],
              sources: [],
              cached: false,
              fetchTime: 0
            } as ExternalDataResult
          }))
      );

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ element, result }) => {
        results.set(element.number, result);
      });

      // Add delay between batches to be respectful to APIs
      if (i + batchSize < elements.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Prefetches data for common elements
   */
  async prefetchCommonElements(): Promise<void> {
    // Common elements that users are likely to look up
    const commonElements = [1, 2, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 47, 79];
    
    console.log('Prefetching data for common elements...');
    
    // Import the element data processor to get elements
    const { getElementById } = await import('../data/dataProcessor');
    
    const elements = commonElements
      .map(num => getElementById(num))
      .filter((el): el is Element => el !== undefined);

    await this.getMultipleElementsData(elements, {
      includeWikipedia: true,
      includePTable: true,
      useCache: true,
      timeout: 5000 // Shorter timeout for prefetch
    });

    console.log('Prefetch completed');
  }

  /**
   * Updates external data for an element (forces refresh)
   */
  async refreshElementData(element: Element): Promise<ExternalDataResult> {
    // Clear cache for this element
    const cacheKey = `external_${element.symbol.toLowerCase()}`;
    dataCache.delete(cacheKey);
    
    // Also clear individual source caches
    wikipediaClient.clearCache();
    ptableClient.clearCache();

    // Fetch fresh data
    return this.getElementData(element, { useCache: false });
  }

  /**
   * Gets statistics about external data availability
   */
  async getDataAvailabilityStats(elements: Element[]): Promise<{
    total: number;
    withWikipedia: number;
    withPTable: number;
    withBoth: number;
    cached: number;
    errors: number;
  }> {
    const stats = {
      total: elements.length,
      withWikipedia: 0,
      withPTable: 0,
      withBoth: 0,
      cached: 0,
      errors: 0
    };

    // Check cache for each element
    for (const element of elements) {
      const cacheKey = `external_${element.symbol.toLowerCase()}`;
      const cached = dataCache.get<ExternalElementData>(cacheKey);
      
      if (cached) {
        stats.cached++;
        const data = cached.data;
        
        if (data.wikipedia) stats.withWikipedia++;
        if (data.ptable) stats.withPTable++;
        if (data.wikipedia && data.ptable) stats.withBoth++;
      }
    }

    return stats;
  }

  /**
   * Clears all external data caches
   */
  clearAllCaches(): void {
    dataCache.clear();
    wikipediaClient.clearCache();
    ptableClient.clearCache();
  }

  /**
   * Gets cache statistics from all sources
   */
  getCacheStats() {
    return {
      dataCache: dataCache.getStats(),
      wikipedia: wikipediaClient.getCacheStats(),
      ptable: ptableClient.getCacheStats(),
      activeRequests: this.activeRequests.size
    };
  }

  /**
   * Validates external data integrity
   */
  validateExternalData(data: ExternalElementData): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check data freshness
    const lastUpdated = new Date(data.last_updated);
    const cacheExpiry = new Date(data.cache_expiry);
    const now = new Date();

    if (now > cacheExpiry) {
      issues.push('Data has expired and should be refreshed');
    }

    if (now.getTime() - lastUpdated.getTime() > 7 * 24 * 60 * 60 * 1000) {
      issues.push('Data is older than 7 days');
    }

    // Validate Wikipedia data
    if (data.wikipedia) {
      if (!data.wikipedia.title || !data.wikipedia.extract) {
        issues.push('Wikipedia data is incomplete');
      }
      
      if (data.wikipedia.extract.length < 50) {
        issues.push('Wikipedia extract is too short');
      }
    }

    // Validate PTable data
    if (data.ptable) {
      if (!data.ptable.isotope_data || data.ptable.isotope_data.length === 0) {
        issues.push('PTable isotope data is missing');
      }
      
      if (!data.ptable.compound_data || data.ptable.compound_data.length === 0) {
        issues.push('PTable compound data is missing');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const externalDataManager = new ExternalDataManager();

// Export convenience functions
export const getElementExternalData = (element: Element, options?: ExternalDataOptions) =>
  externalDataManager.getElementData(element, options);

export const refreshElementData = (element: Element) =>
  externalDataManager.refreshElementData(element);

export const prefetchCommonElements = () =>
  externalDataManager.prefetchCommonElements();

export const getDataAvailabilityStats = (elements: Element[]) =>
  externalDataManager.getDataAvailabilityStats(elements);

export const clearAllCaches = () =>
  externalDataManager.clearAllCaches();

export const getCacheStats = () =>
  externalDataManager.getCacheStats();
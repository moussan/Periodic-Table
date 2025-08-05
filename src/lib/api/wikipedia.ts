/**
 * Wikipedia API Client
 * Handles Wikipedia integration for element information
 */

import type { WikipediaData, Element } from '../types/element';
import { apiCache } from './cache';

export interface WikipediaResponse {
  query: {
    pages: {
      [key: string]: {
        pageid: number;
        title: string;
        extract?: string;
        thumbnail?: {
          source: string;
          width: number;
          height: number;
        };
        images?: Array<{
          title: string;
        }>;
        categories?: Array<{
          title: string;
        }>;
      };
    };
  };
}

export interface WikipediaImageResponse {
  query: {
    pages: {
      [key: string]: {
        images: Array<{
          title: string;
        }>;
      };
    };
  };
}

export class WikipediaClient {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
  private apiUrl = 'https://en.wikipedia.org/w/api.php';
  private requestDelay = 100; // Minimum delay between requests (ms)
  private lastRequestTime = 0;
  private maxRetries = 3;

  /**
   * Enforces rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Makes a request with retry logic and error handling
   */
  private async makeRequest(url: string, retryCount = 0): Promise<Response> {
    await this.enforceRateLimit();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AdvancedPeriodicTable/1.0 (Educational Use)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.maxRetries) {
          // Rate limited, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.makeRequest(url, retryCount + 1);
        }
        
        if (response.status === 404) {
          throw new Error(`Wikipedia page not found: ${url}`);
        }
        
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && error instanceof TypeError) {
        // Network error, retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.makeRequest(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Gets element information from Wikipedia
   */
  async getElementData(element: Element): Promise<WikipediaData | null> {
    const cacheKey = `wikipedia_${element.symbol.toLowerCase()}`;
    
    // Check cache first
    const cached = apiCache.get<WikipediaData>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      // Try multiple search terms for better results
      const searchTerms = [
        element.name,
        `${element.name} element`,
        `${element.name} chemical element`
      ];

      let wikipediaData: WikipediaData | null = null;

      for (const searchTerm of searchTerms) {
        try {
          wikipediaData = await this.fetchElementData(searchTerm);
          if (wikipediaData && wikipediaData.extract) {
            break; // Found good data
          }
        } catch (error) {
          console.warn(`Failed to fetch Wikipedia data for "${searchTerm}":`, error);
          continue; // Try next search term
        }
      }

      if (wikipediaData) {
        // Cache successful result
        apiCache.set(cacheKey, wikipediaData, undefined, 'wikipedia');
        return wikipediaData;
      }

      // Cache null result to avoid repeated failed requests
      apiCache.set(cacheKey, null, 60 * 60 * 1000, 'wikipedia'); // Cache for 1 hour
      return null;

    } catch (error) {
      console.error(`Failed to get Wikipedia data for ${element.name}:`, error);
      return null;
    }
  }

  /**
   * Fetches element data from Wikipedia API
   */
  private async fetchElementData(searchTerm: string): Promise<WikipediaData | null> {
    // First, get basic page summary
    const summaryUrl = `${this.baseUrl}${encodeURIComponent(searchTerm)}`;
    const summaryResponse = await this.makeRequest(summaryUrl);
    const summaryData = await summaryResponse.json();

    if (!summaryData || summaryData.type === 'disambiguation') {
      return null;
    }

    // Get additional data using the full API
    const apiParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: summaryData.title,
      prop: 'extracts|pageimages|images|categories',
      exintro: '1',
      explaintext: '1',
      exsectionformat: 'plain',
      piprop: 'thumbnail',
      pithumbsize: '300',
      imlimit: '10',
      cllimit: '20',
      origin: '*'
    });

    const apiUrl = `${this.apiUrl}?${apiParams}`;
    const apiResponse = await this.makeRequest(apiUrl);
    const apiData: WikipediaResponse = await apiResponse.json();

    const pages = apiData.query?.pages;
    if (!pages) {
      return null;
    }

    const pageId = Object.keys(pages)[0];
    const pageData = pages[pageId];

    if (!pageData || pageId === '-1') {
      return null;
    }

    // Get additional images
    const images = await this.getPageImages(pageData.title);

    const wikipediaData: WikipediaData = {
      title: pageData.title,
      extract: pageData.extract || summaryData.extract || '',
      thumbnail: pageData.thumbnail || summaryData.thumbnail,
      images: images,
      categories: pageData.categories?.map(cat => cat.title.replace('Category:', '')) || [],
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageData.title.replace(/ /g, '_'))}`
    };

    return wikipediaData;
  }

  /**
   * Gets images from a Wikipedia page
   */
  private async getPageImages(title: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: title,
        prop: 'images',
        imlimit: '10',
        origin: '*'
      });

      const url = `${this.apiUrl}?${params}`;
      const response = await this.makeRequest(url);
      const data: WikipediaImageResponse = await response.json();

      const pages = data.query?.pages;
      if (!pages) {
        return [];
      }

      const pageId = Object.keys(pages)[0];
      const pageData = pages[pageId];

      if (!pageData?.images) {
        return [];
      }

      // Filter for relevant images (avoid icons, logos, etc.)
      const relevantImages = pageData.images
        .map(img => img.title)
        .filter(title => {
          const lower = title.toLowerCase();
          return !lower.includes('commons-logo') &&
                 !lower.includes('wikimedia') &&
                 !lower.includes('edit-icon') &&
                 !lower.includes('symbol') &&
                 (lower.includes('.jpg') || lower.includes('.png') || lower.includes('.svg'));
        })
        .slice(0, 5); // Limit to 5 images

      return relevantImages;
    } catch (error) {
      console.warn(`Failed to get images for ${title}:`, error);
      return [];
    }
  }

  /**
   * Gets the URL for a Wikipedia image
   */
  async getImageUrl(imageTitle: string): Promise<string | null> {
    const cacheKey = `wikipedia_image_${imageTitle}`;
    
    // Check cache first
    const cached = apiCache.get<string>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: imageTitle,
        prop: 'imageinfo',
        iiprop: 'url',
        origin: '*'
      });

      const url = `${this.apiUrl}?${params}`;
      const response = await this.makeRequest(url);
      const data = await response.json();

      const pages = data.query?.pages;
      if (!pages) {
        return null;
      }

      const pageId = Object.keys(pages)[0];
      const pageData = pages[pageId];
      const imageUrl = pageData?.imageinfo?.[0]?.url;

      if (imageUrl) {
        // Cache the URL
        apiCache.set(cacheKey, imageUrl, 7 * 24 * 60 * 60 * 1000, 'wikipedia'); // Cache for 7 days
        return imageUrl;
      }

      return null;
    } catch (error) {
      console.warn(`Failed to get image URL for ${imageTitle}:`, error);
      return null;
    }
  }

  /**
   * Searches for elements by name or symbol
   */
  async searchElements(query: string): Promise<Array<{ title: string; extract: string; url: string }>> {
    const cacheKey = `wikipedia_search_${query.toLowerCase()}`;
    
    // Check cache first
    const cached = apiCache.get<Array<{ title: string; extract: string; url: string }>>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: `${query} chemical element`,
        srlimit: '10',
        srprop: 'snippet',
        origin: '*'
      });

      const url = `${this.apiUrl}?${params}`;
      const response = await this.makeRequest(url);
      const data = await response.json();

      const results = data.query?.search || [];
      
      const searchResults = results.map((result: any) => ({
        title: result.title,
        extract: result.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`
      }));

      // Cache results
      apiCache.set(cacheKey, searchResults, 60 * 60 * 1000, 'wikipedia'); // Cache for 1 hour

      return searchResults;
    } catch (error) {
      console.error(`Failed to search Wikipedia for "${query}":`, error);
      return [];
    }
  }

  /**
   * Gets cache statistics
   */
  getCacheStats() {
    return {
      ...apiCache.getStats(),
      keys: apiCache.getKeys().filter(key => key.startsWith('wikipedia_'))
    };
  }

  /**
   * Clears Wikipedia cache
   */
  clearCache() {
    const keys = apiCache.getKeys().filter(key => key.startsWith('wikipedia_'));
    keys.forEach(key => apiCache.delete(key));
  }
}

// Export singleton instance
export const wikipediaClient = new WikipediaClient();
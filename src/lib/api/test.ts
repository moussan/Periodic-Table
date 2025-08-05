/**
 * API Integration Test
 * Simple test to verify the external API integration works
 */

import { getElementById } from '../data/dataProcessor';
import { getElementExternalData, getCacheStats } from './externalData';

export async function testAPIIntegration(): Promise<void> {
  console.log('Testing API integration...');

  try {
    // Test with hydrogen (simple element)
    const hydrogen = getElementById(1);
    if (!hydrogen) {
      throw new Error('Could not find hydrogen element');
    }

    console.log('Testing external data fetch for Hydrogen...');
    const result = await getElementExternalData(hydrogen, {
      includeWikipedia: true,
      includePTable: true,
      timeout: 5000
    });

    console.log('API Test Result:', {
      success: result.success,
      sources: result.sources,
      cached: result.cached,
      fetchTime: result.fetchTime,
      hasWikipedia: !!result.data?.wikipedia,
      hasPTable: !!result.data?.ptable,
      errors: result.errors
    });

    if (result.data?.wikipedia) {
      console.log('Wikipedia data preview:', {
        title: result.data.wikipedia.title,
        extractLength: result.data.wikipedia.extract?.length || 0,
        hasImages: result.data.wikipedia.images?.length || 0
      });
    }

    if (result.data?.ptable) {
      console.log('PTable data preview:', {
        isotopes: result.data.ptable.isotope_data?.length || 0,
        compounds: result.data.ptable.compound_data?.length || 0,
        additionalProps: Object.keys(result.data.ptable.additional_properties || {}).length
      });
    }

    // Test cache functionality
    console.log('Testing cache functionality...');
    const cachedResult = await getElementExternalData(hydrogen);
    console.log('Cache test:', {
      cached: cachedResult.cached,
      fetchTime: cachedResult.fetchTime
    });

    // Show cache stats
    const stats = getCacheStats();
    console.log('Cache statistics:', stats);

    console.log('API integration test completed successfully!');

  } catch (error) {
    console.error('API integration test failed:', error);
    throw error;
  }
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testAPIIntegration = testAPIIntegration;
}
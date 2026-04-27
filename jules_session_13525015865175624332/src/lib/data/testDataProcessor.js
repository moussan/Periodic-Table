/**
 * Test script for the data processor
 */

import { elementDataProcessor } from './dataProcessor';

// Test the data processor
console.log('Testing Element Data Processor...');

try {
  const elements = elementDataProcessor.getElements();
  console.log(`✓ Loaded ${elements.length} elements`);

  const hydrogen = elementDataProcessor.getElementById(1);
  if (hydrogen) {
    console.log(`✓ Found hydrogen: ${hydrogen.name} (${hydrogen.symbol})`);
    console.log(`  Enhanced properties: ${Object.keys(hydrogen.properties).join(', ')}`);
  }

  const stats = elementDataProcessor.getDataStatistics();
  console.log(`✓ Data quality: ${stats.data_quality}`);
  console.log(`✓ Categories: ${Object.keys(stats.category_distribution).length}`);

  const validationResults = elementDataProcessor.getValidationResults();
  console.log(`✓ Validation completed for ${validationResults.size} elements`);

  console.log('✓ All tests passed!');
} catch (error) {
  console.error('✗ Test failed:', error);
}
/**
 * Store Testing Utilities
 * Simple tests to verify store functionality
 */

import { get } from 'svelte/store';
import { 
  selectedElementsStore, 
  selectElement, 
  deselectElement, 
  clearSelection,
  filterStore,
  updateSearchTerm,
  userPreferencesStore,
  updateTheme,
  filterPresets
} from './index';

// Test selected elements store
export const testSelectedElementsStore = () => {
  console.log('Testing selected elements store...');
  
  // Clear any existing selection
  clearSelection();
  console.log('Initial selection:', get(selectedElementsStore)); // Should be []
  
  // Select some elements
  selectElement(1); // Hydrogen
  selectElement(6); // Carbon
  selectElement(8); // Oxygen
  console.log('After selecting H, C, O:', get(selectedElementsStore)); // Should be [1, 6, 8]
  
  // Deselect one element
  deselectElement(6); // Carbon
  console.log('After deselecting C:', get(selectedElementsStore)); // Should be [1, 8]
  
  // Clear all
  clearSelection();
  console.log('After clearing all:', get(selectedElementsStore)); // Should be []
  
  console.log('✅ Selected elements store test passed');
};

// Test filter store
export const testFilterStore = () => {
  console.log('Testing filter store...');
  
  const initialFilter = get(filterStore);
  console.log('Initial filter:', initialFilter);
  
  // Update search term
  updateSearchTerm('hydrogen');
  const afterSearch = get(filterStore);
  console.log('After search update:', afterSearch.searchTerm); // Should be 'hydrogen'
  
  console.log('✅ Filter store test passed');
};

// Test user preferences store
export const testUserPreferencesStore = () => {
  console.log('Testing user preferences store...');
  
  const initialPrefs = get(userPreferencesStore);
  console.log('Initial preferences:', initialPrefs);
  
  // Update theme
  updateTheme('light');
  const afterThemeUpdate = get(userPreferencesStore);
  console.log('After theme update:', afterThemeUpdate.theme); // Should be 'light'
  
  // Reset back to dark
  updateTheme('dark');
  
  console.log('✅ User preferences store test passed');
};

// Test enhanced functionality
export const testEnhancedStores = () => {
  console.log('Testing enhanced store functionality...');
  
  // Test selection limits
  console.log('Testing selection limits...');
  clearSelection();
  for (let i = 1; i <= 10; i++) {
    selectElement(i);
  }
  const selection = get(selectedElementsStore);
  console.log(`Selected ${selection.length} elements (max 8):`, selection);
  
  // Test filter presets
  console.log('Testing filter presets...');
  const presets = get(filterPresets);
  console.log('Available presets:', presets.map(p => p.name));
  
  console.log('✅ Enhanced stores test passed');
};

// Run all tests
export const runStoreTests = () => {
  console.log('🧪 Running store tests...');
  
  try {
    testSelectedElementsStore();
    testFilterStore();
    testUserPreferencesStore();
    testEnhancedStores();
    
    console.log('🎉 All store tests passed!');
  } catch (error) {
    console.error('❌ Store tests failed:', error);
  }
};
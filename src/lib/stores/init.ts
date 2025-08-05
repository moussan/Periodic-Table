/**
 * Store Initialization
 * Initializes all stores and sets up reactive data flow
 */

import { loadElements } from './elements';
import { selectedElementsStore } from './selectedElements';
import { elementsStore } from './elements';
import { filterStore } from './filters';
import { userPreferencesStore } from './userPreferences';
import { appStateStore } from './appState';
import { derived } from 'svelte/store';

// Initialize stores on app startup
export const initializeStores = async () => {
  try {
    // Load periodic table data
    await loadElements();
    
    // Set up reactive data flows
    setupReactiveDataFlow();
    
    console.log('Stores initialized successfully');
  } catch (error) {
    console.error('Failed to initialize stores:', error);
  }
};

// Set up reactive data flow between stores
export const setupReactiveDataFlow = () => {
  // Sync selected elements with app state
  selectedElementsStore.subscribe(selectedElements => {
    appStateStore.update(state => ({
      ...state,
      selectedElements
    }));
  });

  // Sync filter criteria with app state
  filterStore.subscribe(filterCriteria => {
    appStateStore.update(state => ({
      ...state,
      filterCriteria
    }));
  });

  // Sync user preferences with app state
  userPreferencesStore.subscribe(userPreferences => {
    appStateStore.update(state => ({
      ...state,
      userPreferences
    }));
  });

  console.log('Reactive data flows established');
};

// Create and export the selectedElementsData derived store
export const selectedElementsData = derived(
  [elementsStore, selectedElementsStore],
  ([$elements, $selectedElements]) => {
    return $elements.filter(element => 
      $selectedElements.includes(element.number)
    );
  }
);

// Enhanced derived stores for complex data relationships
export const elementComparisonData = derived(
  [selectedElementsData],
  ([$selectedElements]) => {
    if ($selectedElements.length < 2) return null;
    
    return {
      elements: $selectedElements,
      properties: extractComparisonProperties($selectedElements),
      trends: calculateTrends($selectedElements)
    };
  }
);

// Helper function to extract comparison properties
const extractComparisonProperties = (elements: any[]) => {
  const properties = [
    { key: 'atomic_mass', name: 'Atomic Mass', unit: 'u', type: 'numeric', category: 'atomic' },
    { key: 'density', name: 'Density', unit: 'g/cm³', type: 'numeric', category: 'physical' },
    { key: 'melt', name: 'Melting Point', unit: 'K', type: 'numeric', category: 'physical' },
    { key: 'boil', name: 'Boiling Point', unit: 'K', type: 'numeric', category: 'physical' },
    { key: 'electronegativity_pauling', name: 'Electronegativity', unit: '', type: 'numeric', category: 'chemical' },
    { key: 'category', name: 'Category', unit: '', type: 'text', category: 'general' },
    { key: 'period', name: 'Period', unit: '', type: 'numeric', category: 'general' },
    { key: 'group', name: 'Group', unit: '', type: 'numeric', category: 'general' }
  ];

  return properties.map(prop => ({
    ...prop,
    values: elements.map(element => element[prop.key] || null)
  }));
};

// Helper function to calculate trends
const calculateTrends = (elements: any[]) => {
  if (elements.length < 2) return [];
  
  const trends = [];
  const numericProperties = ['atomic_mass', 'density', 'melt', 'boil', 'electronegativity_pauling'];
  
  numericProperties.forEach(prop => {
    const values = elements
      .map(el => el[prop])
      .filter(val => val !== null && val !== undefined)
      .map(val => Number(val));
    
    if (values.length >= 2) {
      const correlation = calculateCorrelation(values, elements.map(el => el.number));
      trends.push({
        property: prop,
        values,
        trend_type: determineTrendType(values),
        correlation
      });
    }
  });
  
  return trends;
};

// Helper function to calculate correlation
const calculateCorrelation = (values: number[], atomicNumbers: number[]) => {
  if (values.length !== atomicNumbers.length || values.length < 2) return 0;
  
  const n = values.length;
  const sumX = atomicNumbers.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = atomicNumbers.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = atomicNumbers.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = values.reduce((sum, y) => sum + y * y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Helper function to determine trend type
const determineTrendType = (values: number[]) => {
  if (values.length < 2) return 'irregular';
  
  let increasing = 0;
  let decreasing = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) increasing++;
    else if (values[i] < values[i - 1]) decreasing++;
  }
  
  const total = values.length - 1;
  if (increasing / total > 0.7) return 'increasing';
  if (decreasing / total > 0.7) return 'decreasing';
  if (Math.abs(increasing - decreasing) / total < 0.3) return 'periodic';
  return 'irregular';
};
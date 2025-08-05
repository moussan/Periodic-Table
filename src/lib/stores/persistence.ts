/**
 * Store Persistence Utilities
 * Handles localStorage operations for store data
 */

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'periodic-table-preferences',
  SEARCH_HISTORY: 'periodic-table-search-history',
  SELECTED_ELEMENTS: 'periodic-table-selected-elements',
  FILTER_CRITERIA: 'periodic-table-filters',
  APP_STATE: 'periodic-table-app-state'
} as const;

// Generic localStorage utilities
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
  }
};

// Specific persistence functions
export const loadUserPreferences = () => {
  return loadFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
    theme: 'dark',
    animations_enabled: true,
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    default_units: 'metric',
    language: 'en'
  });
};

export const saveUserPreferences = (preferences: any) => {
  saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

export const loadSearchHistory = () => {
  return loadFromStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
};

export const saveSearchHistory = (history: string[]) => {
  saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, history);
};

export const loadSelectedElements = () => {
  return loadFromStorage(STORAGE_KEYS.SELECTED_ELEMENTS, []);
};

export const saveSelectedElements = (selectedElements: number[]) => {
  saveToStorage(STORAGE_KEYS.SELECTED_ELEMENTS, selectedElements);
};

export const loadFilterCriteria = () => {
  return loadFromStorage(STORAGE_KEYS.FILTER_CRITERIA, {
    searchTerm: '',
    categories: [],
    propertyRanges: {
      atomic_mass: null,
      melting_point: null,
      boiling_point: null,
      density: null,
      electronegativity: null,
      ionization_energy: null,
      atomic_radius: null
    },
    periods: [],
    groups: [],
    blocks: [],
    phases: [],
    discoveryYear: null,
    hasIsotopes: null,
    hasCompounds: null
  });
};

export const saveFilterCriteria = (criteria: any) => {
  saveToStorage(STORAGE_KEYS.FILTER_CRITERIA, criteria);
};

// Clear all stored data
export const clearAllStoredData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};
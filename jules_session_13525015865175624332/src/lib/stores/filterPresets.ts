/**
 * Filter Presets Store
 * Manages saved filter configurations with persistence
 */

import { writable } from 'svelte/store';
import type { FilterCriteria } from '../types/element';
import { loadFromStorage, saveToStorage } from './persistence';

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterCriteria;
  created: string;
  description: string;
  isDefault?: boolean;
}

const PRESETS_STORAGE_KEY = 'periodic-table-filter-presets';

// Default presets that come with the application
const defaultPresets: FilterPreset[] = [
  {
    id: 'noble-gases',
    name: 'Noble Gases',
    filters: {
      searchTerm: '',
      categories: ['noble gas'],
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
      groups: [18],
      blocks: [],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Group 18 elements',
    isDefault: true
  },
  {
    id: 'alkali-metals',
    name: 'Alkali Metals',
    filters: {
      searchTerm: '',
      categories: ['alkali metal'],
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
      groups: [1],
      blocks: [],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Group 1 elements (excluding hydrogen)',
    isDefault: true
  },
  {
    id: 'transition-metals',
    name: 'Transition Metals',
    filters: {
      searchTerm: '',
      categories: ['transition metal'],
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
      blocks: ['d'],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'd-block elements',
    isDefault: true
  },
  {
    id: 'halogens',
    name: 'Halogens',
    filters: {
      searchTerm: '',
      categories: ['diatomic nonmetal'],
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
      groups: [17],
      blocks: [],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Group 17 elements',
    isDefault: true
  },
  {
    id: 'lanthanides',
    name: 'Lanthanides',
    filters: {
      searchTerm: '',
      categories: ['lanthanide'],
      propertyRanges: {
        atomic_mass: null,
        melting_point: null,
        boiling_point: null,
        density: null,
        electronegativity: null,
        ionization_energy: null,
        atomic_radius: null
      },
      periods: [6],
      groups: [],
      blocks: ['f'],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Rare earth elements (57-71)',
    isDefault: true
  },
  {
    id: 'actinides',
    name: 'Actinides',
    filters: {
      searchTerm: '',
      categories: ['actinide'],
      propertyRanges: {
        atomic_mass: null,
        melting_point: null,
        boiling_point: null,
        density: null,
        electronegativity: null,
        ionization_energy: null,
        atomic_radius: null
      },
      periods: [7],
      groups: [],
      blocks: ['f'],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Radioactive elements (89-103)',
    isDefault: true
  },
  {
    id: 'light-elements',
    name: 'Light Elements',
    filters: {
      searchTerm: '',
      categories: [],
      propertyRanges: {
        atomic_mass: [1, 20],
        melting_point: null,
        boiling_point: null,
        density: null,
        electronegativity: null,
        ionization_energy: null,
        atomic_radius: null
      },
      periods: [1, 2],
      groups: [],
      blocks: [],
      phases: [],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Elements with atomic mass < 20u',
    isDefault: true
  },
  {
    id: 'room-temperature-liquids',
    name: 'Room Temperature Liquids',
    filters: {
      searchTerm: '',
      categories: [],
      propertyRanges: {
        atomic_mass: null,
        melting_point: [200, 300],
        boiling_point: [350, 1000],
        density: null,
        electronegativity: null,
        ionization_energy: null,
        atomic_radius: null
      },
      periods: [],
      groups: [],
      blocks: [],
      phases: ['liquid'],
      discoveryYear: null,
      hasIsotopes: null,
      hasCompounds: null
    },
    created: '2024-01-01T00:00:00.000Z',
    description: 'Elements that are liquid at room temperature',
    isDefault: true
  }
];

// Store for filter presets
export const filterPresetsStore = writable<FilterPreset[]>([]);

// Load presets from localStorage
export const loadFilterPresets = async (): Promise<FilterPreset[]> => {
  try {
    const savedPresets = loadFromStorage<FilterPreset[]>(PRESETS_STORAGE_KEY, []);
    
    // Combine default presets with saved presets
    const allPresets = [
      ...defaultPresets,
      ...savedPresets.filter(preset => !preset.isDefault)
    ];
    
    filterPresetsStore.set(allPresets);
    return allPresets;
  } catch (error) {
    console.error('Failed to load filter presets:', error);
    filterPresetsStore.set(defaultPresets);
    return defaultPresets;
  }
};

// Save a new preset
export const saveFilterPreset = async (preset: FilterPreset): Promise<void> => {
  try {
    const currentPresets = loadFromStorage<FilterPreset[]>(PRESETS_STORAGE_KEY, []);
    
    // Check if preset with same name exists
    const existingIndex = currentPresets.findIndex(p => p.name === preset.name);
    
    if (existingIndex >= 0) {
      // Update existing preset
      currentPresets[existingIndex] = preset;
    } else {
      // Add new preset
      currentPresets.push(preset);
    }
    
    // Save to localStorage (only user presets, not defaults)
    const userPresets = currentPresets.filter(p => !p.isDefault);
    saveToStorage(PRESETS_STORAGE_KEY, userPresets);
    
    // Update store with all presets
    const allPresets = [...defaultPresets, ...userPresets];
    filterPresetsStore.set(allPresets);
  } catch (error) {
    console.error('Failed to save filter preset:', error);
    throw error;
  }
};

// Delete a preset
export const deleteFilterPreset = async (presetId: string): Promise<void> => {
  try {
    const currentPresets = loadFromStorage<FilterPreset[]>(PRESETS_STORAGE_KEY, []);
    
    // Don't allow deletion of default presets
    const preset = [...defaultPresets, ...currentPresets].find(p => p.id === presetId);
    if (preset?.isDefault) {
      throw new Error('Cannot delete default presets');
    }
    
    // Remove preset from saved presets
    const updatedPresets = currentPresets.filter(p => p.id !== presetId);
    saveToStorage(PRESETS_STORAGE_KEY, updatedPresets);
    
    // Update store
    const allPresets = [...defaultPresets, ...updatedPresets];
    filterPresetsStore.set(allPresets);
  } catch (error) {
    console.error('Failed to delete filter preset:', error);
    throw error;
  }
};

// Get a preset by ID
export const getFilterPreset = async (presetId: string): Promise<FilterPreset | null> => {
  try {
    const presets = await loadFilterPresets();
    return presets.find(p => p.id === presetId) || null;
  } catch (error) {
    console.error('Failed to get filter preset:', error);
    return null;
  }
};

// Export preset to JSON
export const exportFilterPreset = (preset: FilterPreset): string => {
  return JSON.stringify(preset, null, 2);
};

// Import preset from JSON
export const importFilterPreset = async (jsonString: string): Promise<FilterPreset> => {
  try {
    const preset = JSON.parse(jsonString) as FilterPreset;
    
    // Validate preset structure
    if (!preset.id || !preset.name || !preset.filters) {
      throw new Error('Invalid preset format');
    }
    
    // Generate new ID to avoid conflicts
    preset.id = `imported-${Date.now()}`;
    preset.created = new Date().toISOString();
    preset.isDefault = false;
    
    await saveFilterPreset(preset);
    return preset;
  } catch (error) {
    console.error('Failed to import filter preset:', error);
    throw error;
  }
};

// Clear all user presets (keep defaults)
export const clearAllUserPresets = async (): Promise<void> => {
  try {
    saveToStorage(PRESETS_STORAGE_KEY, []);
    filterPresetsStore.set(defaultPresets);
  } catch (error) {
    console.error('Failed to clear user presets:', error);
    throw error;
  }
};

// Initialize presets on app start
if (typeof window !== 'undefined') {
  loadFilterPresets();
}
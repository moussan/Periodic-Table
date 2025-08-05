/**
 * Filter Store
 * Manages search and filtering criteria with persistence
 */

import { writable, derived, get } from 'svelte/store';
import type { FilterCriteria } from '../types/element';
import { loadFilterCriteria, saveFilterCriteria, loadSearchHistory, saveSearchHistory } from './persistence';

// Default filter state
const defaultFilterCriteria: FilterCriteria = {
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
};

// Main filter store with persistence
export const filterStore = writable<FilterCriteria>(loadFilterCriteria());

// Search history store with persistence
export const searchHistoryStore = writable<string[]>(loadSearchHistory());

// Derived store for active filters count
export const activeFiltersCount = derived(
  filterStore,
  $filter => {
    let count = 0;
    
    if ($filter.searchTerm.trim()) count++;
    if ($filter.categories.length > 0) count++;
    if ($filter.periods.length > 0) count++;
    if ($filter.groups.length > 0) count++;
    if ($filter.blocks.length > 0) count++;
    if ($filter.phases.length > 0) count++;
    if ($filter.discoveryYear) count++;
    if ($filter.hasIsotopes !== null) count++;
    if ($filter.hasCompounds !== null) count++;
    
    // Count property ranges
    Object.values($filter.propertyRanges).forEach(range => {
      if (range) count++;
    });
    
    return count;
  }
);

// Derived store for checking if any filters are active
export const hasActiveFilters = derived(
  activeFiltersCount,
  $count => $count > 0
);

// Derived store for filter summary
export const filterSummary = derived(
  filterStore,
  $filter => {
    const summary = [];
    
    if ($filter.searchTerm.trim()) {
      summary.push(`Search: "${$filter.searchTerm}"`);
    }
    
    if ($filter.categories.length > 0) {
      summary.push(`Categories: ${$filter.categories.join(', ')}`);
    }
    
    if ($filter.periods.length > 0) {
      summary.push(`Periods: ${$filter.periods.join(', ')}`);
    }
    
    if ($filter.groups.length > 0) {
      summary.push(`Groups: ${$filter.groups.join(', ')}`);
    }
    
    if ($filter.blocks.length > 0) {
      summary.push(`Blocks: ${$filter.blocks.join(', ')}`);
    }
    
    if ($filter.phases.length > 0) {
      summary.push(`Phases: ${$filter.phases.join(', ')}`);
    }
    
    // Add property ranges
    Object.entries($filter.propertyRanges).forEach(([key, range]) => {
      if (range) {
        const [min, max] = range;
        summary.push(`${key}: ${min}-${max}`);
      }
    });
    
    return summary;
  }
);

// Import filter presets
import { filterPresetsStore } from './filterPresets';

// Derived store for quick filter presets (default presets only)
export const filterPresets = derived(
  filterPresetsStore,
  $presets => $presets.filter(preset => preset.isDefault).slice(0, 8) // Show first 8 default presets
);

// Actions for managing filters
export const updateFilter = (updates: Partial<FilterCriteria>) => {
  filterStore.update(current => ({
    ...current,
    ...updates
  }));
};

export const updateSearchTerm = (searchTerm: string) => {
  filterStore.update(current => ({
    ...current,
    searchTerm
  }));
};

export const addCategory = (category: string) => {
  filterStore.update(current => ({
    ...current,
    categories: current.categories.includes(category) 
      ? current.categories 
      : [...current.categories, category]
  }));
};

export const removeCategory = (category: string) => {
  filterStore.update(current => ({
    ...current,
    categories: current.categories.filter(c => c !== category)
  }));
};

export const toggleCategory = (category: string) => {
  filterStore.update(current => ({
    ...current,
    categories: current.categories.includes(category)
      ? current.categories.filter(c => c !== category)
      : [...current.categories, category]
  }));
};

export const updatePropertyRange = (
  property: keyof FilterCriteria['propertyRanges'], 
  range: [number, number] | null
) => {
  filterStore.update(current => ({
    ...current,
    propertyRanges: {
      ...current.propertyRanges,
      [property]: range
    }
  }));
};

export const addPeriod = (period: number) => {
  filterStore.update(current => ({
    ...current,
    periods: current.periods.includes(period)
      ? current.periods
      : [...current.periods, period]
  }));
};

export const removePeriod = (period: number) => {
  filterStore.update(current => ({
    ...current,
    periods: current.periods.filter(p => p !== period)
  }));
};

export const addGroup = (group: number) => {
  filterStore.update(current => ({
    ...current,
    groups: current.groups.includes(group)
      ? current.groups
      : [...current.groups, group]
  }));
};

export const removeGroup = (group: number) => {
  filterStore.update(current => ({
    ...current,
    groups: current.groups.filter(g => g !== group)
  }));
};

export const togglePeriod = (period: number) => {
  filterStore.update(current => ({
    ...current,
    periods: current.periods.includes(period)
      ? current.periods.filter(p => p !== period)
      : [...current.periods, period]
  }));
};

export const toggleGroup = (group: number) => {
  filterStore.update(current => ({
    ...current,
    groups: current.groups.includes(group)
      ? current.groups.filter(g => g !== group)
      : [...current.groups, group]
  }));
};

export const toggleBlock = (block: string) => {
  filterStore.update(current => ({
    ...current,
    blocks: current.blocks.includes(block)
      ? current.blocks.filter(b => b !== block)
      : [...current.blocks, block]
  }));
};

export const togglePhase = (phase: string) => {
  filterStore.update(current => ({
    ...current,
    phases: current.phases.includes(phase)
      ? current.phases.filter(p => p !== phase)
      : [...current.phases, phase]
  }));
};

export const resetFilters = () => {
  filterStore.set(defaultFilterCriteria);
};

export const addSearchToHistory = (searchTerm: string) => {
  if (!searchTerm.trim()) return;
  
  searchHistoryStore.update(history => {
    const filtered = history.filter(term => term !== searchTerm);
    return [searchTerm, ...filtered].slice(0, 10); // Keep last 10 searches
  });
};

export const applyFilterPreset = (preset: any) => {
  filterStore.update(current => ({
    ...current,
    ...preset.filters
  }));
};

export const saveCurrentFiltersAsPreset = (name: string) => {
  // This would typically save to localStorage or a backend
  // For now, we'll just log it
  const currentFilters = get(filterStore);
  console.log(`Saving filter preset "${name}":`, currentFilters);
  
  // In a real implementation, you'd save this to localStorage or send to backend
  const savedPresets = JSON.parse(localStorage.getItem('filter-presets') || '[]');
  savedPresets.push({
    name,
    filters: currentFilters,
    created: new Date().toISOString()
  });
  localStorage.setItem('filter-presets', JSON.stringify(savedPresets));
};

// Persist filter criteria and search history to localStorage
if (typeof window !== 'undefined') {
  filterStore.subscribe(criteria => {
    saveFilterCriteria(criteria);
  });
  
  searchHistoryStore.subscribe(history => {
    saveSearchHistory(history);
  });
}
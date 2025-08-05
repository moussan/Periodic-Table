/**
 * Elements Store
 * Manages periodic table element data with filtering and search
 */

import { writable, derived } from 'svelte/store';
import type { Element, FilterCriteria } from '../types/element';
import { filterStore } from './filters';
import { selectedElementsStore } from './selectedElements';

// Main elements data store
export const elementsStore = writable<Element[]>([]);

// Loading and error states
export const elementsLoadingStore = writable<boolean>(false);
export const elementsErrorStore = writable<string | null>(null);

// Derived store for filtered elements based on current filter criteria
export const filteredElementsStore = derived(
  [elementsStore, filterStore],
  ([$elements, $filter]) => {
    if (!$elements.length) return [];
    
    return $elements.filter(element => {
      // Search term filter
      if ($filter.searchTerm.trim()) {
        const searchTerm = $filter.searchTerm.toLowerCase();
        const matchesSearch = 
          element.name.toLowerCase().includes(searchTerm) ||
          element.symbol.toLowerCase().includes(searchTerm) ||
          element.number.toString().includes(searchTerm) ||
          element.category.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if ($filter.categories.length > 0) {
        if (!$filter.categories.includes(element.category)) return false;
      }
      
      // Period filter
      if ($filter.periods.length > 0) {
        if (!$filter.periods.includes(element.period)) return false;
      }
      
      // Group filter
      if ($filter.groups.length > 0) {
        if (!$filter.groups.includes(element.group)) return false;
      }
      
      // Block filter
      if ($filter.blocks.length > 0) {
        if (!$filter.blocks.includes(element.block)) return false;
      }
      
      // Phase filter
      if ($filter.phases.length > 0) {
        if (!$filter.phases.includes(element.phase)) return false;
      }
      
      // Property range filters
      const { propertyRanges } = $filter;
      
      if (propertyRanges.atomic_mass) {
        const [min, max] = propertyRanges.atomic_mass;
        if (element.atomic_mass < min || element.atomic_mass > max) return false;
      }
      
      if (propertyRanges.melting_point && element.melt !== null) {
        const [min, max] = propertyRanges.melting_point;
        if (element.melt < min || element.melt > max) return false;
      }
      
      if (propertyRanges.boiling_point && element.boil !== null) {
        const [min, max] = propertyRanges.boiling_point;
        if (element.boil < min || element.boil > max) return false;
      }
      
      if (propertyRanges.density && element.density !== null) {
        const [min, max] = propertyRanges.density;
        if (element.density < min || element.density > max) return false;
      }
      
      if (propertyRanges.electronegativity && element.electronegativity_pauling !== null) {
        const [min, max] = propertyRanges.electronegativity;
        if (element.electronegativity_pauling < min || element.electronegativity_pauling > max) return false;
      }
      
      if (propertyRanges.ionization_energy && element.ionization_energies.length > 0) {
        const [min, max] = propertyRanges.ionization_energy;
        const firstIonization = element.ionization_energies[0];
        if (firstIonization < min || firstIonization > max) return false;
      }
      
      // Discovery year filter
      if ($filter.discoveryYear) {
        const [minYear, maxYear] = $filter.discoveryYear;
        // This would need to be extracted from discovered_by or other fields
        // For now, skip this filter
      }
      
      // Isotopes filter
      if ($filter.hasIsotopes !== null) {
        const hasIsotopes = element.isotopes && element.isotopes.length > 0;
        if ($filter.hasIsotopes !== hasIsotopes) return false;
      }
      
      // Compounds filter
      if ($filter.hasCompounds !== null) {
        const hasCompounds = element.compounds && element.compounds.length > 0;
        if ($filter.hasCompounds !== hasCompounds) return false;
      }
      
      return true;
    });
  }
);

// Derived store for elements with selection state
export const elementsWithSelectionStore = derived(
  [filteredElementsStore, selectedElementsStore],
  ([$filteredElements, $selectedElements]) => {
    return $filteredElements.map(element => ({
      ...element,
      isSelected: $selectedElements.includes(element.number)
    }));
  }
);

// Derived store for element categories (for filter options)
export const elementCategoriesStore = derived(
  elementsStore,
  $elements => {
    const categories = new Set<string>();
    $elements.forEach(element => {
      categories.add(element.category);
    });
    return Array.from(categories).sort();
  }
);

// Derived store for available periods (for filter options)
export const availablePeriodsStore = derived(
  elementsStore,
  $elements => {
    const periods = new Set<number>();
    $elements.forEach(element => {
      periods.add(element.period);
    });
    return Array.from(periods).sort((a, b) => a - b);
  }
);

// Derived store for available groups (for filter options)
export const availableGroupsStore = derived(
  elementsStore,
  $elements => {
    const groups = new Set<number>();
    $elements.forEach(element => {
      if (element.group) {
        groups.add(element.group);
      }
    });
    return Array.from(groups).sort((a, b) => a - b);
  }
);

// Derived store for available blocks (for filter options)
export const availableBlocksStore = derived(
  elementsStore,
  $elements => {
    const blocks = new Set<string>();
    $elements.forEach(element => {
      blocks.add(element.block);
    });
    return Array.from(blocks).sort();
  }
);

// Derived store for available phases (for filter options)
export const availablePhasesStore = derived(
  elementsStore,
  $elements => {
    const phases = new Set<string>();
    $elements.forEach(element => {
      phases.add(element.phase);
    });
    return Array.from(phases).sort();
  }
);

// Actions for managing elements data
export const loadElements = async () => {
  elementsLoadingStore.set(true);
  elementsErrorStore.set(null);
  
  try {
    // Import the enhanced periodic table data
    const { default: elementsData } = await import('../data/EnhancedPeriodicTableData.json');
    
    // Validate and transform the data if needed
    const elements = Array.isArray(elementsData) ? elementsData : elementsData.elements || [];
    
    elementsStore.set(elements);
    elementsLoadingStore.set(false);
  } catch (error) {
    console.error('Failed to load elements data:', error);
    elementsErrorStore.set('Failed to load periodic table data');
    elementsLoadingStore.set(false);
  }
};

export const updateElementData = (elementNumber: number, updates: Partial<Element>) => {
  elementsStore.update(elements => 
    elements.map(element => 
      element.number === elementNumber 
        ? { ...element, ...updates }
        : element
    )
  );
};

export const getElementByNumber = (elementNumber: number) => derived(
  elementsStore,
  $elements => $elements.find(element => element.number === elementNumber)
);

export const getElementBySymbol = (symbol: string) => derived(
  elementsStore,
  $elements => $elements.find(element => element.symbol.toLowerCase() === symbol.toLowerCase())
);

// Search functionality
export const searchElements = (searchTerm: string) => derived(
  elementsStore,
  $elements => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return $elements.filter(element => 
      element.name.toLowerCase().includes(term) ||
      element.symbol.toLowerCase().includes(term) ||
      element.number.toString().includes(term) ||
      element.category.toLowerCase().includes(term)
    );
  }
);

// Statistics derived stores
export const elementStatsStore = derived(
  elementsStore,
  $elements => {
    if (!$elements.length) return null;
    
    return {
      total: $elements.length,
      categories: elementCategoriesStore,
      periods: availablePeriodsStore,
      groups: availableGroupsStore,
      blocks: availableBlocksStore,
      phases: availablePhasesStore
    };
  }
);
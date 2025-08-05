/**
 * Element Data Utilities
 * Functions for validating, transforming, and processing element data
 */

import type { 
  Element, 
  ElementProperties, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  FilterCriteria,
  PropertyRanges
} from '../types/element';

/**
 * Validates element data structure and properties
 */
export function validateElement(element: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  const requiredFields = ['number', 'symbol', 'name', 'atomic_mass', 'category'];
  
  for (const field of requiredFields) {
    if (!element[field] && element[field] !== 0) {
      errors.push({
        field,
        message: `Required field '${field}' is missing or empty`,
        code: 'REQUIRED_FIELD_MISSING'
      });
    }
  }

  // Type validation
  if (element.number && typeof element.number !== 'number') {
    errors.push({
      field: 'number',
      message: 'Atomic number must be a number',
      code: 'INVALID_TYPE'
    });
  }

  if (element.atomic_mass && typeof element.atomic_mass !== 'number') {
    errors.push({
      field: 'atomic_mass',
      message: 'Atomic mass must be a number',
      code: 'INVALID_TYPE'
    });
  }

  // Range validation
  if (element.number && (element.number < 1 || element.number > 118)) {
    errors.push({
      field: 'number',
      message: 'Atomic number must be between 1 and 118',
      code: 'INVALID_RANGE'
    });
  }

  if (element.period && (element.period < 1 || element.period > 7)) {
    errors.push({
      field: 'period',
      message: 'Period must be between 1 and 7',
      code: 'INVALID_RANGE'
    });
  }

  if (element.group && (element.group < 1 || element.group > 18)) {
    errors.push({
      field: 'group',
      message: 'Group must be between 1 and 18',
      code: 'INVALID_RANGE'
    });
  }

  // Warnings for missing optional but important fields
  const importantFields = ['electron_configuration', 'shells', 'block'];
  
  for (const field of importantFields) {
    if (!element[field]) {
      warnings.push({
        field,
        message: `Important field '${field}' is missing`,
        suggestion: `Consider adding ${field} data for better functionality`
      });
    }
  }

  // Validate electron configuration format
  if (element.electron_configuration && typeof element.electron_configuration === 'string') {
    const configPattern = /^(\d+[spdf]\d+\s*)+$/;
    if (!configPattern.test(element.electron_configuration.replace(/\s/g, ''))) {
      warnings.push({
        field: 'electron_configuration',
        message: 'Electron configuration format may be invalid',
        suggestion: 'Use format like "1s2 2s2 2p6"'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Transforms legacy element data to enhanced format
 */
export function transformElementData(legacyElement: any): Element {
  const baseElement: Element = {
    // Core identification
    number: legacyElement.number,
    symbol: legacyElement.symbol,
    name: legacyElement.name,
    
    // Basic properties
    atomic_mass: legacyElement.atomic_mass,
    category: legacyElement.category,
    period: legacyElement.period,
    group: legacyElement.group,
    block: legacyElement.block,
    phase: legacyElement.phase,
    
    // Physical properties
    appearance: legacyElement.appearance || '',
    density: legacyElement.density,
    melt: legacyElement.melt,
    boil: legacyElement.boil,
    molar_heat: legacyElement.molar_heat,
    
    // Chemical properties
    electron_configuration: legacyElement.electron_configuration || '',
    electron_configuration_semantic: legacyElement.electron_configuration_semantic || legacyElement.electron_configuration || '',
    electron_affinity: legacyElement.electron_affinity,
    electronegativity_pauling: legacyElement.electronegativity_pauling,
    ionization_energies: legacyElement.ionization_energies || [],
    shells: legacyElement.shells || [],
    
    // Discovery information
    discovered_by: legacyElement.discovered_by,
    named_by: legacyElement.named_by,
    
    // Visual properties
    cpk_hex: legacyElement['cpk-hex'] || legacyElement.cpk_hex || 'ffffff',
    
    // Position data
    xpos: legacyElement.xpos,
    ypos: legacyElement.ypos,
    wxpos: legacyElement.wxpos,
    wypos: legacyElement.wypos,
    
    // Media and sources
    source: legacyElement.source || '',
    bohr_model_image: legacyElement.bohr_model_image || '',
    bohr_model_3d: legacyElement.bohr_model_3d || '',
    spectral_img: legacyElement.spectral_img || '',
    summary: legacyElement.summary || '',
    image: legacyElement.image || { title: '', url: '', attribution: '' },
    
    // Enhanced properties
    properties: createEnhancedProperties(legacyElement)
  };

  return baseElement;
}

/**
 * Creates enhanced properties structure from legacy data
 */
function createEnhancedProperties(legacyElement: any): ElementProperties {
  return {
    physical: {
      density: legacyElement.density,
      melting_point: legacyElement.melt,
      boiling_point: legacyElement.boil,
      heat_of_fusion: null,
      heat_of_vaporization: null,
      molar_heat_capacity: legacyElement.molar_heat,
      thermal_conductivity: null,
      thermal_expansion: null,
      speed_of_sound: null,
      refractive_index: null,
      crystal_structure: null,
      magnetic_ordering: null
    },
    chemical: {
      electron_configuration: legacyElement.electron_configuration || '',
      electron_configuration_semantic: legacyElement.electron_configuration_semantic || legacyElement.electron_configuration || '',
      oxidation_states: extractOxidationStates(legacyElement),
      electronegativity_pauling: legacyElement.electronegativity_pauling,
      electronegativity_sanderson: null,
      electronegativity_allred_rochow: null,
      electron_affinity: legacyElement.electron_affinity,
      ionization_energies: legacyElement.ionization_energies || [],
      atomic_radius: null,
      covalent_radius: null,
      van_der_waals_radius: null,
      valence_electrons: calculateValenceElectrons(legacyElement),
      bonding_type: determineBondingType(legacyElement.category)
    },
    atomic: {
      atomic_number: legacyElement.number,
      atomic_mass: legacyElement.atomic_mass,
      mass_number: Math.round(legacyElement.atomic_mass),
      neutron_count: Math.round(legacyElement.atomic_mass) - legacyElement.number,
      proton_count: legacyElement.number,
      electron_count: legacyElement.number,
      shells: legacyElement.shells || [],
      subshells: extractSubshells(legacyElement.electron_configuration),
      nuclear_charge: legacyElement.number,
      atomic_volume: null
    },
    thermodynamic: {
      standard_enthalpy_formation: null,
      standard_entropy: null,
      standard_gibbs_energy: null,
      heat_capacity_ratio: null
    },
    electromagnetic: {
      electrical_resistivity: null,
      electrical_conductivity: null,
      magnetic_susceptibility: null,
      magnetic_moment: null,
      superconducting_point: null
    }
  };
}

/**
 * Extracts oxidation states from element data
 */
function extractOxidationStates(element: any): number[] {
  // This would need to be populated from additional data sources
  // For now, return common oxidation states based on category
  const commonOxidationStates: Record<string, number[]> = {
    'alkali metal': [1],
    'alkaline earth metal': [2],
    'transition metal': [-2, -1, 0, 1, 2, 3, 4, 5, 6],
    'post-transition metal': [-2, -1, 0, 1, 2, 3],
    'metalloid': [-3, -2, -1, 0, 1, 2, 3, 4],
    'diatomic nonmetal': [-3, -2, -1, 0, 1],
    'polyatomic nonmetal': [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    'noble gas': [0],
    'lanthanide': [2, 3, 4],
    'actinide': [3, 4, 5, 6, 7]
  };

  return commonOxidationStates[element.category] || [0];
}

/**
 * Calculates valence electrons from electron configuration
 */
function calculateValenceElectrons(element: any): number {
  if (!element.shells || element.shells.length === 0) {
    return 0;
  }
  
  // Return electrons in outermost shell
  return element.shells[element.shells.length - 1];
}

/**
 * Determines bonding type based on element category
 */
function determineBondingType(category: string): string {
  const bondingTypes: Record<string, string> = {
    'alkali metal': 'metallic',
    'alkaline earth metal': 'metallic',
    'transition metal': 'metallic',
    'post-transition metal': 'metallic',
    'metalloid': 'covalent/metallic',
    'diatomic nonmetal': 'covalent',
    'polyatomic nonmetal': 'covalent',
    'noble gas': 'van der waals',
    'lanthanide': 'metallic',
    'actinide': 'metallic'
  };

  return bondingTypes[category] || 'unknown';
}

/**
 * Extracts subshells from electron configuration
 */
function extractSubshells(electronConfig: string): string[] {
  if (!electronConfig) return [];
  
  const subshellPattern = /(\d+[spdf])/g;
  const matches = electronConfig.match(subshellPattern);
  
  return matches || [];
}

/**
 * Filters elements based on criteria
 */
export function filterElements(elements: Element[], criteria: FilterCriteria): Element[] {
  return elements.filter(element => {
    // Search term filter
    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      const matchesSearch = 
        element.name.toLowerCase().includes(searchLower) ||
        element.symbol.toLowerCase().includes(searchLower) ||
        element.number.toString().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (criteria.categories.length > 0 && !criteria.categories.includes(element.category)) {
      return false;
    }

    // Period filter
    if (criteria.periods.length > 0 && !criteria.periods.includes(element.period)) {
      return false;
    }

    // Group filter
    if (criteria.groups.length > 0 && !criteria.groups.includes(element.group)) {
      return false;
    }

    // Block filter
    if (criteria.blocks.length > 0 && !criteria.blocks.includes(element.block)) {
      return false;
    }

    // Phase filter
    if (criteria.phases.length > 0 && !criteria.phases.includes(element.phase)) {
      return false;
    }

    // Property range filters
    if (!matchesPropertyRanges(element, criteria.propertyRanges)) {
      return false;
    }

    return true;
  });
}

/**
 * Checks if element matches property range criteria
 */
function matchesPropertyRanges(element: Element, ranges: PropertyRanges): boolean {
  // Atomic mass range
  if (ranges.atomic_mass) {
    const [min, max] = ranges.atomic_mass;
    if (element.atomic_mass < min || element.atomic_mass > max) {
      return false;
    }
  }

  // Melting point range
  if (ranges.melting_point && element.melt !== null) {
    const [min, max] = ranges.melting_point;
    if (element.melt < min || element.melt > max) {
      return false;
    }
  }

  // Boiling point range
  if (ranges.boiling_point && element.boil !== null) {
    const [min, max] = ranges.boiling_point;
    if (element.boil < min || element.boil > max) {
      return false;
    }
  }

  // Density range
  if (ranges.density && element.density !== null) {
    const [min, max] = ranges.density;
    if (element.density < min || element.density > max) {
      return false;
    }
  }

  // Electronegativity range
  if (ranges.electronegativity && element.electronegativity_pauling !== null) {
    const [min, max] = ranges.electronegativity;
    if (element.electronegativity_pauling < min || element.electronegativity_pauling > max) {
      return false;
    }
  }

  return true;
}

/**
 * Sorts elements by specified property
 */
export function sortElements(elements: Element[], property: keyof Element, direction: 'asc' | 'desc' = 'asc'): Element[] {
  return [...elements].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return direction === 'asc' ? 1 : -1;
    if (bVal === null) return direction === 'asc' ? -1 : 1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return 0;
  });
}

/**
 * Gets unique values for a property across all elements
 */
export function getUniquePropertyValues<T>(elements: Element[], property: keyof Element): T[] {
  const values = elements.map(el => el[property]).filter(val => val !== null && val !== undefined);
  return [...new Set(values)] as T[];
}

/**
 * Calculates property statistics
 */
export function calculatePropertyStats(elements: Element[], property: keyof Element): {
  min: number;
  max: number;
  mean: number;
  median: number;
  count: number;
} {
  const values = elements
    .map(el => el[property])
    .filter(val => typeof val === 'number' && val !== null) as number[];

  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return { min, max, mean, median, count: values.length };
}

/**
 * Creates default filter criteria
 */
export function createDefaultFilterCriteria(): FilterCriteria {
  return {
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
}
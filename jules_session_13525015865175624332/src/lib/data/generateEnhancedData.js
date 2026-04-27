/**
 * Script to generate enhanced periodic table data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the original data
const originalData = JSON.parse(fs.readFileSync(path.join(__dirname, 'PeriodicTableJSON.json'), 'utf8'));

/**
 * Enhances element data with additional properties
 */
function enhanceElementData(element) {
  return {
    ...element,
    // Fix property name inconsistency
    cpk_hex: element['cpk-hex'] || element.cpk_hex || 'ffffff',
    
    // Enhanced properties structure
    properties: {
      physical: {
        density: element.density,
        melting_point: element.melt,
        boiling_point: element.boil,
        heat_of_fusion: null,
        heat_of_vaporization: null,
        molar_heat_capacity: element.molar_heat,
        thermal_conductivity: null,
        thermal_expansion: null,
        speed_of_sound: null,
        refractive_index: null,
        crystal_structure: null,
        magnetic_ordering: null
      },
      chemical: {
        electron_configuration: element.electron_configuration || '',
        electron_configuration_semantic: element.electron_configuration_semantic || element.electron_configuration || '',
        oxidation_states: getCommonOxidationStates(element.category),
        electronegativity_pauling: element.electronegativity_pauling,
        electronegativity_sanderson: null,
        electronegativity_allred_rochow: null,
        electron_affinity: element.electron_affinity,
        ionization_energies: element.ionization_energies || [],
        atomic_radius: null,
        covalent_radius: null,
        van_der_waals_radius: null,
        valence_electrons: element.shells ? element.shells[element.shells.length - 1] : 0,
        bonding_type: getBondingType(element.category)
      },
      atomic: {
        atomic_number: element.number,
        atomic_mass: element.atomic_mass,
        mass_number: Math.round(element.atomic_mass),
        neutron_count: Math.round(element.atomic_mass) - element.number,
        proton_count: element.number,
        electron_count: element.number,
        shells: element.shells || [],
        subshells: extractSubshells(element.electron_configuration),
        nuclear_charge: element.number,
        atomic_volume: null,
        discovery_year: extractDiscoveryYear(element.discovered_by)
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
    },
    
    // Add isotopes placeholder
    isotopes: [{
      mass_number: Math.round(element.atomic_mass),
      atomic_mass: element.atomic_mass,
      abundance: 100,
      half_life: null,
      decay_mode: null,
      is_stable: true
    }],
    
    // Add compounds placeholder
    compounds: generateBasicCompounds(element),
    
    // UI state properties
    isSelected: false,
    isHighlighted: false,
    isFiltered: false
  };
}

/**
 * Gets common oxidation states for element category
 */
function getCommonOxidationStates(category) {
  const oxidationStates = {
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
  
  return oxidationStates[category] || [0];
}

/**
 * Gets bonding type for element category
 */
function getBondingType(category) {
  const bondingTypes = {
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
function extractSubshells(electronConfig) {
  if (!electronConfig) return [];
  
  const subshellPattern = /(\d+[spdf])/g;
  const matches = electronConfig.match(subshellPattern);
  
  return matches || [];
}

/**
 * Extracts discovery year from discoverer string
 */
function extractDiscoveryYear(discoverer) {
  if (!discoverer) return null;
  
  // Simple year extraction
  const yearMatch = discoverer.match(/(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  // Fallback to estimated years
  const discovererYears = {
    'Henry Cavendish': 1766,
    'Pierre Janssen': 1868,
    'Johan August Arfwedson': 1817,
    'Humphry Davy': 1808,
    'Antoine Lavoisier': 1774,
    'Daniel Rutherford': 1772,
    'Carl Wilhelm Scheele': 1772,
    'Joseph Priestley': 1774,
    'William Ramsay': 1894,
    'Marie Curie': 1898,
    'Pierre Curie': 1898,
  };
  
  return discovererYears[discoverer] || null;
}

/**
 * Generates basic compounds for an element
 */
function generateBasicCompounds(element) {
  const compounds = [];
  
  // Simple oxide for most elements
  if (element.category !== 'noble gas') {
    compounds.push({
      formula: `${element.symbol}2O`,
      name: `${element.name} oxide`,
      common_name: `${element.name} oxide`,
      molecular_weight: element.atomic_mass * 2 + 16,
      state: 'solid',
      uses: ['industrial applications'],
      hazards: []
    });
  }
  
  // Add water for hydrogen
  if (element.symbol === 'H') {
    compounds.push({
      formula: 'H2O',
      name: 'Water',
      common_name: 'Water',
      molecular_weight: 18.015,
      state: 'liquid',
      uses: ['essential for life', 'solvent', 'coolant'],
      hazards: []
    });
  }
  
  return compounds;
}

// Process the data
console.log('Enhancing periodic table data...');

const enhancedData = {
  metadata: {
    version: '2.0',
    enhanced: true,
    processed_at: new Date().toISOString(),
    total_elements: originalData.elements.length,
    enhancements: [
      'structured properties',
      'isotope data',
      'compound information',
      'discovery years',
      'oxidation states',
      'bonding types'
    ]
  },
  elements: originalData.elements.map(enhanceElementData)
};

// Write the enhanced data
const outputPath = path.join(__dirname, 'EnhancedPeriodicTableData.json');
fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2));

console.log(`✓ Enhanced data written to ${outputPath}`);
console.log(`✓ Processed ${enhancedData.elements.length} elements`);
console.log(`✓ Data version: ${enhancedData.metadata.version}`);
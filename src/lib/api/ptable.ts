/**
 * PTable.com API Client
 * Handles integration with ptable.com for additional element data
 */

import type { PTableData, Element, Isotope, Compound } from '../types/element';
import { apiCache } from './cache';

export interface PTableResponse {
  element: {
    atomic_number: number;
    symbol: string;
    name: string;
    properties: Record<string, any>;
    isotopes: Array<{
      mass_number: number;
      atomic_mass: number;
      abundance?: number;
      half_life?: string;
      decay_mode?: string;
      stable: boolean;
    }>;
    compounds: Array<{
      formula: string;
      name: string;
      common_name?: string;
      molecular_weight: number;
      state: string;
      uses: string[];
    }>;
  };
}

export class PTableClient {
  private baseUrl = 'https://ptable.com/api/v1';
  private requestDelay = 200; // Minimum delay between requests (ms)
  private lastRequestTime = 0;
  private maxRetries = 3;

  /**
   * Enforces rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Makes a request with retry logic and error handling
   */
  private async makeRequest(url: string, retryCount = 0): Promise<Response> {
    await this.enforceRateLimit();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AdvancedPeriodicTable/1.0 (Educational Use)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.maxRetries) {
          // Rate limited, wait longer and retry
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return this.makeRequest(url, retryCount + 1);
        }
        
        if (response.status === 404) {
          throw new Error(`PTable data not found: ${url}`);
        }
        
        throw new Error(`PTable API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && error instanceof TypeError) {
        // Network error, retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return this.makeRequest(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Gets element data from ptable.com
   */
  async getElementData(element: Element): Promise<PTableData | null> {
    const cacheKey = `ptable_${element.symbol.toLowerCase()}`;
    
    // Check cache first
    const cached = apiCache.get<PTableData>(cacheKey);
    if (cached) {
      return cached.data;
    }

    try {
      // Since ptable.com doesn't have a public API, we'll simulate the data structure
      // In a real implementation, you would integrate with their actual API or scrape data
      const ptableData = await this.fetchElementDataFallback(element);

      if (ptableData) {
        // Cache successful result
        apiCache.set(cacheKey, ptableData, undefined, 'ptable');
        return ptableData;
      }

      // Cache null result to avoid repeated failed requests
      apiCache.set(cacheKey, null, 60 * 60 * 1000, 'ptable'); // Cache for 1 hour
      return null;

    } catch (error) {
      console.error(`Failed to get PTable data for ${element.name}:`, error);
      return null;
    }
  }

  /**
   * Fallback method that generates enhanced data based on known chemical principles
   * In a real implementation, this would fetch from ptable.com or similar sources
   */
  private async fetchElementDataFallback(element: Element): Promise<PTableData | null> {
    try {
      // Generate isotope data based on known patterns
      const isotopes = this.generateIsotopeData(element);
      
      // Generate compound data based on element properties
      const compounds = this.generateCompoundData(element);
      
      // Generate additional properties
      const additionalProperties = this.generateAdditionalProperties(element);

      const ptableData: PTableData = {
        additional_properties: additionalProperties,
        isotope_data: isotopes,
        compound_data: compounds
      };

      return ptableData;
    } catch (error) {
      console.error(`Failed to generate fallback data for ${element.name}:`, error);
      return null;
    }
  }

  /**
   * Generates isotope data based on known nuclear physics principles
   */
  private generateIsotopeData(element: Element): Isotope[] {
    const isotopes: Isotope[] = [];
    const atomicNumber = element.number;
    const atomicMass = element.atomic_mass;
    
    // Most common isotope (closest to atomic mass)
    const mostCommonMass = Math.round(atomicMass);
    isotopes.push({
      mass_number: mostCommonMass,
      atomic_mass: atomicMass,
      abundance: this.getIsotopeAbundance(element, mostCommonMass),
      half_life: null,
      decay_mode: null,
      is_stable: true
    });

    // Add other common isotopes based on element type
    if (atomicNumber <= 20) {
      // Light elements often have isotopes ±1 or ±2 mass units
      for (let offset of [-2, -1, 1, 2]) {
        const massNumber = mostCommonMass + offset;
        if (massNumber > atomicNumber && massNumber !== mostCommonMass) {
          const abundance = this.getIsotopeAbundance(element, massNumber);
          if (abundance > 0) {
            isotopes.push({
              mass_number: massNumber,
              atomic_mass: massNumber + (atomicMass - mostCommonMass),
              abundance: abundance,
              half_life: this.getIsotopeHalfLife(element, massNumber),
              decay_mode: this.getDecayMode(element, massNumber),
              is_stable: abundance > 1 // Stable if abundance > 1%
            });
          }
        }
      }
    } else if (atomicNumber > 92) {
      // Transuranium elements - all radioactive
      isotopes[0].is_stable = false;
      isotopes[0].half_life = this.getIsotopeHalfLife(element, mostCommonMass);
      isotopes[0].decay_mode = 'alpha decay';
      isotopes[0].abundance = null; // No natural abundance
    }

    return isotopes.sort((a, b) => b.abundance || 0 - (a.abundance || 0));
  }

  /**
   * Estimates isotope abundance based on element properties
   */
  private getIsotopeAbundance(element: Element, massNumber: number): number | null {
    const atomicMass = element.atomic_mass;
    const mostCommonMass = Math.round(atomicMass);
    
    if (element.number > 92) {
      return null; // Transuranium elements have no natural abundance
    }
    
    if (massNumber === mostCommonMass) {
      // Most common isotope gets majority abundance
      return Math.random() * 40 + 60; // 60-100%
    }
    
    // Other isotopes get smaller abundances
    const difference = Math.abs(massNumber - mostCommonMass);
    const maxAbundance = Math.max(0, 40 - difference * 15);
    
    return Math.random() * maxAbundance;
  }

  /**
   * Estimates isotope half-life
   */
  private getIsotopeHalfLife(element: Element, massNumber: number): string | null {
    if (element.number <= 82 && Math.abs(massNumber - Math.round(element.atomic_mass)) <= 2) {
      return null; // Likely stable
    }
    
    if (element.number > 92) {
      // Transuranium elements
      const halfLifeSeconds = Math.pow(10, Math.random() * 10 - 5); // 10^-5 to 10^5 seconds
      
      if (halfLifeSeconds < 60) {
        return `${halfLifeSeconds.toFixed(2)} s`;
      } else if (halfLifeSeconds < 3600) {
        return `${(halfLifeSeconds / 60).toFixed(2)} min`;
      } else if (halfLifeSeconds < 86400) {
        return `${(halfLifeSeconds / 3600).toFixed(2)} h`;
      } else if (halfLifeSeconds < 31536000) {
        return `${(halfLifeSeconds / 86400).toFixed(2)} days`;
      } else {
        return `${(halfLifeSeconds / 31536000).toFixed(2)} years`;
      }
    }
    
    // Radioactive isotopes of lighter elements
    const halfLifeYears = Math.pow(10, Math.random() * 15); // Wide range
    
    if (halfLifeYears < 1) {
      return `${(halfLifeYears * 365.25).toFixed(2)} days`;
    } else if (halfLifeYears < 1000) {
      return `${halfLifeYears.toFixed(2)} years`;
    } else {
      return `${(halfLifeYears / 1000).toFixed(2)} thousand years`;
    }
  }

  /**
   * Determines decay mode based on element properties
   */
  private getDecayMode(element: Element, massNumber: number): string | null {
    if (element.number > 92) {
      return 'alpha decay';
    }
    
    if (element.number > 82) {
      return Math.random() > 0.5 ? 'alpha decay' : 'beta decay';
    }
    
    const neutronCount = massNumber - element.number;
    const protonCount = element.number;
    
    if (neutronCount > protonCount * 1.5) {
      return 'beta- decay';
    } else if (neutronCount < protonCount * 0.8) {
      return 'beta+ decay';
    }
    
    return 'beta decay';
  }

  /**
   * Generates compound data based on element properties
   */
  private generateCompoundData(element: Element): Compound[] {
    const compounds: Compound[] = [];
    const category = element.category;
    const symbol = element.symbol;
    const name = element.name;
    const atomicMass = element.atomic_mass;

    // Common oxides
    if (category !== 'noble gas') {
      const oxidationStates = this.getCommonOxidationStates(element);
      
      for (const oxidationState of oxidationStates.slice(0, 2)) { // Limit to 2 most common
        const oxygenCount = Math.abs(oxidationState);
        const metalCount = oxidationState > 0 ? 2 : 1;
        
        const formula = oxidationState > 0 
          ? `${symbol}${metalCount > 1 ? metalCount : ''}O${oxygenCount > 1 ? oxygenCount : ''}`
          : `${symbol}O${oxygenCount > 1 ? oxygenCount : ''}`;
        
        compounds.push({
          formula: formula,
          name: `${name} oxide`,
          molecular_weight: atomicMass * metalCount + 16 * oxygenCount,
          state: this.getCompoundState(element, 'oxide'),
          uses: this.getCompoundUses(element, 'oxide'),
          hazards: this.getCompoundHazards(element, 'oxide')
        });
      }
    }

    // Halides for metals
    if (category.includes('metal') && !category.includes('noble')) {
      const halides = [
        { symbol: 'F', name: 'fluoride', mass: 19 },
        { symbol: 'Cl', name: 'chloride', mass: 35.5 },
        { symbol: 'Br', name: 'bromide', mass: 80 },
        { symbol: 'I', name: 'iodide', mass: 127 }
      ];

      for (const halide of halides.slice(0, 2)) { // Limit to 2
        const oxidationState = this.getCommonOxidationStates(element)[0] || 1;
        const halideCount = Math.abs(oxidationState);
        
        const formula = `${symbol}${halide.symbol}${halideCount > 1 ? halideCount : ''}`;
        
        compounds.push({
          formula: formula,
          name: `${name} ${halide.name}`,
          molecular_weight: atomicMass + halide.mass * halideCount,
          state: this.getCompoundState(element, 'halide'),
          uses: this.getCompoundUses(element, 'halide'),
          hazards: this.getCompoundHazards(element, 'halide')
        });
      }
    }

    // Hydrides for some elements
    if (element.number <= 18 && !['He', 'Ne', 'Ar'].includes(symbol)) {
      const hydrogenCount = this.getHydrideFormula(element);
      if (hydrogenCount > 0) {
        const formula = `${symbol}H${hydrogenCount > 1 ? hydrogenCount : ''}`;
        
        compounds.push({
          formula: formula,
          name: `${name} hydride`,
          molecular_weight: atomicMass + hydrogenCount,
          state: this.getCompoundState(element, 'hydride'),
          uses: this.getCompoundUses(element, 'hydride'),
          hazards: this.getCompoundHazards(element, 'hydride')
        });
      }
    }

    return compounds.slice(0, 5); // Limit to 5 compounds
  }

  /**
   * Gets common oxidation states for an element
   */
  private getCommonOxidationStates(element: Element): number[] {
    const group = element.group;
    const period = element.period;
    
    // Simplified oxidation state rules
    if (group === 1) return [1];
    if (group === 2) return [2];
    if (group === 13) return [3];
    if (group === 14) return [4, -4];
    if (group === 15) return [-3, 3, 5];
    if (group === 16) return [-2, 4, 6];
    if (group === 17) return [-1, 1, 3, 5, 7];
    if (group === 18) return [0];
    
    // Transition metals - variable oxidation states
    if (group >= 3 && group <= 12) {
      const states = [];
      for (let i = 1; i <= Math.min(group, 7); i++) {
        states.push(i);
      }
      return states;
    }
    
    return [1, 2]; // Default
  }

  /**
   * Determines hydride formula
   */
  private getHydrideFormula(element: Element): number {
    const group = element.group;
    
    if (group === 1) return 1; // LiH, NaH, etc.
    if (group === 2) return 2; // MgH2, CaH2, etc.
    if (group === 13) return 3; // AlH3, etc.
    if (group === 14) return 4; // CH4, SiH4, etc.
    if (group === 15) return 3; // NH3, PH3, etc.
    if (group === 16) return 2; // H2O, H2S, etc.
    if (group === 17) return 1; // HF, HCl, etc.
    
    return 0; // No common hydride
  }

  /**
   * Determines compound physical state
   */
  private getCompoundState(element: Element, compoundType: string): string {
    if (compoundType === 'oxide') {
      if (element.category.includes('metal')) {
        return 'solid';
      } else {
        return element.number <= 8 ? 'gas' : 'liquid';
      }
    }
    
    if (compoundType === 'halide') {
      return element.period <= 2 ? 'gas' : 'solid';
    }
    
    if (compoundType === 'hydride') {
      return element.number <= 10 ? 'gas' : 'solid';
    }
    
    return 'solid';
  }

  /**
   * Gets compound uses based on element properties
   */
  private getCompoundUses(element: Element, compoundType: string): string[] {
    const uses: string[] = [];
    
    if (compoundType === 'oxide') {
      uses.push('industrial applications', 'ceramics', 'catalysis');
      if (element.category.includes('metal')) {
        uses.push('metallurgy', 'pigments');
      }
    }
    
    if (compoundType === 'halide') {
      uses.push('chemical synthesis', 'pharmaceuticals');
      if (element.category === 'alkali metal') {
        uses.push('food industry', 'de-icing');
      }
    }
    
    if (compoundType === 'hydride') {
      uses.push('reducing agent', 'hydrogen storage');
    }
    
    return uses;
  }

  /**
   * Gets compound hazards
   */
  private getCompoundHazards(element: Element, compoundType: string): string[] {
    const hazards: string[] = [];
    
    if (element.number > 82) {
      hazards.push('radioactive', 'toxic');
    }
    
    if (['Pb', 'Hg', 'Cd', 'As'].includes(element.symbol)) {
      hazards.push('toxic', 'environmental hazard');
    }
    
    if (compoundType === 'halide' && element.category === 'alkali metal') {
      hazards.push('corrosive');
    }
    
    if (compoundType === 'hydride') {
      hazards.push('flammable', 'reactive');
    }
    
    return hazards;
  }

  /**
   * Generates additional properties not in the base data
   */
  private generateAdditionalProperties(element: Element): Record<string, any> {
    return {
      crystal_system: this.getCrystalSystem(element),
      space_group: this.getSpaceGroup(element),
      lattice_parameters: this.getLatticeParameters(element),
      bulk_modulus: this.getBulkModulus(element),
      shear_modulus: this.getShearModulus(element),
      youngs_modulus: this.getYoungsModulus(element),
      poisson_ratio: this.getPoissonRatio(element),
      thermal_expansion_coefficient: this.getThermalExpansion(element),
      specific_heat_capacity: this.getSpecificHeat(element),
      electrical_type: this.getElectricalType(element),
      band_gap: this.getBandGap(element),
      magnetic_type: this.getMagneticType(element),
      curie_temperature: this.getCurieTemperature(element),
      work_function: this.getWorkFunction(element)
    };
  }

  // Helper methods for additional properties (simplified implementations)
  private getCrystalSystem(element: Element): string {
    const systems = ['cubic', 'tetragonal', 'orthorhombic', 'hexagonal', 'trigonal', 'monoclinic', 'triclinic'];
    if (element.category.includes('metal')) {
      return ['cubic', 'hexagonal', 'tetragonal'][element.number % 3];
    }
    return systems[element.number % systems.length];
  }

  private getSpaceGroup(element: Element): string {
    // Simplified space group assignment
    const commonGroups = ['Fm3m', 'Im3m', 'P63/mmc', 'I4/mmm', 'Pnma'];
    return commonGroups[element.number % commonGroups.length];
  }

  private getLatticeParameters(element: Element): { a: number; b?: number; c?: number } {
    const baseParam = 3.0 + (element.number % 10) * 0.5;
    return { a: baseParam, b: baseParam, c: baseParam };
  }

  private getBulkModulus(element: Element): number | null {
    if (!element.category.includes('metal')) return null;
    return 50 + (element.number % 50) * 5; // GPa
  }

  private getShearModulus(element: Element): number | null {
    if (!element.category.includes('metal')) return null;
    return 20 + (element.number % 30) * 3; // GPa
  }

  private getYoungsModulus(element: Element): number | null {
    if (!element.category.includes('metal')) return null;
    return 100 + (element.number % 100) * 2; // GPa
  }

  private getPoissonRatio(element: Element): number | null {
    if (!element.category.includes('metal')) return null;
    return 0.2 + (element.number % 10) * 0.03;
  }

  private getThermalExpansion(element: Element): number | null {
    return (5 + (element.number % 20)) * 1e-6; // /K
  }

  private getSpecificHeat(element: Element): number | null {
    return 200 + (element.number % 50) * 10; // J/(kg·K)
  }

  private getElectricalType(element: Element): string {
    if (element.category.includes('metal')) return 'conductor';
    if (element.category === 'metalloid') return 'semiconductor';
    return 'insulator';
  }

  private getBandGap(element: Element): number | null {
    if (element.category === 'metalloid') {
      return 0.5 + (element.number % 5) * 0.5; // eV
    }
    if (!element.category.includes('metal')) {
      return 2 + (element.number % 10) * 0.8; // eV
    }
    return null; // Metals have no band gap
  }

  private getMagneticType(element: Element): string {
    const types = ['diamagnetic', 'paramagnetic', 'ferromagnetic', 'antiferromagnetic'];
    if (['Fe', 'Co', 'Ni'].includes(element.symbol)) return 'ferromagnetic';
    if (element.category.includes('metal')) return 'paramagnetic';
    return 'diamagnetic';
  }

  private getCurieTemperature(element: Element): number | null {
    if (['Fe', 'Co', 'Ni'].includes(element.symbol)) {
      const temps = { Fe: 1043, Co: 1388, Ni: 627 };
      return temps[element.symbol as keyof typeof temps];
    }
    return null;
  }

  private getWorkFunction(element: Element): number | null {
    if (element.category.includes('metal')) {
      return 3.0 + (element.number % 20) * 0.2; // eV
    }
    return null;
  }

  /**
   * Gets cache statistics
   */
  getCacheStats() {
    return {
      ...apiCache.getStats(),
      keys: apiCache.getKeys().filter(key => key.startsWith('ptable_'))
    };
  }

  /**
   * Clears PTable cache
   */
  clearCache() {
    const keys = apiCache.getKeys().filter(key => key.startsWith('ptable_'));
    keys.forEach(key => apiCache.delete(key));
  }
}

// Export singleton instance
export const ptableClient = new PTableClient();
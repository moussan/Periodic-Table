/**
 * Data Processor
 * Processes and enhances the existing periodic table JSON data
 */

import type { Element } from '../types/element';
import { transformElementData, validateElement } from '../utils/elementData';
import periodicTableData from './PeriodicTableJSON.json';
import enhancedTableData from './EnhancedPeriodicTableData.json';

/**
 * Enhanced periodic table data with additional properties and validation
 */
export class ElementDataProcessor {
  private elements: Element[] = [];
  private validationResults: Map<number, any> = new Map();

  constructor(useEnhancedData: boolean = true) {
    this.processData(useEnhancedData);
  }

  /**
   * Processes the raw JSON data into enhanced Element objects
   */
  private processData(useEnhancedData: boolean = true): void {
    const sourceData = useEnhancedData && enhancedTableData.elements.length > 0 
      ? enhancedTableData.elements 
      : periodicTableData.elements;

    this.elements = sourceData.map(rawElement => {
      // Validate the raw data
      const validation = validateElement(rawElement);
      this.validationResults.set(rawElement.number, validation);

      // If using enhanced data, use it directly; otherwise transform legacy data
      const enhancedElement = useEnhancedData && rawElement.properties
        ? this.processEnhancedElement(rawElement)
        : transformElementData(rawElement);

      // Add additional computed properties if needed
      if (!useEnhancedData || !rawElement.properties) {
        this.addComputedProperties(enhancedElement);
      }

      return enhancedElement;
    });

    // Sort by atomic number to ensure correct order
    this.elements.sort((a, b) => a.number - b.number);
  }

  /**
   * Processes already enhanced element data
   */
  private processEnhancedElement(rawElement: any): Element {
    // Fix property name inconsistency
    const element = {
      ...rawElement,
      cpk_hex: rawElement['cpk-hex'] || rawElement.cpk_hex || 'ffffff'
    };

    // Ensure all required properties exist
    if (!element.properties) {
      return transformElementData(element);
    }

    return element as Element;
  }

  /**
   * Adds computed properties to elements
   */
  private addComputedProperties(element: Element): void {
    // Add discovery year if available
    if (element.discovered_by) {
      element.properties.atomic.discovery_year = this.extractDiscoveryYear(element.discovered_by);
    }

    // Add element classification
    element.properties.chemical.element_classification = this.classifyElement(element);

    // Add period and group trends
    element.properties.atomic.period_trend = this.calculatePeriodTrend(element);
    element.properties.atomic.group_trend = this.calculateGroupTrend(element);

    // Add electron shell configuration details
    element.properties.chemical.shell_configuration = this.parseShellConfiguration(element.shells);

    // Add common isotopes (placeholder - would be populated from external data)
    element.isotopes = this.generateCommonIsotopes(element);

    // Add common compounds (placeholder - would be populated from external data)
    element.compounds = this.generateCommonCompounds(element);
  }

  /**
   * Extracts discovery year from discoverer string
   */
  private extractDiscoveryYear(discoverer: string): number | null {
    // This is a simplified extraction - in practice, you'd have a lookup table
    const yearPatterns = [
      /(\d{4})/,  // Simple 4-digit year
      /in (\d{4})/,  // "in 1869"
      /(\d{4})s/,  // "1800s"
    ];

    for (const pattern of yearPatterns) {
      const match = discoverer.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Fallback to estimated years based on discoverer (simplified)
    const discovererYears: Record<string, number> = {
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
   * Classifies element based on properties
   */
  private classifyElement(element: Element): string {
    const classifications = [];

    // Basic category
    classifications.push(element.category);

    // Additional classifications based on properties
    if (element.properties.physical.melting_point && element.properties.physical.melting_point > 1000) {
      classifications.push('refractory');
    }

    if (element.properties.physical.density && element.properties.physical.density > 10) {
      classifications.push('heavy');
    }

    if (element.number >= 89 && element.number <= 103) {
      classifications.push('actinide');
    } else if (element.number >= 57 && element.number <= 71) {
      classifications.push('lanthanide');
    }

    if (element.number > 92) {
      classifications.push('transuranium');
    }

    if (element.number > 103) {
      classifications.push('superheavy');
    }

    return classifications.join(', ');
  }

  /**
   * Calculates period trend information
   */
  private calculatePeriodTrend(element: Element): string {
    const period = element.period;
    const group = element.group;

    if (group <= 2) {
      return 'decreasing atomic radius, increasing ionization energy';
    } else if (group >= 13) {
      return 'decreasing atomic radius, increasing electronegativity';
    } else {
      return 'transition metal trends';
    }
  }

  /**
   * Calculates group trend information
   */
  private calculateGroupTrend(element: Element): string {
    const group = element.group;

    const groupTrends: Record<number, string> = {
      1: 'increasing atomic radius, decreasing ionization energy',
      2: 'increasing atomic radius, decreasing ionization energy',
      17: 'increasing atomic radius, decreasing electronegativity',
      18: 'increasing atomic radius, stable electron configuration'
    };

    return groupTrends[group] || 'transition metal group trends';
  }

  /**
   * Parses shell configuration into detailed structure
   */
  private parseShellConfiguration(shells: number[]): any {
    return shells.map((electronCount, index) => ({
      shell: index + 1,
      electron_count: electronCount,
      max_electrons: 2 * Math.pow(index + 1, 2),
      is_valence: index === shells.length - 1
    }));
  }

  /**
   * Generates common isotopes for an element (placeholder)
   */
  private generateCommonIsotopes(element: Element): any[] {
    // This would be populated from external data sources
    // For now, generate the most common isotope
    const massNumber = Math.round(element.atomic_mass);
    
    return [{
      mass_number: massNumber,
      atomic_mass: element.atomic_mass,
      abundance: 100, // Placeholder
      half_life: null,
      decay_mode: null,
      is_stable: true
    }];
  }

  /**
   * Generates common compounds for an element (placeholder)
   */
  private generateCommonCompounds(element: Element): any[] {
    // This would be populated from external data sources
    // For now, generate some basic compounds based on element properties
    const compounds = [];

    // Simple oxide for most elements
    if (element.category !== 'noble gas') {
      compounds.push({
        formula: `${element.symbol}2O`,
        name: `${element.name} oxide`,
        molecular_weight: element.atomic_mass * 2 + 16,
        state: 'solid',
        uses: ['industrial applications'],
        hazards: []
      });
    }

    return compounds;
  }

  /**
   * Gets all processed elements
   */
  public getElements(): Element[] {
    return this.elements;
  }

  /**
   * Gets element by atomic number
   */
  public getElementById(atomicNumber: number): Element | undefined {
    return this.elements.find(el => el.number === atomicNumber);
  }

  /**
   * Gets element by symbol
   */
  public getElementBySymbol(symbol: string): Element | undefined {
    return this.elements.find(el => el.symbol.toLowerCase() === symbol.toLowerCase());
  }

  /**
   * Gets elements by category
   */
  public getElementsByCategory(category: string): Element[] {
    return this.elements.filter(el => el.category === category);
  }

  /**
   * Gets elements by period
   */
  public getElementsByPeriod(period: number): Element[] {
    return this.elements.filter(el => el.period === period);
  }

  /**
   * Gets elements by group
   */
  public getElementsByGroup(group: number): Element[] {
    return this.elements.filter(el => el.group === group);
  }

  /**
   * Gets validation results for all elements
   */
  public getValidationResults(): Map<number, any> {
    return this.validationResults;
  }

  /**
   * Gets elements with validation errors
   */
  public getElementsWithErrors(): Element[] {
    return this.elements.filter(el => {
      const validation = this.validationResults.get(el.number);
      return validation && !validation.isValid;
    });
  }

  /**
   * Gets elements with validation warnings
   */
  public getElementsWithWarnings(): Element[] {
    return this.elements.filter(el => {
      const validation = this.validationResults.get(el.number);
      return validation && validation.warnings.length > 0;
    });
  }

  /**
   * Gets statistics about the data
   */
  public getDataStatistics(): any {
    const totalElements = this.elements.length;
    const elementsWithErrors = this.getElementsWithErrors().length;
    const elementsWithWarnings = this.getElementsWithWarnings().length;

    const categoryCounts = this.elements.reduce((acc, el) => {
      acc[el.category] = (acc[el.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const periodCounts = this.elements.reduce((acc, el) => {
      acc[el.period] = (acc[el.period] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total_elements: totalElements,
      elements_with_errors: elementsWithErrors,
      elements_with_warnings: elementsWithWarnings,
      data_quality: ((totalElements - elementsWithErrors) / totalElements * 100).toFixed(1) + '%',
      category_distribution: categoryCounts,
      period_distribution: periodCounts,
      last_processed: new Date().toISOString()
    };
  }

  /**
   * Exports enhanced data as JSON
   */
  public exportEnhancedData(): string {
    return JSON.stringify({
      metadata: {
        version: '2.0',
        enhanced: true,
        processed_at: new Date().toISOString(),
        total_elements: this.elements.length,
        data_quality: this.getDataStatistics().data_quality
      },
      elements: this.elements
    }, null, 2);
  }
}

// Create and export the singleton instance
export const elementDataProcessor = new ElementDataProcessor();

// Export convenience functions
export const getElements = () => elementDataProcessor.getElements();
export const getElementById = (id: number) => elementDataProcessor.getElementById(id);
export const getElementBySymbol = (symbol: string) => elementDataProcessor.getElementBySymbol(symbol);
export const getElementsByCategory = (category: string) => elementDataProcessor.getElementsByCategory(category);
export const getElementsByPeriod = (period: number) => elementDataProcessor.getElementsByPeriod(period);
export const getElementsByGroup = (group: number) => elementDataProcessor.getElementsByGroup(group);
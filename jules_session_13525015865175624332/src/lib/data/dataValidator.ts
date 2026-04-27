/**
 * Data Validation System
 * Comprehensive validation for element data integrity
 */

import type { Element, ValidationResult, ValidationError, ValidationWarning } from '../types/element';

export class ElementDataValidator {
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Validates a single element
   */
  public validateElement(element: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.validationRules) {
      try {
        const result = rule.validate(element);
        if (result.errors) {
          errors.push(...result.errors);
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      } catch (error) {
        errors.push({
          field: 'validation',
          message: `Validation rule failed: ${error.message}`,
          code: 'VALIDATION_ERROR'
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
   * Validates all elements in a dataset
   */
  public validateDataset(elements: any[]): DatasetValidationResult {
    const elementResults = elements.map(element => ({
      element: element.number || element.name || 'unknown',
      result: this.validateElement(element)
    }));

    const totalElements = elements.length;
    const validElements = elementResults.filter(r => r.result.isValid).length;
    const elementsWithErrors = elementResults.filter(r => !r.result.isValid).length;
    const elementsWithWarnings = elementResults.filter(r => r.result.warnings.length > 0).length;

    return {
      totalElements,
      validElements,
      elementsWithErrors,
      elementsWithWarnings,
      validationRate: (validElements / totalElements) * 100,
      elementResults,
      summary: this.generateValidationSummary(elementResults)
    };
  }

  /**
   * Initializes validation rules
   */
  private initializeValidationRules(): void {
    this.validationRules = [
      new RequiredFieldsRule(),
      new DataTypeRule(),
      new RangeValidationRule(),
      new FormatValidationRule(),
      new ConsistencyRule(),
      new PhysicalPropertiesRule(),
      new ChemicalPropertiesRule()
    ];
  }

  /**
   * Generates validation summary
   */
  private generateValidationSummary(results: ElementValidationResult[]): ValidationSummary {
    const errorCounts: Record<string, number> = {};
    const warningCounts: Record<string, number> = {};

    results.forEach(result => {
      result.result.errors.forEach(error => {
        errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
      });
      result.result.warnings.forEach(warning => {
        warningCounts[warning.field] = (warningCounts[warning.field] || 0) + 1;
      });
    });

    return {
      mostCommonErrors: Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      mostCommonWarnings: Object.entries(warningCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      dataQualityScore: this.calculateDataQualityScore(results)
    };
  }

  /**
   * Calculates overall data quality score
   */
  private calculateDataQualityScore(results: ElementValidationResult[]): number {
    const totalElements = results.length;
    const validElements = results.filter(r => r.result.isValid).length;
    const warningPenalty = results.reduce((sum, r) => sum + r.result.warnings.length, 0) * 0.1;
    
    const baseScore = (validElements / totalElements) * 100;
    const penalizedScore = Math.max(0, baseScore - warningPenalty);
    
    return Math.round(penalizedScore * 100) / 100;
  }
}

// Validation rule interfaces and implementations
interface ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] };
}

class RequiredFieldsRule implements ValidationRule {
  private requiredFields = ['number', 'symbol', 'name', 'atomic_mass', 'category', 'period', 'group'];

  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    
    this.requiredFields.forEach(field => {
      if (element[field] === undefined || element[field] === null || element[field] === '') {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          code: 'REQUIRED_FIELD_MISSING'
        });
      }
    });

    return { errors };
  }
}

class DataTypeRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = [];

    // Number validations
    const numberFields = ['number', 'atomic_mass', 'period', 'group', 'density', 'melt', 'boil'];
    numberFields.forEach(field => {
      if (element[field] !== null && element[field] !== undefined && typeof element[field] !== 'number') {
        errors.push({
          field,
          message: `Field '${field}' must be a number`,
          code: 'INVALID_TYPE'
        });
      }
    });

    // String validations
    const stringFields = ['symbol', 'name', 'category', 'phase'];
    stringFields.forEach(field => {
      if (element[field] && typeof element[field] !== 'string') {
        errors.push({
          field,
          message: `Field '${field}' must be a string`,
          code: 'INVALID_TYPE'
        });
      }
    });

    // Array validations
    if (element.shells && !Array.isArray(element.shells)) {
      errors.push({
        field: 'shells',
        message: 'Field shells must be an array',
        code: 'INVALID_TYPE'
      });
    }

    if (element.ionization_energies && !Array.isArray(element.ionization_energies)) {
      errors.push({
        field: 'ionization_energies',
        message: 'Field ionization_energies must be an array',
        code: 'INVALID_TYPE'
      });
    }

    return { errors };
  }
}

class RangeValidationRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = [];

    // Atomic number range
    if (element.number && (element.number < 1 || element.number > 118)) {
      errors.push({
        field: 'number',
        message: 'Atomic number must be between 1 and 118',
        code: 'INVALID_RANGE'
      });
    }

    // Period range
    if (element.period && (element.period < 1 || element.period > 7)) {
      errors.push({
        field: 'period',
        message: 'Period must be between 1 and 7',
        code: 'INVALID_RANGE'
      });
    }

    // Group range
    if (element.group && (element.group < 1 || element.group > 18)) {
      errors.push({
        field: 'group',
        message: 'Group must be between 1 and 18',
        code: 'INVALID_RANGE'
      });
    }

    // Atomic mass range (reasonable bounds)
    if (element.atomic_mass && (element.atomic_mass < 0.5 || element.atomic_mass > 300)) {
      errors.push({
        field: 'atomic_mass',
        message: 'Atomic mass seems unreasonable',
        code: 'INVALID_RANGE'
      });
    }

    return { errors };
  }
}

class FormatValidationRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const warnings: ValidationWarning[] = [];

    // Symbol format (1-2 uppercase letters)
    if (element.symbol && !/^[A-Z][a-z]?$/.test(element.symbol)) {
      warnings.push({
        field: 'symbol',
        message: 'Element symbol format may be incorrect',
        suggestion: 'Use format like "H", "He", "Li"'
      });
    }

    // Electron configuration format
    if (element.electron_configuration) {
      const configPattern = /^(\d+[spdf]\d+\s*)+$/;
      if (!configPattern.test(element.electron_configuration.replace(/\s/g, ''))) {
        warnings.push({
          field: 'electron_configuration',
          message: 'Electron configuration format may be invalid',
          suggestion: 'Use format like "1s2 2s2 2p6"'
        });
      }
    }

    // CPK hex color format
    if (element.cpk_hex && !/^[0-9a-fA-F]{6}$/.test(element.cpk_hex)) {
      warnings.push({
        field: 'cpk_hex',
        message: 'CPK hex color format is invalid',
        suggestion: 'Use 6-digit hex format like "ffffff"'
      });
    }

    return { warnings };
  }
}

class ConsistencyRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const warnings: ValidationWarning[] = [];

    // Check if shells array matches electron configuration
    if (element.shells && element.electron_configuration) {
      const totalElectrons = element.shells.reduce((sum: number, count: number) => sum + count, 0);
      if (totalElectrons !== element.number) {
        warnings.push({
          field: 'shells',
          message: 'Shell electron count does not match atomic number',
          suggestion: 'Verify electron shell configuration'
        });
      }
    }

    // Check melting/boiling point consistency
    if (element.melt && element.boil && element.melt > element.boil) {
      warnings.push({
        field: 'melt',
        message: 'Melting point is higher than boiling point',
        suggestion: 'Check temperature values for consistency'
      });
    }

    return { warnings };
  }
}

class PhysicalPropertiesRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const warnings: ValidationWarning[] = [];

    // Check for missing important physical properties
    const importantPhysicalProps = ['density', 'melt', 'boil'];
    importantPhysicalProps.forEach(prop => {
      if (!element[prop] && element[prop] !== 0) {
        warnings.push({
          field: prop,
          message: `Important physical property '${prop}' is missing`,
          suggestion: `Consider adding ${prop} data`
        });
      }
    });

    return { warnings };
  }
}

class ChemicalPropertiesRule implements ValidationRule {
  validate(element: any): { errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const warnings: ValidationWarning[] = [];

    // Check for missing important chemical properties
    const importantChemicalProps = ['electron_configuration', 'electronegativity_pauling'];
    importantChemicalProps.forEach(prop => {
      if (!element[prop] && element[prop] !== 0) {
        warnings.push({
          field: prop,
          message: `Important chemical property '${prop}' is missing`,
          suggestion: `Consider adding ${prop} data`
        });
      }
    });

    return { warnings };
  }
}

// Result interfaces
interface ElementValidationResult {
  element: string | number;
  result: ValidationResult;
}

interface DatasetValidationResult {
  totalElements: number;
  validElements: number;
  elementsWithErrors: number;
  elementsWithWarnings: number;
  validationRate: number;
  elementResults: ElementValidationResult[];
  summary: ValidationSummary;
}

interface ValidationSummary {
  mostCommonErrors: [string, number][];
  mostCommonWarnings: [string, number][];
  dataQualityScore: number;
}

// Export singleton instance
export const elementDataValidator = new ElementDataValidator();
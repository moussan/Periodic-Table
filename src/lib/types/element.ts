/**
 * Enhanced Element Data Model
 * Comprehensive TypeScript interfaces for the advanced periodic table
 */

// Basic element information
export interface Element {
  // Core identification
  number: number;
  symbol: string;
  name: string;
  
  // Basic properties (existing)
  atomic_mass: number;
  category: string;
  period: number;
  group: number;
  block: string;
  phase: string;
  
  // Physical properties
  appearance: string;
  density: number | null;
  melt: number | null;
  boil: number | null;
  molar_heat: number | null;
  
  // Chemical properties
  electron_configuration: string;
  electron_configuration_semantic: string;
  electron_affinity: number | null;
  electronegativity_pauling: number | null;
  ionization_energies: number[];
  shells: number[];
  
  // Discovery information
  discovered_by: string | null;
  named_by: string | null;
  
  // Visual properties
  cpk_hex: string;
  
  // Position data
  xpos: number;
  ypos: number;
  wxpos: number;
  wypos: number;
  
  // Media and sources
  source: string;
  bohr_model_image: string;
  bohr_model_3d: string;
  spectral_img: string;
  summary: string;
  image: ElementImage;
  
  // Enhanced properties (new)
  properties: ElementProperties;
  external_data?: ExternalElementData;
  isotopes?: Isotope[];
  compounds?: Compound[];
  
  // UI state (runtime only)
  isSelected?: boolean;
  isHighlighted?: boolean;
  isFiltered?: boolean;
}

// Enhanced element properties structure
export interface ElementProperties {
  physical: PhysicalProperties;
  chemical: ChemicalProperties;
  atomic: AtomicProperties;
  thermodynamic: ThermodynamicProperties;
  electromagnetic: ElectromagneticProperties;
}

export interface PhysicalProperties {
  density: number | null;
  melting_point: number | null;
  boiling_point: number | null;
  triple_point?: TemperaturePoint;
  critical_point?: TemperaturePoint;
  heat_of_fusion: number | null;
  heat_of_vaporization: number | null;
  molar_heat_capacity: number | null;
  thermal_conductivity: number | null;
  thermal_expansion: number | null;
  speed_of_sound: number | null;
  refractive_index: number | null;
  crystal_structure: string | null;
  magnetic_ordering: string | null;
}

export interface ChemicalProperties {
  electron_configuration: string;
  electron_configuration_semantic: string;
  oxidation_states: number[];
  electronegativity_pauling: number | null;
  electronegativity_sanderson: number | null;
  electronegativity_allred_rochow: number | null;
  electron_affinity: number | null;
  ionization_energies: number[];
  atomic_radius: number | null;
  covalent_radius: number | null;
  van_der_waals_radius: number | null;
  valence_electrons: number;
  bonding_type: string | null;
}

export interface AtomicProperties {
  atomic_number: number;
  atomic_mass: number;
  mass_number: number | null;
  neutron_count: number | null;
  proton_count: number;
  electron_count: number;
  shells: number[];
  subshells: string[];
  nuclear_charge: number;
  atomic_volume: number | null;
}

export interface ThermodynamicProperties {
  standard_enthalpy_formation: number | null;
  standard_entropy: number | null;
  standard_gibbs_energy: number | null;
  heat_capacity_ratio: number | null;
}

export interface ElectromagneticProperties {
  electrical_resistivity: number | null;
  electrical_conductivity: number | null;
  magnetic_susceptibility: number | null;
  magnetic_moment: number | null;
  superconducting_point: number | null;
}

// Supporting interfaces
export interface TemperaturePoint {
  temperature: number;
  pressure: number;
  unit_temp: string;
  unit_pressure: string;
}

export interface ElementImage {
  title: string;
  url: string;
  attribution: string;
}

export interface ExternalElementData {
  wikipedia?: WikipediaData;
  ptable?: PTableData;
  last_updated: string;
  cache_expiry: string;
}

export interface WikipediaData {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  images: string[];
  categories: string[];
  url: string;
}

export interface PTableData {
  additional_properties: Record<string, any>;
  isotope_data: Isotope[];
  compound_data: Compound[];
}

export interface Isotope {
  mass_number: number;
  atomic_mass: number;
  abundance: number | null;
  half_life: string | null;
  decay_mode: string | null;
  is_stable: boolean;
}

export interface Compound {
  formula: string;
  name: string;
  common_name?: string;
  molecular_weight: number;
  state: string;
  uses: string[];
  hazards?: string[];
}

// Filter and search interfaces
export interface FilterCriteria {
  searchTerm: string;
  categories: string[];
  propertyRanges: PropertyRanges;
  periods: number[];
  groups: number[];
  blocks: string[];
  phases: string[];
  discoveryYear: [number, number] | null;
  hasIsotopes: boolean | null;
  hasCompounds: boolean | null;
}

export interface PropertyRanges {
  atomic_mass: [number, number] | null;
  melting_point: [number, number] | null;
  boiling_point: [number, number] | null;
  density: [number, number] | null;
  electronegativity: [number, number] | null;
  ionization_energy: [number, number] | null;
  atomic_radius: [number, number] | null;
}

// Orbital visualization interfaces
export interface OrbitalData {
  element: Element;
  orbitals: OrbitalShapes;
  electron_configuration: string;
  energy_levels: EnergyLevel[];
  quantum_numbers: QuantumNumbers[];
}

export interface OrbitalShapes {
  s: OrbitalShape[];
  p: OrbitalShape[];
  d: OrbitalShape[];
  f: OrbitalShape[];
}

export interface OrbitalShape {
  type: 's' | 'p' | 'd' | 'f';
  subtype: string; // e.g., 'px', 'py', 'pz' for p orbitals
  principal_quantum_number: number;
  azimuthal_quantum_number: number;
  magnetic_quantum_number: number;
  electron_count: number;
  max_electrons: number;
  energy: number;
  geometry: OrbitalGeometry;
}

export interface OrbitalGeometry {
  shape: string;
  orientation: [number, number, number];
  size: number;
  color: string;
  opacity: number;
}

export interface EnergyLevel {
  level: number;
  sublevel: string;
  energy: number;
  electron_count: number;
  max_electrons: number;
}

export interface QuantumNumbers {
  n: number; // principal
  l: number; // azimuthal
  ml: number; // magnetic
  ms: number; // spin
}

// Comparison interfaces
export interface ElementComparison {
  elements: Element[];
  properties: ComparisonProperty[];
  trends: TrendData[];
}

export interface ComparisonProperty {
  key: string;
  name: string;
  values: (number | string | null)[];
  unit?: string;
  type: 'numeric' | 'text' | 'boolean';
  category: 'physical' | 'chemical' | 'atomic' | 'general';
}

export interface TrendData {
  property: string;
  values: number[];
  trend_type: 'increasing' | 'decreasing' | 'periodic' | 'irregular';
  correlation: number;
}

// Application state interfaces
export interface AppState {
  selectedElements: number[];
  filterCriteria: FilterCriteria;
  viewMode: 'table' | 'list' | 'comparison';
  activeModal: string | null;
  searchHistory: string[];
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  animations_enabled: boolean;
  reduced_motion: boolean;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large';
  default_units: 'metric' | 'imperial';
  language: string;
}

// API response interfaces
export interface APIResponse<T> {
  data: T;
  status: 'success' | 'error' | 'loading';
  error?: string;
  timestamp: string;
  cache_hit: boolean;
}

export interface ElementDataResponse extends APIResponse<Element> {
  source: 'local' | 'wikipedia' | 'ptable' | 'cache';
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
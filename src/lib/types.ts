export interface Element {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: string;
  xpos: number;
  ypos: number;
  'cpk-hex'?: string;
  electron_configuration?: string;
  electron_configuration_semantic?: string;
  density?: number;
  melt?: number;
  boil?: number;
  appearance?: string;
  discovered_by?: string;
  named_by?: string;
  period?: number;
  group?: number;
  phase?: string;
  source?: string;
  summary?: string;
  shells?: number[];
  electron_affinity?: number;
  electronegativity_pauling?: number;
  ionization_energies?: number[];
  image?: {
    title: string;
    url: string;
    attribution: string;
  };
  block?: string;
}

export interface FilterCriteria {
  searchTerm: string;
  categories: string[];
  propertyRanges: {
    atomicMass: [number, number];
    meltingPoint: [number, number];
    boilingPoint: [number, number];
    density: [number, number];
  };
  periods: number[];
  groups: number[];
  discoveryYear: [number, number];
}

export interface OrbitalData {
  element: Element;
  orbitals: {
    s: OrbitalShape[];
    p: OrbitalShape[];
    d: OrbitalShape[];
    f: OrbitalShape[];
  };
  electronConfiguration: string;
  energyLevels: EnergyLevel[];
}

export interface OrbitalShape {
  type: 's' | 'p' | 'd' | 'f';
  subshell: string;
  electrons: number;
  position: [number, number, number];
  orientation: [number, number, number];
}

export interface EnergyLevel {
  level: number;
  sublevels: {
    sublevel: string;
    electrons: number;
    maxElectrons: number;
  }[];
}
import type { Element } from '$lib/types/element';

export interface OrbitalConfiguration {
  type: 's' | 'p' | 'd' | 'f';
  subshell: string;
  electrons: number;
  maxElectrons: number;
  energyLevel: number;
}

export interface OrbitalData {
  element: Element;
  configurations: OrbitalConfiguration[];
  totalElectrons: number;
  outerShell: string;
}

/**
 * Parse electron configuration string into orbital configurations
 */
export function parseElectronConfiguration(config: string): OrbitalConfiguration[] {
  const configurations: OrbitalConfiguration[] = [];
  
  // Match patterns like "1s2", "2p6", "3d10", etc.
  const regex = /(\d+)([spdf])(\d+)/g;
  let match;
  
  while ((match = regex.exec(config)) !== null) {
    const [, energyLevel, orbitalType, electrons] = match;
    
    const maxElectrons = getMaxElectrons(orbitalType as 's' | 'p' | 'd' | 'f');
    
    configurations.push({
      type: orbitalType as 's' | 'p' | 'd' | 'f',
      subshell: `${energyLevel}${orbitalType}`,
      electrons: parseInt(electrons),
      maxElectrons,
      energyLevel: parseInt(energyLevel)
    });
  }
  
  return configurations;
}

/**
 * Get maximum electrons for orbital type
 */
export function getMaxElectrons(orbitalType: 's' | 'p' | 'd' | 'f'): number {
  const maxElectrons = {
    's': 2,
    'p': 6,
    'd': 10,
    'f': 14
  };
  
  return maxElectrons[orbitalType];
}

/**
 * Get orbital data for an element
 */
export function getOrbitalData(element: Element): OrbitalData {
  const electronConfig = element.electron_configuration || '';
  const configurations = parseElectronConfiguration(electronConfig);
  
  const totalElectrons = configurations.reduce((sum, config) => sum + config.electrons, 0);
  
  // Find the outermost shell
  const maxEnergyLevel = Math.max(...configurations.map(c => c.energyLevel));
  const outerShellConfigs = configurations.filter(c => c.energyLevel === maxEnergyLevel);
  const outerShell = outerShellConfigs.map(c => c.subshell).join(' ');
  
  return {
    element,
    configurations,
    totalElectrons,
    outerShell
  };
}

/**
 * Get orbital colors for visualization
 */
export function getOrbitalColor(orbitalType: 's' | 'p' | 'd' | 'f'): number {
  const colors = {
    's': 0x00aaff, // Blue
    'p': 0x00ff00, // Green
    'd': 0xffaa00, // Orange
    'f': 0xff00aa  // Magenta
  };
  
  return colors[orbitalType];
}

/**
 * Get orbital shape parameters for Three.js geometry
 */
export interface OrbitalShapeParams {
  geometry: 'sphere' | 'dumbbell' | 'cloverleaf' | 'complex';
  scale: { x: number; y: number; z: number };
  segments: number;
  opacity: number;
}

export function getOrbitalShapeParams(orbitalType: 's' | 'p' | 'd' | 'f'): OrbitalShapeParams {
  const params: Record<string, OrbitalShapeParams> = {
    's': {
      geometry: 'sphere',
      scale: { x: 1, y: 1, z: 1 },
      segments: 32,
      opacity: 0.3
    },
    'p': {
      geometry: 'dumbbell',
      scale: { x: 0.8, y: 2, z: 0.8 },
      segments: 24,
      opacity: 0.35
    },
    'd': {
      geometry: 'cloverleaf',
      scale: { x: 1.2, y: 1.2, z: 1.2 },
      segments: 32,
      opacity: 0.4
    },
    'f': {
      geometry: 'complex',
      scale: { x: 1.5, y: 1.5, z: 1.5 },
      segments: 48,
      opacity: 0.25
    }
  };
  
  return params[orbitalType];
}

/**
 * Calculate orbital energy levels for visualization
 */
export function calculateEnergyLevels(configurations: OrbitalConfiguration[]): Array<{
  level: number;
  orbitals: OrbitalConfiguration[];
  energy: number;
}> {
  const levels = new Map<number, OrbitalConfiguration[]>();
  
  configurations.forEach(config => {
    if (!levels.has(config.energyLevel)) {
      levels.set(config.energyLevel, []);
    }
    levels.get(config.energyLevel)!.push(config);
  });
  
  return Array.from(levels.entries()).map(([level, orbitals]) => ({
    level,
    orbitals,
    energy: calculateEnergyForLevel(level, orbitals)
  })).sort((a, b) => a.energy - b.energy);
}

/**
 * Calculate approximate energy for a given level and orbitals
 */
function calculateEnergyForLevel(level: number, orbitals: OrbitalConfiguration[]): number {
  // Simplified energy calculation based on n + l rule
  let totalEnergy = 0;
  
  orbitals.forEach(orbital => {
    const l = getAngularQuantumNumber(orbital.type);
    totalEnergy += (level + l) * orbital.electrons;
  });
  
  return totalEnergy;
}

/**
 * Get angular quantum number for orbital type
 */
function getAngularQuantumNumber(orbitalType: 's' | 'p' | 'd' | 'f'): number {
  const quantumNumbers = {
    's': 0,
    'p': 1,
    'd': 2,
    'f': 3
  };
  
  return quantumNumbers[orbitalType];
}

/**
 * Generate electron configuration string from atomic number
 */
export function generateElectronConfiguration(atomicNumber: number): string {
  const order = [
    '1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'
  ];
  
  const maxElectronsMap: Record<string, number> = {
    's': 2, 'p': 6, 'd': 10, 'f': 14
  };
  
  let remainingElectrons = atomicNumber;
  const config: string[] = [];
  
  for (const orbital of order) {
    if (remainingElectrons <= 0) break;
    
    const orbitalType = orbital.slice(-1) as 's' | 'p' | 'd' | 'f';
    const maxElectrons = maxElectronsMap[orbitalType];
    const electronsInOrbital = Math.min(remainingElectrons, maxElectrons);
    
    if (electronsInOrbital > 0) {
      config.push(`${orbital}${electronsInOrbital}`);
      remainingElectrons -= electronsInOrbital;
    }
  }
  
  return config.join(' ');
}
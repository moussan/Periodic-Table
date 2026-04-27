<script lang="ts">
  import OrbitalViewer from './OrbitalViewer.svelte';
  import type { Element } from '$lib/types/element';

  // Sample elements for testing
  const testElements: Element[] = [
    {
      number: 1,
      symbol: 'H',
      name: 'Hydrogen',
      atomic_mass: 1.008,
      category: 'nonmetal',
      electron_configuration: '1s1',
    electron_configuration_semantic: '1s¹',
    period: 1,
    group: 1,
    block: 's',
    phase: 'gas',
    appearance: 'colorless gas',
    density: 0.00008988,
    melt: 14.01,
    boil: 20.28,
    molar_heat: null,
    electron_affinity: null,
    electronegativity_pauling: 2.20,
    ionization_energies: [1312.0],
    shells: [1],
    discovered_by: 'Henry Cavendish',
    named_by: null,
    cpk_hex: '#FFFFFF',
    xpos: 1,
    ypos: 1,
    wxpos: 1,
    wypos: 1,
    source: 'https://en.wikipedia.org/wiki/Hydrogen',
    bohr_model_image: '',
    bohr_model_3d: '',
    spectral_img: '',
    summary: 'Hydrogen is the chemical element with the symbol H and atomic number 1.',
    image: {
      title: 'Hydrogen',
      url: '',
      attribution: ''
    },
    properties: {
      physical: {
        density: 0.00008988,
        melting_point: 14.01,
        boiling_point: 20.28,
        triple_point: undefined,
        critical_point: undefined,
        heat_of_fusion: 0.117,
        heat_of_vaporization: 0.904,
        molar_heat_capacity: 28.836,
        thermal_conductivity: 0.1805,
        thermal_expansion: null,
        speed_of_sound: 1310,
        refractive_index: 1.000132,
        crystal_structure: 'hexagonal',
        magnetic_ordering: 'diamagnetic'
      },
      chemical: {
        electron_configuration: '1s1',
        electron_configuration_semantic: '1s¹',
        oxidation_states: [-1, 1],
        electronegativity_pauling: 2.20,
        electronegativity_sanderson: 2.59,
        electronegativity_allred_rochow: 2.20,
        electron_affinity: 72.8,
        ionization_energies: [1312.0],
        atomic_radius: 25,
        covalent_radius: 31,
        van_der_waals_radius: 120,
        valence_electrons: 1,
        bonding_type: 'covalent'
      },
      atomic: {
        atomic_number: 1,
        atomic_mass: 1.008,
        mass_number: 1,
        neutron_count: 0,
        proton_count: 1,
        electron_count: 1,
        shells: [1],
        subshells: ['1s'],
        nuclear_charge: 1,
        atomic_volume: 14.4
      },
      thermodynamic: {
        standard_enthalpy_formation: 0,
        standard_entropy: 130.7,
        standard_gibbs_energy: 0,
        heat_capacity_ratio: 1.41
      },
      electromagnetic: {
        electrical_resistivity: null,
        electrical_conductivity: null,
        magnetic_susceptibility: -2.74e-9,
        magnetic_moment: null,
        superconducting_point: null
      }
    }
  },
  {
    number: 6,
    symbol: 'C',
    name: 'Carbon',
    atomic_mass: 12.011,
    category: 'nonmetal',
    electron_configuration: '1s2 2s2 2p2',
    electron_configuration_semantic: '1s² 2s² 2p²',
    period: 2,
    group: 14,
    block: 'p',
    phase: 'solid',
    appearance: 'black (graphite), clear (diamond)',
    density: 2.267,
    melt: 3823,
    boil: 4098,
    molar_heat: 8.517,
    electron_affinity: 153.9,
    electronegativity_pauling: 2.55,
    ionization_energies: [1086.5, 2352.6, 4620.5],
    shells: [2, 4],
    discovered_by: 'Ancient',
    named_by: null,
    cpk_hex: '#909090',
    xpos: 14,
    ypos: 2,
    wxpos: 14,
    wypos: 2,
    source: 'https://en.wikipedia.org/wiki/Carbon',
    bohr_model_image: '',
    bohr_model_3d: '',
    spectral_img: '',
    summary: 'Carbon is a chemical element with the symbol C and atomic number 6.',
    image: {
      title: 'Carbon',
      url: '',
      attribution: ''
    },
    properties: {
      physical: {
        density: 2.267,
        melting_point: 3823,
        boiling_point: 4098,
        triple_point: undefined,
        critical_point: undefined,
        heat_of_fusion: 117,
        heat_of_vaporization: 715,
        molar_heat_capacity: 8.517,
        thermal_conductivity: 129,
        thermal_expansion: null,
        speed_of_sound: 18350,
        refractive_index: 2.417,
        crystal_structure: 'hexagonal',
        magnetic_ordering: 'diamagnetic'
      },
      chemical: {
        electron_configuration: '1s2 2s2 2p2',
        electron_configuration_semantic: '1s² 2s² 2p²',
        oxidation_states: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
        electronegativity_pauling: 2.55,
        electronegativity_sanderson: 2.75,
        electronegativity_allred_rochow: 2.50,
        electron_affinity: 153.9,
        ionization_energies: [1086.5, 2352.6, 4620.5],
        atomic_radius: 70,
        covalent_radius: 76,
        van_der_waals_radius: 170,
        valence_electrons: 4,
        bonding_type: 'covalent'
      },
      atomic: {
        atomic_number: 6,
        atomic_mass: 12.011,
        mass_number: 12,
        neutron_count: 6,
        proton_count: 6,
        electron_count: 6,
        shells: [2, 4],
        subshells: ['1s', '2s', '2p'],
        nuclear_charge: 6,
        atomic_volume: 5.3
      },
      thermodynamic: {
        standard_enthalpy_formation: 716.7,
        standard_entropy: 5.7,
        standard_gibbs_energy: 671.3,
        heat_capacity_ratio: null
      },
      electromagnetic: {
        electrical_resistivity: null,
        electrical_conductivity: null,
        magnetic_susceptibility: -5.9e-6,
        magnetic_moment: null,
        superconducting_point: null
      }
    }
  }];

  let selectedElementIndex = 0;
  let testElement = testElements[selectedElementIndex];

  let selectedOrbital = 's';
  let animationSpeed = 1.0;
  let viewerWidth = 500;
  let viewerHeight = 400;

  let orbitalViewer: OrbitalViewer;
</script>

<div class="test-container">
  <h2>Orbital Viewer Test</h2>
  
  <div class="controls">
    <div class="control-group">
      <label for="element-select">Test Element:</label>
      <select id="element-select" bind:value={selectedElementIndex} on:change={() => testElement = testElements[selectedElementIndex]}>
        {#each testElements as element, index}
          <option value={index}>{element.name} ({element.symbol})</option>
        {/each}
      </select>
    </div>
    
    <div class="control-group">
      <label for="orbital-select">Orbital Type:</label>
      <select id="orbital-select" bind:value={selectedOrbital}>
        <option value="s">s orbital</option>
        <option value="p">p orbital</option>
        <option value="d">d orbital</option>
        <option value="f">f orbital</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="speed-slider">Animation Speed:</label>
      <input 
        id="speed-slider"
        type="range" 
        min="0" 
        max="3" 
        step="0.1" 
        bind:value={animationSpeed}
      />
      <span>{animationSpeed.toFixed(1)}x</span>
    </div>
    
    <div class="control-group">
      <label for="width-slider">Width:</label>
      <input 
        id="width-slider"
        type="range" 
        min="300" 
        max="800" 
        step="50" 
        bind:value={viewerWidth}
      />
      <span>{viewerWidth}px</span>
    </div>
    
    <div class="control-group">
      <label for="height-slider">Height:</label>
      <input 
        id="height-slider"
        type="range" 
        min="200" 
        max="600" 
        step="50" 
        bind:value={viewerHeight}
      />
      <span>{viewerHeight}px</span>
    </div>
    
    <div class="control-group">
      <button on:click={() => orbitalViewer?.resetCamera()}>
        Reset Camera
      </button>
      <button on:click={() => orbitalViewer?.toggleAutoRotate()}>
        Toggle Auto Rotate
      </button>
      <button on:click={() => orbitalViewer?.startFillingAnimation()}>
        Animate Filling
      </button>
      <button on:click={() => orbitalViewer?.showElectronConfiguration()}>
        Show Electrons
      </button>
    </div>
  </div>
  
  <div class="viewer-container">
    <OrbitalViewer 
      bind:this={orbitalViewer}
      element={testElement}
      orbitalType={selectedOrbital}
      {animationSpeed}
      width={viewerWidth}
      height={viewerHeight}
    />
  </div>
  
  <div class="info">
    <h3>Element: {testElement.name} ({testElement.symbol})</h3>
    <p>Electron Configuration: {testElement.electron_configuration}</p>
    <p>Current Orbital: {selectedOrbital}</p>
  </div>
</div>

<style>
  .test-container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
    background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
    color: white;
    border-radius: 12px;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #00aaff;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .control-group label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  .control-group select,
  .control-group input[type="range"] {
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
  }

  .control-group button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: linear-gradient(135deg, #00aaff, #0088cc);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-group button:hover {
    background: linear-gradient(135deg, #0088cc, #006699);
    transform: translateY(-1px);
  }

  .viewer-container {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }

  .info {
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }

  .info h3 {
    margin: 0 0 10px 0;
    color: #00ff88;
  }

  .info p {
    margin: 5px 0;
    color: rgba(255, 255, 255, 0.8);
  }
</style>
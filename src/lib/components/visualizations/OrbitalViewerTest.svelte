<script lang="ts">
  import OrbitalViewer from './OrbitalViewer.svelte';
  import type { Element } from '$lib/types/element';

  // Sample element for testing
  const testElement: Element = {
    number: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomic_mass: 1.008,
    category: 'nonmetal',
    electron_configuration: '1s1',
    period: 1,
    group: 1,
    block: 's',
    density: 0.00008988,
    melting_point: 14.01,
    boiling_point: 20.28,
    discovery_year: 1766,
    discovered_by: 'Henry Cavendish'
  };

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
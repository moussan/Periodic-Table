<script>
  // Import necessary Svelte functions and transitions
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Electron from './Electron.svelte';
  import OrbitalViewer from './components/visualizations/OrbitalViewer.svelte';
  import { getOrbitalData, calculateEnergyLevels } from './utils/orbitalUtils';

  // Define the element data passed into the component
  export let element;
  // Create a dispatcher to emit custom events
  const dispatch = createEventDispatcher();

  // Modal open/close
  function close() {
    dispatch('close');
  }
  function handleKeydown(event) {
    // Close modal on Escape key press
    if (event.key === 'Escape') close();
  }
  // Add event listener for keydown when the component mounts
  onMount(() => window.addEventListener('keydown', handleKeydown));
  // Remove event listener for keydown when the component unmounts
  onDestroy(() => window.removeEventListener('keydown', handleKeydown));


  // Animation state
  let time = 0;
  let animationFrame;
  function animate() {
    time += 0.016; // ~60fps
    animationFrame = requestAnimationFrame(animate);
  }
  // Start the animation loop when the component mounts and clean up when unmounting
  onMount(() => {
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  });
  onDestroy(() => cancelAnimationFrame(animationFrame));

  // SVG layout
  let size = 350; // SVG width/height
  // Define min/max size for resizing
  const minSize = 250, maxSize = 600;
  // Helper function to get the center coordinates
  const center = () => size / 2;
  // Define radii and spacing for the Bohr model
  const nucleusRadius = 18;
  const shellGap = 32;
  const electronRadius = 6;
  // Reactive declaration for electron shells array
  $: shells = Array.isArray(element.shells) ? element.shells : [];
  $: maxShells = shells.length;
  // Define colors for the visualization
  const shellColor = '#bbb';
  const electronColor = '#007bff';
  const nucleusColor = '#e74c3c';

  // Parse electron configuration for quantum view
  function parseConfig(config) {
    if (!config) return [];
    // Replace unicode superscripts with normal numbers
    config = config.replace(/([spdfg])([\u2070-\u2079]+)/g, (m, l, n) => l + n.replace(/[\u2070-\u2079]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)));
    // Now match e.g. 1s2, 2p6, etc.
    return Array.from(config.matchAll(/(\d+)([spdf])([\d]+)/g)).map(m => ({
      n: m[1],
      type: m[2],
      count: +m[3],
      label: m[0]
    }));
  }
  // Reactive declaration for parsed quantum orbitals
  $: quantumOrbitals = parseConfig(element.electron_configuration_semantic || element.electron_configuration);

  // Enhanced orbital data and energy levels
  $: orbitalData = element ? getOrbitalData(element) : null;
  $: energyLevels = orbitalData ? calculateEnergyLevels(orbitalData.configurations) : [];

  // 3D visualization state
  let selectedOrbitalType = 's';
  let show3DView = false;
  let activeTab = 'bohr'; // 'bohr', 'quantum', '3d', 'energy'
  let orbitalViewerRef;

  // Drag state
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let modalPos = { x: 0, y: 0 };
  let modalRef;
  // Handle pointer down event on the modal header to start dragging
  function onHeaderPointerDown(e) {
    dragging = true;
    dragStart = {
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos.y
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }
  // Handle pointer move event to update modal position while dragging
  function onPointerMove(e) {
    if (!dragging) return;
    modalPos.x = e.clientX - dragStart.x;
    modalPos.y = e.clientY - dragStart.y;
  }
  // Handle pointer up event to stop dragging and remove event listeners
  function onPointerUp() {
    dragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  // Resize state
  let resizing = false;
  let resizeStart = { x: 0, size: 0 };
  // Handle pointer down event on the resize handle to start resizing
  function onResizePointerDown(e) {
    resizing = true;
    resizeStart = { x: e.clientX, size };
    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', onResizeUp);
    e.stopPropagation();
  }
  // Handle pointer move event to update modal size while resizing
  function onResizeMove(e) {
    if (!resizing) return;
    let newSize = resizeStart.size + (e.clientX - resizeStart.x);
    size = Math.max(minSize, Math.min(maxSize, newSize));
  }
  // Handle pointer up event to stop resizing and remove event listeners
  function onResizeUp() {
    resizing = false;
    window.removeEventListener('pointermove', onResizeMove);
    window.removeEventListener('pointerup', onResizeUp);
  }

  // Helper function to get orbital color as hex string
  function getOrbitalColorHex(orbitalType) {
    const colors = {
      's': '#00aaff',
      'p': '#00ff00', 
      'd': '#ffaa00',
      'f': '#ff00aa'
    };
    return colors[orbitalType] || '#00aaff';
  }
</script>

<!-- Modal backdrop for dimming the background and closing the modal on click -->
<div class="modal-backdrop" on:click={close} role="dialog" aria-modal="true" aria-labelledby="orbit-modal-title">
  <div
    class="modal-content"
    bind:this={modalRef}
    on:click|stopPropagation
    style="transform: translate({modalPos.x}px, {modalPos.y}px); width: {size}px; max-width: 98vw; min-width: 220px;"
    transition:scale|local={{ duration: 180 }}
  >
    <header class="modal-header" on:pointerdown={onHeaderPointerDown} style="cursor: move;">
      <h2 id="orbit-modal-title">{element.name} ({element.symbol})</h2>
      <button class="modal-close-button" on:click={close} aria-label="Close modal">&times;</button>
    </header>
    <div class="modal-body">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          class="tab-button {activeTab === 'bohr' ? 'active' : ''}"
          on:click={() => activeTab = 'bohr'}
        >
          Bohr Model
        </button>
        <button 
          class="tab-button {activeTab === 'quantum' ? 'active' : ''}"
          on:click={() => activeTab = 'quantum'}
        >
          Quantum Orbitals
        </button>
        <button 
          class="tab-button {activeTab === '3d' ? 'active' : ''}"
          on:click={() => activeTab = '3d'}
        >
          3D Visualization
        </button>
        <button 
          class="tab-button {activeTab === 'energy' ? 'active' : ''}"
          on:click={() => activeTab = 'energy'}
        >
          Energy Levels
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'bohr'}
          <div class="bohr-tab">
            <div class="orbitals-view-box bohr-view-box">
              <div class="orbitals-view-label">Bohr Model</div>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style="max-width: 100%; max-height: 60vh; height: auto; width: auto; display: block; margin: 0 auto;">
                <!-- SVG element for the Bohr model visualization -->
                <!-- Draw the nucleus circle -->
                <circle cx={center()} cy={center()} r={nucleusRadius} fill={nucleusColor} stroke="#a00" stroke-width="2" />
                <text x={center()} y={center()+5} text-anchor="middle" font-size="1.2em" fill="#fff">{element.symbol}</text>
                <!-- Loop through each electron shell and draw the shell circle and electrons -->
                <!-- Shells, labels, and electrons -->
                {#each shells as electronCount, shellIdx}
                  {#if electronCount > 0}
                    <circle
                      cx={center()}
                      cy={center()}
                      r={nucleusRadius + shellGap * (shellIdx + 1)}
                      fill="none"
                      stroke={shellColor}
                      stroke-width="1.5"
                    />
                    <!-- Draw the shell label (K, L, M, etc.) -->
                    <text
                      x={center()}
                      y={center() - (nucleusRadius + shellGap * (shellIdx + 1) + 18)}
                      text-anchor="middle"
                      font-size="1em"
                      fill="#888"
                      font-weight="bold"
                    >
                      {['K','L','M','N','O','P','Q'][shellIdx] || shellIdx+1}
                    </text>
                    <!-- Loop through each electron in the shell and render the Electron component -->
                    {#each Array(electronCount) as _, eIdx (shellIdx + '-' + eIdx)}
                      <Electron
                        center={center()}
                        shellRadius={nucleusRadius + shellGap * (shellIdx + 1)}
                        electronRadius={electronRadius}
                        idx={eIdx}
                        total={electronCount}
                        shellIdx={shellIdx}
                        {time}
                        color={electronColor}
                        speed={1.2 - shellIdx * 0.12}
                      />
                    {/each}
                  {/if}
                {/each}
              </svg>
              <!-- Legend for the Bohr model -->
              <div class="legend">
                <span class="nucleus-dot"></span> Nucleus
                <span class="electron-dot"></span> Electron
              </div>
              <!-- Display electron count per shell -->
              <div class="shells-info">
                <!-- Loop through shells and display the count -->
                {#each shells as n, i}
                  <span>Shell {i+1}: {n} electron{n === 1 ? '' : 's'}</span>{#if i < shells.length-1}, {/if}
                {/each}
              </div>
              <!-- Educational annotation for Bohr model -->
              <div class="educational-note">
                <h4>About the Bohr Model</h4>
                <p>The Bohr model shows electrons orbiting the nucleus in fixed circular paths called shells. While simplified, it helps visualize electron arrangement and energy levels.</p>
              </div>
            </div>
          </div>
        {:else if activeTab === 'quantum'}
          <div class="quantum-tab">
            <div class="orbitals-view-box quantum-view-box">
              <div class="orbitals-view-label">Quantum Orbitals</div>
              <div class="quantum-orbitals-visual">
                <!-- Display quantum orbitals if available -->
                {#if quantumOrbitals.length > 0}
                  <div class="orbitals-row">
                    <!-- Loop through each parsed orbital -->
                    {#each quantumOrbitals as orb}
                      <!-- Render an orbital cell -->
                      <div class="orbital-cell" on:click={() => {selectedOrbitalType = orb.type; activeTab = '3d';}}>
                        {#if orb.type === 's'}
                          <svg width="38" height="38" viewBox="0 0 38 38">
                            <circle cx="19" cy="19" r="14" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                          </svg>
                        {:else if orb.type === 'p'}
                          <svg width="38" height="38" viewBox="0 0 38 38">
                            <ellipse cx="13" cy="19" rx="6" ry="14" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                            <ellipse cx="25" cy="19" rx="6" ry="14" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                          </svg>
                        {:else if orb.type === 'd'}
                          <svg width="38" height="38" viewBox="0 0 38 38">
                            <ellipse cx="19" cy="10" rx="4" ry="10" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(45 19 19)" />
                            <ellipse cx="19" cy="28" rx="4" ry="10" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(-45 19 19)" />
                          </svg>
                        {:else if orb.type === 'f'}
                          <svg width="38" height="38" viewBox="0 0 38 38">
                            <ellipse cx="19" cy="19" rx="3" ry="10" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(0 19 19)" />
                            <ellipse cx="19" cy="19" rx="3" ry="10" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(60 19 19)" />
                            <ellipse cx="19" cy="19" rx="3" ry="10" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(120 19 19)" />
                          </svg>
                        {/if}
                        <!-- Display orbital label and electron count -->
                        <div class="orbital-label">{orb.label}</div>
                        <div class="orbital-electrons">{orb.count}e⁻</div>
                      </div>
                    {/each}
                  </div>
                  <!-- Electron configuration display -->
                  <div class="electron-config-display">
                    <h4>Electron Configuration</h4>
                    <div class="config-text">{element.electron_configuration || 'N/A'}</div>
                    <p class="config-explanation">
                      This notation shows how electrons are distributed among atomic orbitals. 
                      Click on any orbital above to see its 3D shape.
                    </p>
                  </div>
                {:else}
                  <div class="quantum-label">No configuration available</div>
                {/if}
              </div>
            </div>
          </div>
        {:else if activeTab === '3d'}
          <div class="threed-tab">
            <div class="orbital-3d-container">
              <div class="orbital-selector-controls">
                <label for="orbital-type">Select Orbital Type:</label>
                <select id="orbital-type" bind:value={selectedOrbitalType}>
                  <option value="s">s orbital (spherical)</option>
                  <option value="p">p orbital (dumbbell)</option>
                  <option value="d">d orbital (cloverleaf)</option>
                  <option value="f">f orbital (complex)</option>
                </select>
              </div>
              
              <OrbitalViewer 
                bind:this={orbitalViewerRef}
                {element}
                orbitalType={selectedOrbitalType}
                width={Math.min(size, 500)}
                height={Math.min(size * 0.8, 400)}
                animationSpeed={1.0}
              />
              
              <!-- Educational annotations for 3D view -->
              <div class="orbital-explanation">
                <h4>{selectedOrbitalType.toUpperCase()} Orbital</h4>
                {#if selectedOrbitalType === 's'}
                  <p>S orbitals are spherical in shape and can hold up to 2 electrons. They represent the probability of finding electrons around the nucleus in a spherical region.</p>
                {:else if selectedOrbitalType === 'p'}
                  <p>P orbitals have a dumbbell shape and can hold up to 6 electrons (2 per orbital, 3 orbitals total). They are oriented along the x, y, and z axes.</p>
                {:else if selectedOrbitalType === 'd'}
                  <p>D orbitals have complex cloverleaf shapes and can hold up to 10 electrons (2 per orbital, 5 orbitals total). They play important roles in transition metal chemistry.</p>
                {:else if selectedOrbitalType === 'f'}
                  <p>F orbitals have very complex shapes and can hold up to 14 electrons (2 per orbital, 7 orbitals total). They are found in lanthanides and actinides.</p>
                {/if}
              </div>
            </div>
          </div>
        {:else if activeTab === 'energy'}
          <div class="energy-tab">
            <div class="energy-levels-container">
              <h3>Energy Level Diagram</h3>
              {#if energyLevels.length > 0}
                <div class="energy-diagram">
                  {#each energyLevels as level, index}
                    <div class="energy-level" style="bottom: {index * 60}px;">
                      <div class="level-line"></div>
                      <div class="level-info">
                        <span class="level-number">n = {level.level}</span>
                        <div class="orbitals-in-level">
                          {#each level.orbitals as orbital}
                            <div class="orbital-box" style="background-color: {getOrbitalColorHex(orbital.type)};">
                              <span class="orbital-notation">{orbital.subshell}</span>
                              <div class="electron-boxes">
                                {#each Array(Math.ceil(orbital.maxElectrons / 2)) as _, boxIndex}
                                  <div class="electron-box">
                                    {#if boxIndex * 2 < orbital.electrons}
                                      <span class="electron up">↑</span>
                                    {/if}
                                    {#if boxIndex * 2 + 1 < orbital.electrons}
                                      <span class="electron down">↓</span>
                                    {/if}
                                  </div>
                                {/each}
                              </div>
                            </div>
                          {/each}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
                <!-- Educational explanation for energy levels -->
                <div class="energy-explanation">
                  <h4>Understanding Energy Levels</h4>
                  <p>Electrons occupy orbitals in order of increasing energy. Lower energy levels fill first (Aufbau principle). 
                     Each orbital can hold a maximum of 2 electrons with opposite spins (Pauli exclusion principle).</p>
                  <ul>
                    <li><strong>↑</strong> represents an electron with spin up</li>
                    <li><strong>↓</strong> represents an electron with spin down</li>
                    <li>Electrons prefer to occupy empty orbitals before pairing (Hund's rule)</li>
                  </ul>
                </div>
              {:else}
                <p>No energy level data available for this element.</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <!-- Resize handle element -->
    <div class="resize-handle" on:pointerdown={onResizePointerDown}></div>
  </div>
</div>


<!-- Component styling -->
<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    min-width: 220px;
    min-height: 220px;
    width: 75vw;
    height: 75vh;
    max-width: 1600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    user-select: none;
    transition: box-shadow 0.2s;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 15px;
    cursor: move;
    user-select: none;
  }
  .modal-header h2 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
  }
  .modal-close-button {
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: #888;
  }
  .modal-close-button:hover {
    color: #333;
  }
  .modal-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: auto;
    min-height: 180px;
  }
  .legend {
    margin-top: 10px;
    font-size: 0.95em;
    color: #555;
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;
  }
  .nucleus-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: #e74c3c;
    border-radius: 50%;
    border: 2px solid #a00;
    margin-right: 4px;
    vertical-align: middle;
  }
  .electron-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: #007bff;
    border-radius: 50%;
    border: 1px solid #333;
    margin-right: 4px;
    vertical-align: middle;
  }
  .shells-info {
    margin-top: 8px;
    font-size: 0.95em;
    color: #666;
  }
  .resize-handle {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 18px;
    height: 18px;
    background: url('data:image/svg+xml;utf8,<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="15" x2="15" y2="3" stroke="%23999" stroke-width="2"/><line x1="7" y1="17" x2="17" y2="7" stroke="%23999" stroke-width="2"/></svg>') no-repeat center center;
    cursor: nwse-resize;
    z-index: 10;
    opacity: 0.7;
  }
  .resize-handle:hover {
    opacity: 1;
  }
  .orbitals-sidebyside {
    display: flex;
    flex-direction: row;
    gap: 2.2em;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    box-sizing: border-box;
  }
  .bohr-view-box {
    flex: 3 1 0;
    min-width: 0;
    max-width: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    background: #f8fafd;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    padding: 1.1em 1.2em 1.2em 1.2em;
  }
  .quantum-view-box {
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    background: #f8fafd;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    padding: 1.1em 1.2em 1.2em 1.2em;
  }
  .orbitals-view-box svg {
    max-width: 100%;
    height: auto;
    display: block;
  }
  .orbitals-view-label {
    font-size: 1.1em;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 0.7em;
    letter-spacing: 0.01em;
  }

  /* Tab Navigation Styles */
  .tab-navigation {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0;
  }

  .tab-button {
    padding: 12px 20px;
    border: none;
    background: transparent;
    color: #666;
    font-size: 0.95em;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s ease;
    position: relative;
  }

  .tab-button:hover {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }

  .tab-button.active {
    background: #007bff;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #007bff;
  }

  /* Tab Content Styles */
  .tab-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 400px;
  }

  .bohr-tab, .quantum-tab, .threed-tab, .energy-tab {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  /* Enhanced Quantum View Styles */
  .orbital-cell {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 8px;
    padding: 8px;
  }

  .orbital-cell:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
    background: rgba(0, 123, 255, 0.05);
  }

  .electron-config-display {
    margin-top: 20px;
    padding: 16px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid #007bff;
    max-width: 500px;
  }

  .electron-config-display h4 {
    margin: 0 0 8px 0;
    color: #007bff;
    font-size: 1.1em;
  }

  .config-text {
    font-family: 'Courier New', monospace;
    font-size: 1.1em;
    color: #333;
    background: white;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 8px 0;
    border: 1px solid #ddd;
  }

  .config-explanation {
    font-size: 0.9em;
    color: #666;
    margin: 8px 0 0 0;
    line-height: 1.4;
  }

  /* 3D Tab Styles */
  .orbital-3d-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  .orbital-selector-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 123, 255, 0.2);
  }

  .orbital-selector-controls label {
    font-weight: 500;
    color: #333;
  }

  .orbital-selector-controls select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;
    font-size: 0.95em;
    cursor: pointer;
  }

  .orbital-explanation {
    max-width: 500px;
    padding: 16px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid #007bff;
    text-align: left;
  }

  .orbital-explanation h4 {
    margin: 0 0 8px 0;
    color: #007bff;
    font-size: 1.1em;
  }

  .orbital-explanation p {
    margin: 0;
    color: #666;
    line-height: 1.5;
    font-size: 0.95em;
  }

  /* Energy Levels Tab Styles */
  .energy-levels-container {
    width: 100%;
    max-width: 600px;
    padding: 20px;
  }

  .energy-levels-container h3 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }

  .energy-diagram {
    position: relative;
    height: 400px;
    background: linear-gradient(to top, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    overflow-y: auto;
  }

  .energy-level {
    position: absolute;
    left: 20px;
    right: 20px;
    height: 50px;
    display: flex;
    align-items: center;
  }

  .level-line {
    width: 60px;
    height: 2px;
    background: #333;
    margin-right: 12px;
  }

  .level-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .level-number {
    font-weight: bold;
    color: #333;
    min-width: 40px;
  }

  .orbitals-in-level {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .orbital-box {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    min-width: 60px;
    text-align: center;
  }

  .orbital-notation {
    font-size: 0.8em;
    font-weight: bold;
    color: white;
    display: block;
    margin-bottom: 2px;
  }

  .electron-boxes {
    display: flex;
    gap: 2px;
    justify-content: center;
  }

  .electron-box {
    width: 16px;
    height: 20px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    border-radius: 2px;
  }

  .electron {
    line-height: 1;
    font-weight: bold;
  }

  .electron.up {
    color: #007bff;
  }

  .electron.down {
    color: #dc3545;
  }

  .energy-explanation {
    padding: 16px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid #007bff;
  }

  .energy-explanation h4 {
    margin: 0 0 12px 0;
    color: #007bff;
    font-size: 1.1em;
  }

  .energy-explanation p {
    margin: 0 0 12px 0;
    color: #666;
    line-height: 1.5;
    font-size: 0.95em;
  }

  .energy-explanation ul {
    margin: 0;
    padding-left: 20px;
    color: #666;
    font-size: 0.9em;
  }

  .energy-explanation li {
    margin-bottom: 4px;
    line-height: 1.4;
  }

  /* Educational Notes */
  .educational-note {
    margin-top: 16px;
    padding: 16px;
    background: rgba(40, 167, 69, 0.05);
    border-radius: 8px;
    border-left: 4px solid #28a745;
    max-width: 500px;
  }

  .educational-note h4 {
    margin: 0 0 8px 0;
    color: #28a745;
    font-size: 1.1em;
  }

  .educational-note p {
    margin: 0;
    color: #666;
    line-height: 1.5;
    font-size: 0.95em;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .tab-navigation {
      flex-wrap: wrap;
      gap: 2px;
    }
    
    .tab-button {
      padding: 8px 12px;
      font-size: 0.85em;
      flex: 1;
      min-width: 0;
    }
    
    .orbital-selector-controls {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
    
    .energy-diagram {
      height: 300px;
      padding: 15px;
    }
    
    .orbitals-in-level {
      flex-direction: column;
      gap: 4px;
    }
  }
</style> 
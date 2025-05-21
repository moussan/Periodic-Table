<script>
  // Import necessary Svelte functions and transitions
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Electron from './Electron.svelte';

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
</script>

<!-- Modal backdrop for dimming the background and closing the modal on click -->
<div class="modal-backdrop" on:click={close} role="dialog" aria-modal="true" aria-labelledby="orbit-modal-title">
  <div
    class="modal-content"
    bind:this={modalRef}
    on:click|stopPropagation
    style="transform: translate({modalPos.x}px, {modalPos.y}px); width: {size}px; max-width: 98vw; min-width: 220px;"
    <!-- Apply a scale transition when the modal appears/disappears -->
    transition:scale|local={{ duration: 180 }}
  >
    <header class="modal-header" on:pointerdown={onHeaderPointerDown} style="cursor: move;">
      <h2 id="orbit-modal-title">{element.name} ({element.symbol})</h2>
      <button class="modal-close-button" on:click={close} aria-label="Close modal">&times;</button>
    </header>
    <div class="modal-body">
      <div class="orbitals-sidebyside">
        <div class="orbitals-view-box bohr-view-box">
          <div class="orbitals-view-label">Bohr View</div>
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
        </div>
        <div class="orbitals-view-box quantum-view-box">
          <div class="orbitals-view-label">Quantum View</div>
          <div class="quantum-orbitals-visual">
            <!-- Display quantum orbitals if available -->
            {#if quantumOrbitals.length > 0}
              <div class="orbitals-row">
                <!-- Loop through each parsed orbital -->
                {#each quantumOrbitals as orb}
                  <!-- Render an orbital cell -->
                  <div class="orbital-cell">
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
            {:else}
              <div class="quantum-label">No configuration</div>
            {/if}
          </div>
        </div>
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
</style> 
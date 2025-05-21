<script>
  // Import necessary Svelte components and modules
  import PeriodicTable from '$lib/PeriodicTable.svelte';
  import ElementModal from '$lib/ElementModal.svelte';
  import elementsData from '$lib/data/PeriodicTableJSON.json';
  import { OrbitAnimationModal } from '$lib/OrbitAnimationModal.svelte';
  import FLogo from '$lib/FLogo.svelte';
  import { onMount } from 'svelte';

  // State variables for managing data and UI visibility
  // allElements: Holds the list of elements from the JSON data
  let allElements = elementsData.elements;
  // selectedElement: Stores the currently selected element for the Wiki modal
  let selectedElement = null;
  // showWikiModal: Controls the visibility of the Wiki modal
  let showWikiModal = false;
  // showOrbitModal: Controls the visibility of the Orbit animation modal
  let showOrbitModal = false;
  // orbitElement: Stores the element for which the orbit animation is shown
  let orbitElement = null;

  // Handler function to show the Wiki modal
  // Takes an event detail containing the selected element
  function handleShowWiki(event) {
    selectedElement = event.detail;
    showWikiModal = true;
  }

  // Handler function to show the Orbit animation modal
  // Takes an event detail containing the selected element
  function handleShowOrbitAnimation(event) {
    orbitElement = event.detail;
    showOrbitModal = true;
  }

  // Function to close the Wiki modal and reset the selected element
  function closeWikiModal() {
    showWikiModal = false;
    selectedElement = null;
  }

  // Function to close the Orbit animation modal and reset the orbit element
  function closeOrbitModal() {
    showOrbitModal = false;
    orbitElement = null;
  }

  // Ensure all elements have xpos and ypos, and they are numbers
  allElements = allElements.filter(el => 
    el && typeof el.xpos === 'number' && typeof el.ypos === 'number' && el.name
  );

  // Create a map for quick lookup of elements by position
  const elementMap = new Map();
  allElements.forEach(el => {
    elementMap.set(`${el.xpos}-${el.ypos}`, el);
  });

  // Define the standard dimensions for the periodic table grid
  // Determine table dimensions
  const maxC = 18; // Standard periodic table width
  const maxR = 10; // Standard periodic table height (including lanthanides/actinides)

  // Define version and current year for the footer
  const version = 'v1.0.0';
  // year: Get the current year
  const year = new Date().getFullYear();

  // Sticky header background on scroll
  let headerEl;
  onMount(() => {
    const onScroll = () => {
      if (window.scrollY > 10) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });
  // Return a cleanup function to remove the event listener when the component is destroyed
</script>

<!-- Svelte head component for adding elements to the document head -->
<svelte:head>
  <title>Modern Periodic Table</title>
  <link rel="stylesheet" href="/global.css">
  <style>
    /* Basic styling for html and body to ensure full width and prevent horizontal overflow */
    html, body {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      overflow-x: hidden;
    }
  </style>
</svelte:head>

<div class="site-bg">
  <!-- Background grid overlay for visual effect -->
  <div class="grid-overlay"></div>
  <main>
    <!-- Application header -->
    <header class="app-header" bind:this={headerEl}>
      <div class="header-left">
        <!-- Feynman Logo component -->
        <FLogo size={60} />
        <h1>Modern Periodic Table</h1>
        <!-- Application title -->
      </div>
    </header>
    <div class="table-legend-container">
      <section class="legend-box legend-floating">
        <div class="legend-title">Legend</div>
        <div class="legend-large-cell">
          <span class="legend-large-number">Atomic Number</span>
          <!-- Info button with SVG icon -->
          <button class="legend-large-info" tabindex="-1" aria-label="Info"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#007bff" stroke-width="2" fill="#fff"/><line x1="10" y1="5" x2="10" y2="15" stroke="#007bff" stroke-width="2" /><line x1="5" y1="10" x2="15" y2="10" stroke="#007bff" stroke-width="2" /></svg></button>
          <!-- Element Symbol label -->
          <span class="legend-large-symbol">Symbol</span>
          <!-- Element Name label -->
          <span class="legend-large-name">Name</span>
          <!-- Atomic Weight label -->
          <span class="legend-large-weight">Atomic Weight</span>
          <!-- Orbitals button label -->
          <button class="legend-large-orbital" tabindex="-1">Orbitals</button>
          <div class="legend-orbital-svg">
            <svg viewBox="0 0 220 60" width="100%" height="48" style="max-width:220px;">
              <!-- s orbital -->
              <g>
                <circle cx="25" cy="30" r="16" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                <text x="25" y="55" text-anchor="middle" font-size="18" fill="#007bff">s</text>
              </g>
              <!-- p orbital -->
              <g>
                <ellipse cx="75" cy="30" rx="8" ry="18" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                <ellipse cx="95" cy="30" rx="8" ry="18" fill="#bbd4f6" stroke="#007bff" stroke-width="2" />
                <text x="85" y="55" text-anchor="middle" font-size="18" fill="#007bff">p</text>
              </g>
              <!-- d orbital -->
              <g>
                <ellipse cx="135" cy="20" rx="6" ry="14" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(45 135 30)" />
                <ellipse cx="135" cy="40" rx="6" ry="14" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(-45 135 30)" />
                <ellipse cx="155" cy="30" rx="6" ry="14" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(45 155 30)" />
                <ellipse cx="155" cy="30" rx="6" ry="14" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(-45 155 30)" />
                <text x="145" y="55" text-anchor="middle" font-size="18" fill="#007bff">d</text>
              </g>
              <!-- f orbital (abstract, 6 lobes) -->
              <g>
                <ellipse cx="195" cy="30" rx="5" ry="13" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(0 195 30)" />
                <ellipse cx="195" cy="30" rx="5" ry="13" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(60 195 30)" />
                <ellipse cx="195" cy="30" rx="5" ry="13" fill="none" stroke="#007bff" stroke-width="2" transform="rotate(120 195 30)" />
                <text x="195" y="55" text-anchor="middle" font-size="18" fill="#007bff">f</text>
              </g>
            </svg>
          </div>
        </div>
      </section>
      <!-- PeriodicTable component, passing data and event handlers -->
      <PeriodicTable 
        elements={allElements} 
        {maxC} 
        {maxR} 
        {elementMap} 
        on:showWiki={handleShowWiki}
        on:showOrbitAnimation={handleShowOrbitAnimation}
      />
    </div>
    
    <!-- Conditionally render the ElementModal if showWikiModal is true and selectedElement is not null -->
    {#if showWikiModal && selectedElement}
      <ElementModal element={selectedElement} on:close={closeWikiModal} />
    {/if}
    <!-- Conditionally render the OrbitAnimationModal if showOrbitModal is true and orbitElement is not null -->
    {#if showOrbitModal && orbitElement}
      <OrbitAnimationModal element={orbitElement} on:close={closeOrbitModal} />
      <!-- Pass the element data and a close handler -->
    {/if}
  </main>

  <footer class="app-footer">
    <div class="footer-left"><FLogo size={32} /><span class="footer-copyright">&copy; Moussa El Najmi</span><span class="footer-version">{year} · {version}</span></div>
  </footer>
</div>

<style>
  /* Styling for the main site background */
  .site-bg {
    min-height: 100vh;
    width: 100%;
    position: relative;
    background: linear-gradient(to bottom, #0a2342 0%, #193a6a 100%);
    overflow-x: hidden;
    box-sizing: border-box;
  }
  /* Styling for the grid overlay effect */
  .grid-overlay {
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    background-image:
      repeating-linear-gradient(to right, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px);
    background-size: 40px 40px;
    opacity: 0.7;
  }
  /* Styling for the main content area */
  main {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 1em;
    max-width: 100vw;
    margin: 0 auto;
    overflow-x: auto;
    box-sizing: border-box;
  }
  /* Styling for the sticky header */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: transparent;
    width: 100%;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 1.5em;
    gap: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    padding: 0.5em 1em;
    border-bottom: none;
    transition: background 0.3s;
    /* Smooth transition for background color */
  }
  /* Styling for the header title */
  .app-header h1 {
    margin-bottom: 0;
    font-size: 2em;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-align: left;
    white-space: nowrap;
  }
  /* Styling for the legend box */
  .legend-box {
    background: transparent;
    color: var(--text);
    border: none;
    border-radius: 12px;
    margin: 0;
    max-width: 98vw;
    padding: 1.2em 1.2em 1.2em 1.2em;
    box-shadow: none;
    text-align: left;
    position: relative;
    /* Position relative for positioning the legend cell inside */
  }
  .legend-title {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 0.7em;
    text-align: center;
    color: #fff;
  }
  /* Styling for the large legend cell example */
  .legend-large-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 200px;
    height: 260px;
    margin: 0 auto;
    max-width: 98vw;
    background: #f0f0f0;
    border: 2.5px solid #bbb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    font-family: inherit;
    z-index: 2;
    padding-bottom: 1.2em;
  }
  /* Styling for the atomic number in the legend cell */
  .legend-large-number {
    position: absolute;
    top: 12px;
    left: 14px;
    font-weight: bold;
    font-size: 0.85em;
    background: #e0e0e0;
    color: #333;
    border-radius: 3px;
    padding: 0.1em 0.6em;
    z-index: 2;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    text-align: left;
  }
  /* Styling for the info button in the legend cell */
  .legend-large-info {
    position: absolute;
    top: 12px;
    right: 14px;
    background: #fffbe7;
    border-radius: 50%;
    padding: 0.1em 0.3em;
    color: #007bff;
    border: 1px solid #eee;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .legend-large-symbol {
    /* Styling for the element symbol in the legend cell */
    font-weight: bold;
    font-size: 1.5em;
    color: #007bff;
    margin-top: 38px;
    margin-bottom: 0.1em;
    z-index: 2;
    letter-spacing: 0.01em;
  }
  /* Styling for the element name in the legend cell */
  .legend-large-name {
    font-size: 1.1em;
    color: #333;
    background: #f7f7f7;
    border-radius: 3px;
    padding: 0.1em 0.7em;
    margin-bottom: 0.2em;
    z-index: 2;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  /* Styling for the atomic weight in the legend cell */
  .legend-large-weight {
    font-size: 1.1em;
    color: #333;
    background: #f7f7f7;
    border-radius: 3px;
    padding: 0.1em 0.7em;
    margin-bottom: 0.2em;
    z-index: 2;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  /* Styling for the orbitals button in the legend cell */
  .legend-large-orbital {
    font-size: 1em;
    color: #007bff;
    background: #eaf2ff;
    border-radius: 3px;
    padding: 0.1em 0.7em;
    font-family: 'Fira Mono', 'Consolas', monospace;
    margin-top: 0.2em;
    z-index: 2;
    border: none;
    outline: none;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  /* Container for the orbital SVG in the legend */
  .legend-orbital-svg {
    margin-top: 0.7em;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /* Media query for smaller screens (max-width 600px) */
  @media (max-width: 600px) {
    .legend-box {
      max-width: 98vw;
      padding: 0.5em 0.2em 0.5em 0.2em;
    }
    .legend-large-cell {
      width: 98vw;
      max-width: 98vw;
      min-width: 0;
      min-height: 120px;
      height: 120px;
    }
    .app-header h1 {
      font-size: 1.1em;
    }
    .app-header {
      padding: 0.5em 0.5em;
    }
    .footer-left {
      /* Adjust gap in footer for smaller screens */
      gap: 0.5em;
    }
  }
  .app-footer {
    position: static;
    width: 100%;
    left: 0;
    right: 0;
    margin: 2em 0 0 0;
    background: transparent;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0.5em 1.2em;
    border-top: none;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.07);
    z-index: 100;
    font-size: 1em;
    min-height: 48px;
    gap: 1.5em;
    box-sizing: border-box;
  }
  /* Styling for the left side of the footer */
  .footer-left {
    display: flex;
    align-items: center;
    gap: 1.2em;
    /* Space between footer items */
  }
  .footer-copyright {
    margin-left: 0.7em;
    font-weight: 500;
    color: #fff;
  }
  .footer-version {
    /* Styling for the version information in the footer */
    margin-left: 1.2em;
    color: #bbd4f6;
    font-size: 0.98em;
  }
  /* Table border removal */
  :global(.periodic-table-grid),
  :global(.element-cell),
  :global(.empty-cell),
  :global(.placeholder),
  :global(.series-label) {
    border: none !important;
    box-shadow: none !important;
  }
  /* Container for the periodic table and the floating legend */
  .table-legend-container {
    position: relative;
    width: 100%;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }
  /* Styling for the legend when it's floating (desktop view) */
  .legend-floating {
    position: absolute;
    left: 50%;
    top: -20px;
    transform: translateX(-50%);
    z-index: 10;
  }
  /* Media query to make the legend static on smaller screens */
  @media (max-width: 900px) {
    .legend-floating {
      position: static;
      left: unset;
      top: unset;
      transform: none;
      margin: 0 auto 0.5em auto;
      display: block;
    }
    /* Reset min-height for the container on smaller screens */
    .table-legend-container {
      min-height: 0;
    }
  }
</style> 
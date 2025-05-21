<script>
  import PeriodicTable from '$lib/PeriodicTable.svelte';
  import ElementModal from '$lib/ElementModal.svelte';
  import elementsData from '$lib/data/PeriodicTableJSON.json';
  import OrbitAnimationModal from '$lib/OrbitAnimationModal.svelte';
  import FLogo from '$lib/FLogo.svelte';
  import { onMount } from 'svelte';

  let allElements = elementsData.elements;
  let selectedElement = null;
  let showWikiModal = false;
  let showOrbitModal = false;
  let orbitElement = null;

  function handleShowWiki(event) {
    selectedElement = event.detail;
    showWikiModal = true;
  }

  function handleShowOrbitAnimation(event) {
    orbitElement = event.detail;
    showOrbitModal = true;
  }

  function closeWikiModal() {
    showWikiModal = false;
    selectedElement = null;
  }

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

  // Determine table dimensions
  const maxC = 18; // Standard periodic table width
  const maxR = 10; // Standard periodic table height (including lanthanides/actinides)

  const version = 'v1.0.0';
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
</script>

<svelte:head>
  <title>Modern Periodic Table</title>
  <link rel="stylesheet" href="/global.css">
  <style>
    html, body {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      overflow-x: hidden;
    }
  </style>
</svelte:head>

<div class="site-bg">
  <div class="grid-overlay"></div>
  <main>
    <header class="app-header" bind:this={headerEl}>
      <div class="header-left">
        <FLogo size={60} />
        <h1>Modern Periodic Table</h1>
      </div>
    </header>
    <div class="table-legend-container">
      <section class="legend-box legend-floating">
        <div class="legend-title">Legend</div>
        <div class="legend-large-cell">
          <span class="legend-large-number">Atomic Number</span>
          <button class="legend-large-info" tabindex="-1" aria-label="Info"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#007bff" stroke-width="2" fill="#fff"/><line x1="10" y1="5" x2="10" y2="15" stroke="#007bff" stroke-width="2" /><line x1="5" y1="10" x2="15" y2="10" stroke="#007bff" stroke-width="2" /></svg></button>
          <span class="legend-large-symbol">Symbol</span>
          <span class="legend-large-name">Name</span>
          <span class="legend-large-weight">Atomic Weight</span>
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
      <PeriodicTable 
        elements={allElements} 
        {maxC} 
        {maxR} 
        {elementMap} 
        on:showWiki={handleShowWiki}
        on:showOrbitAnimation={handleShowOrbitAnimation}
      />
    </div>
    
    {#if showWikiModal && selectedElement}
      <ElementModal element={selectedElement} on:close={closeWikiModal} />
    {/if}
    {#if showOrbitModal && orbitElement}
      <OrbitAnimationModal element={orbitElement} on:close={closeOrbitModal} />
    {/if}
  </main>

  <footer class="app-footer">
    <div class="footer-left"><FLogo size={32} /><span class="footer-copyright">&copy; Moussa El Najmi</span><span class="footer-version">{year} · {version}</span></div>
  </footer>
</div>

<style>
  .site-bg {
    min-height: 100vh;
    width: 100%;
    position: relative;
    background: linear-gradient(to bottom, #0a2342 0%, #193a6a 100%);
    overflow-x: hidden;
    box-sizing: border-box;
  }
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
  main {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 1em;
    max-width: 100vw;
    margin: 0 auto;
    overflow-x: auto;
    box-sizing: border-box;
  }
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
  }
  .app-header.scrolled {
    background: #111;
  }
  .header-left {
    display: flex;
    align-items: center;
    min-width: 40px;
    gap: 1.2em;
  }
  .app-header h1 {
    color: #fff;
    margin-bottom: 0;
    font-size: 2em;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-align: left;
    white-space: nowrap;
  }
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
  }
  .legend-title {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 0.7em;
    text-align: center;
    color: #fff;
  }
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
    font-weight: bold;
    font-size: 1.5em;
    color: #007bff;
    margin-top: 38px;
    margin-bottom: 0.1em;
    z-index: 2;
    letter-spacing: 0.01em;
  }
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
  .legend-orbital-svg {
    margin-top: 0.7em;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .legend-orbital-svg-inside {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.7em;
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
  }
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
  .footer-left {
    display: flex;
    align-items: center;
    gap: 1.2em;
  }
  .footer-copyright {
    margin-left: 0.7em;
    font-weight: 500;
    color: #fff;
  }
  .footer-version {
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
  .table-legend-container {
    position: relative;
    width: 100%;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }
  .legend-floating {
    position: absolute;
    left: 50%;
    top: -20px;
    transform: translateX(-50%);
    z-index: 10;
  }
  @media (max-width: 900px) {
    .legend-floating {
      position: static;
      left: unset;
      top: unset;
      transform: none;
      margin: 0 auto 0.5em auto;
      display: block;
    }
    .table-legend-container {
      min-height: 0;
    }
  }
</style> 
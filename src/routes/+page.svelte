<script>
  // Import necessary Svelte components and modules
  import PeriodicTable from '$lib/PeriodicTable.svelte';
  import ElementModal from '$lib/ElementModal.svelte';
  import SearchPanel from '$lib/components/SearchPanel.svelte';
  import elementsData from '$lib/data/PeriodicTableJSON.json';
  import OrbitAnimationModal from '$lib/OrbitAnimationModal.svelte';
  import FLogo from '$lib/FLogo.svelte';
  import { onMount } from 'svelte';
  import { initializeAPI, getAPIStatus } from '$lib/api';
  import { 
    initializeStores, 
    elementsStore, 
    filteredElementsStore,
    selectedElementsStore,
    userPreferencesStore,
    appStateStore,
    setActiveModal,
    closeModal
  } from '$lib/stores';
  import '../app.css';

  // State variables for managing data and UI visibility
  // Use stores for state management
  let selectedElement = null;
  let orbitElement = null;
  
  // Reactive statements for store subscriptions
  $: allElements = $elementsStore.length > 0 ? $elementsStore : elementsData.elements;
  $: filteredElements = $filteredElementsStore.length > 0 ? $filteredElementsStore : allElements;
  $: showWikiModal = $appStateStore.activeModal === 'element-modal';
  $: showOrbitModal = $appStateStore.activeModal === 'orbit-modal';

  // Handler function to show the Wiki modal
  // Takes an event detail containing the selected element
  function handleShowWiki(event) {
    selectedElement = event.detail;
    setActiveModal('element-modal');
  }

  // Handler function to show the Orbit animation modal
  // Takes an event detail containing the selected element
  function handleShowOrbitAnimation(event) {
    orbitElement = event.detail;
    setActiveModal('orbit-modal');
  }

  // Function to close the Wiki modal and reset the selected element
  function closeWikiModal() {
    closeModal();
    selectedElement = null;
  }

  // Function to close the Orbit animation modal and reset the orbit element
  function closeOrbitModal() {
    closeModal();
    orbitElement = null;
  }

  // Search event handlers
  function handleSearch(event) {
    console.log('Search performed:', event.detail);
    // The search is already handled by the stores, just log for debugging
  }

  function handleSearchClear() {
    console.log('Search cleared');
    // The clear is already handled by the stores
  }

  function handleFiltersReset() {
    console.log('Filters reset');
    // The reset is already handled by the stores
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

  // API status tracking
  let apiStatus = null;

  // Sticky header background on scroll
  let headerEl;
  onMount(async () => {
    // Initialize stores first
    try {
      await initializeStores();
      console.log('Stores initialized successfully');
    } catch (error) {
      console.error('Failed to initialize stores:', error);
    }

    // Initialize API layer
    try {
      await initializeAPI();
      apiStatus = getAPIStatus();
      console.log('API initialized:', apiStatus);
    } catch (error) {
      console.error('Failed to initialize API:', error);
    }

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

<!-- Svelte head component for adding elements to the document head -->
<svelte:head>
  <title>Advanced Periodic Table - Interactive Chemistry Explorer</title>
  <meta name="description" content="Explore the periodic table with advanced visualizations, quantum orbital animations, and comprehensive element data." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/global.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="site-container">
  <!-- Animated background with particles and grid -->
  <div class="background-layers">
    <div class="gradient-bg"></div>
    <div class="grid-overlay"></div>
    <div class="particle-field"></div>
  </div>
  
  <main class="main-content">
    <!-- Modern application header with glass morphism -->
    <header class="app-header glass" bind:this={headerEl}>
      <div class="header-content">
        <div class="header-left">
          <div class="logo-container">
            <FLogo size={48} />
          </div>
          <div class="header-text">
            <h1 class="header-title text-gradient">Advanced Periodic Table</h1>
            <p class="header-subtitle">Interactive Chemistry Explorer</p>
          </div>
        </div>
        <div class="header-right">
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-number">118</span>
              <span class="stat-label">Elements</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!-- Main content area with enhanced layout -->
    <div class="content-wrapper">
      <!-- Interactive legend with modern design -->
      <section class="legend-section glass-subtle">
        <div class="legend-header">
          <h2 class="legend-title">Element Guide</h2>
          <p class="legend-description">Understanding the periodic table layout</p>
        </div>
        <div class="legend-content">
          <div class="legend-cell-demo glass">
            <span class="demo-number">1</span>
            <button class="demo-info" aria-label="Element information">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M9 9h2v6h-2V9zm0-4h2v2H9V5z" fill="currentColor"/>
              </svg>
            </button>
            <span class="demo-symbol">H</span>
            <span class="demo-name">Hydrogen</span>
            <span class="demo-weight">1.008</span>
            <button class="demo-orbital">Orbitals</button>
          </div>
          <div class="orbital-types">
            <div class="orbital-type">
              <div class="orbital-visual s-orbital"></div>
              <span class="orbital-label">s</span>
            </div>
            <div class="orbital-type">
              <div class="orbital-visual p-orbital"></div>
              <span class="orbital-label">p</span>
            </div>
            <div class="orbital-type">
              <div class="orbital-visual d-orbital"></div>
              <span class="orbital-label">d</span>
            </div>
            <div class="orbital-type">
              <div class="orbital-visual f-orbital"></div>
              <span class="orbital-label">f</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced search and filtering panel -->
      <section class="search-section">
        <SearchPanel 
          on:search={handleSearch}
          on:clear={handleSearchClear}
          on:reset={handleFiltersReset}
        />
      </section>

      <!-- Enhanced periodic table container -->
      <div class="table-container">
        <PeriodicTable 
          elements={filteredElements} 
          allElements={allElements}
          {maxC} 
          {maxR} 
          {elementMap} 
          on:showWiki={handleShowWiki}
          on:showOrbitAnimation={handleShowOrbitAnimation}
        />
      </div>
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

    <!-- Modern footer with glass morphism -->
    <footer class="app-footer glass-subtle">
      <div class="footer-content">
        <div class="footer-left">
          <div class="footer-logo">
            <FLogo size={28} />
          </div>
          <div class="footer-info">
            <span class="footer-copyright">&copy; {year} Moussa El Najmi</span>
            <span class="footer-version">{version}</span>
          </div>
        </div>
        <div class="footer-right">
          <div class="footer-links">
            <span class="footer-link">Advanced Chemistry Explorer</span>
          </div>
        </div>
      </div>
    </footer>
  </main>
</div>

<style>
  /* Main site container with modern dark theme */
  .site-container {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /* Layered background system */
  .background-layers {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
  }

  .gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at top, hsl(var(--primary)) 0%, hsl(var(--background)) 50%),
                linear-gradient(135deg, hsl(var(--background)) 0%, hsl(217.2 32.6% 12%) 100%);
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      repeating-linear-gradient(to right, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px),
      repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px);
    background-size: 60px 60px;
    opacity: 0.5;
  }

  .particle-field {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.1), transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.05), transparent),
      radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.08), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.03), transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }

  /* Main content area */
  .main-content {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* Modern header with glass morphism */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    margin-bottom: var(--space-xl);
    border-radius: 0 0 var(--radius) var(--radius);
    transition: all var(--transition-normal);
  }

  .app-header.scrolled {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-xl);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .header-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .header-subtitle {
    font-size: var(--font-size-base);
    color: hsl(var(--muted-foreground));
    margin: 0;
    font-weight: 400;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .header-stats {
    display: flex;
    gap: var(--space-lg);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-number {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: hsl(var(--primary));
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Content wrapper */
  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
    padding: 0 var(--space-xl);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Enhanced legend section */
  .legend-section {
    border-radius: var(--radius);
    padding: var(--space-xl);
    margin-bottom: var(--space-lg);
  }

  .legend-header {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .legend-title {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin: 0 0 var(--space-sm) 0;
    color: hsl(var(--foreground));
  }

  .legend-description {
    font-size: var(--font-size-base);
    color: hsl(var(--muted-foreground));
    margin: 0;
  }

  .legend-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
  }

  /* Modern legend cell demo */
  .legend-cell-demo {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 180px;
    height: 220px;
    border-radius: var(--radius);
    padding: var(--space-md);
    transition: all var(--transition-normal);
  }

  .legend-cell-demo:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .demo-number {
    position: absolute;
    top: var(--space-sm);
    left: var(--space-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    color: hsl(var(--foreground));
    border-radius: calc(var(--radius) / 2);
    padding: var(--space-xs) var(--space-sm);
  }

  .demo-info {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--primary));
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .demo-info:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .demo-symbol {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: hsl(var(--primary));
    margin-top: var(--space-xl);
    margin-bottom: var(--space-sm);
  }

  .demo-name {
    font-size: var(--font-size-base);
    color: hsl(var(--foreground));
    background: rgba(255, 255, 255, 0.05);
    border-radius: calc(var(--radius) / 2);
    padding: var(--space-xs) var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .demo-weight {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    background: rgba(255, 255, 255, 0.05);
    border-radius: calc(var(--radius) / 2);
    padding: var(--space-xs) var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .demo-orbital {
    font-size: var(--font-size-sm);
    color: hsl(var(--primary));
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: calc(var(--radius) / 2);
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .demo-orbital:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.05);
  }

  /* Orbital types visualization */
  .orbital-types {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
    flex-wrap: wrap;
  }

  .orbital-type {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .orbital-visual {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid hsl(var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all var(--transition-fast);
  }

  .orbital-visual:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  .s-orbital {
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  }

  .p-orbital {
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, transparent 50%, rgba(59, 130, 246, 0.2) 100%);
    border-radius: 20px;
  }

  .d-orbital {
    background: conic-gradient(from 0deg, rgba(59, 130, 246, 0.2) 0deg, transparent 90deg, rgba(59, 130, 246, 0.2) 180deg, transparent 270deg);
    border-radius: 20%;
  }

  .f-orbital {
    background: radial-gradient(ellipse, rgba(59, 130, 246, 0.2) 0%, transparent 40%);
    border-radius: 30%;
  }

  .orbital-label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: hsl(var(--primary));
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Search section */
  .search-section {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-xl);
  }

  /* Table container */
  .table-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: var(--space-lg) 0;
  }

  /* Modern footer */
  .app-footer {
    margin-top: var(--space-2xl);
    border-radius: var(--radius) var(--radius) 0 0;
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-xl);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .footer-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs);
    border-radius: calc(var(--radius) / 2);
    background: rgba(255, 255, 255, 0.05);
  }

  .footer-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .footer-copyright {
    font-size: var(--font-size-sm);
    color: hsl(var(--foreground));
    font-weight: 500;
  }

  .footer-version {
    font-size: var(--font-size-xs);
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer-right {
    display: flex;
    align-items: center;
  }

  .footer-links {
    display: flex;
    gap: var(--space-lg);
  }

  .footer-link {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    font-style: italic;
  }

  /* Responsive design for mobile devices */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: var(--space-lg);
      padding: var(--space-md);
    }

    .header-left {
      flex-direction: column;
      text-align: center;
      gap: var(--space-md);
    }

    .header-title {
      font-size: var(--font-size-2xl);
    }

    .header-right {
      width: 100%;
      justify-content: center;
    }

    .content-wrapper {
      padding: 0 var(--space-md);
      gap: var(--space-lg);
    }

    .legend-section {
      padding: var(--space-lg);
    }

    .legend-content {
      gap: var(--space-lg);
    }

    .legend-cell-demo {
      width: 160px;
      height: 200px;
    }

    .orbital-types {
      gap: var(--space-md);
    }

    .footer-content {
      flex-direction: column;
      gap: var(--space-lg);
      padding: var(--space-md);
      text-align: center;
    }

    .footer-left {
      flex-direction: column;
      gap: var(--space-md);
    }
  }

  @media (max-width: 480px) {
    .header-title {
      font-size: var(--font-size-xl);
    }

    .header-subtitle {
      font-size: var(--font-size-sm);
    }

    .legend-cell-demo {
      width: 140px;
      height: 180px;
    }

    .orbital-visual {
      width: 32px;
      height: 32px;
    }

    .stat-item {
      padding: var(--space-xs) var(--space-sm);
    }

    .stat-number {
      font-size: var(--font-size-lg);
    }
  }

  /* Remove borders from periodic table components */
  :global(.periodic-table-grid),
  :global(.element-cell),
  :global(.empty-cell),
  :global(.placeholder),
  :global(.series-label) {
    border: none !important;
  }

  /* Enhance periodic table integration */
  :global(.periodic-table-grid) {
    background: transparent !important;
    padding: var(--space-lg) !important;
  }
</style> 
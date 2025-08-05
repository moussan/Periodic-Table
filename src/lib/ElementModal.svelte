<script>
  // Import necessary Svelte functions
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getElementExternalData } from '$lib/api';

  // Export a prop `element` which is expected to contain the element data to display.
  export let element;
  // Create a dispatcher to send custom events from this component.
  const dispatch = createEventDispatcher();

  // External data state
  let externalData = null;
  let isLoadingExternal = false;
  let externalError = null;
  let activeTab = 'overview';

  // Function to close the modal. It dispatches a custom 'close' event.
  function close() {
    dispatch('close');
  }

  // Function to handle keyboard events. Specifically listens for the 'Escape' key to close the modal.
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  // Function to load external data
  async function loadExternalData() {
    if (!element || isLoadingExternal) return;
    
    isLoadingExternal = true;
    externalError = null;
    
    try {
      console.log(`Loading external data for ${element.name}...`);
      const result = await getElementExternalData(element, {
        includeWikipedia: true,
        includePTable: true,
        timeout: 8000
      });
      
      if (result.success && result.data) {
        externalData = result.data;
        console.log(`External data loaded for ${element.name}:`, result);
      } else {
        externalError = result.errors.join(', ') || 'Failed to load external data';
        console.warn(`Failed to load external data for ${element.name}:`, result.errors);
      }
    } catch (error) {
      externalError = error.message;
      console.error(`Error loading external data for ${element.name}:`, error);
    } finally {
      isLoadingExternal = false;
    }
  }

  // Function to switch tabs
  function switchTab(tab) {
    activeTab = tab;
  }

  // Lifecycle function that runs after the component is first rendered to the DOM.
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    // Load external data when modal opens
    loadExternalData();
  });

  // Lifecycle function that runs before the component is destroyed.
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  // Define inline style for the iframe. This could potentially be dynamic later.
  let iframeStyle = "width: 100%; height: 100%; border: none;";
</script>

<!-- 
  The modal backdrop creates a dark overlay behind the modal content.
  It's a button to handle closing the modal when clicked outside the content, improving accessibility. 
-->
<button class="modal-backdrop" on:click={close} aria-label="Close modal" role="button" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-content" on:click|stopPropagation>
    <header class="modal-header">
      <div class="header-info">
        <h2 id="modal-title">{element.name} ({element.symbol})</h2>
        <div class="element-basic-info">
          <span class="atomic-number">#{element.number}</span>
          <span class="atomic-mass">{element.atomic_mass}</span>
          <span class="category">{element.category}</span>
        </div>
      </div>
      <button class="modal-close-button" on:click={close} aria-label="Close modal">&times;</button>
    </header>

    <!-- Tab Navigation -->
    <nav class="tab-nav">
      <button 
        class="tab-button" 
        class:active={activeTab === 'overview'}
        on:click={() => switchTab('overview')}
      >
        Overview
      </button>
      <button 
        class="tab-button" 
        class:active={activeTab === 'properties'}
        on:click={() => switchTab('properties')}
      >
        Properties
      </button>
      <button 
        class="tab-button" 
        class:active={activeTab === 'external'}
        on:click={() => switchTab('external')}
      >
        External Data
      </button>
      {#if element.source}
        <button 
          class="tab-button" 
          class:active={activeTab === 'wikipedia'}
          on:click={() => switchTab('wikipedia')}
        >
          Wikipedia
        </button>
      {/if}
    </nav>

    <div class="modal-body">
      {#if activeTab === 'overview'}
        <div class="tab-content">
          <div class="overview-grid">
            <div class="info-card">
              <h3>Basic Information</h3>
              <div class="info-row">
                <span class="label">Atomic Number:</span>
                <span class="value">{element.number}</span>
              </div>
              <div class="info-row">
                <span class="label">Symbol:</span>
                <span class="value">{element.symbol}</span>
              </div>
              <div class="info-row">
                <span class="label">Atomic Mass:</span>
                <span class="value">{element.atomic_mass} u</span>
              </div>
              <div class="info-row">
                <span class="label">Category:</span>
                <span class="value">{element.category}</span>
              </div>
              <div class="info-row">
                <span class="label">Period:</span>
                <span class="value">{element.period}</span>
              </div>
              <div class="info-row">
                <span class="label">Group:</span>
                <span class="value">{element.group}</span>
              </div>
            </div>

            <div class="info-card">
              <h3>Physical Properties</h3>
              {#if element.phase}
                <div class="info-row">
                  <span class="label">Phase:</span>
                  <span class="value">{element.phase}</span>
                </div>
              {/if}
              {#if element.density}
                <div class="info-row">
                  <span class="label">Density:</span>
                  <span class="value">{element.density} g/cm³</span>
                </div>
              {/if}
              {#if element.melt}
                <div class="info-row">
                  <span class="label">Melting Point:</span>
                  <span class="value">{element.melt} K</span>
                </div>
              {/if}
              {#if element.boil}
                <div class="info-row">
                  <span class="label">Boiling Point:</span>
                  <span class="value">{element.boil} K</span>
                </div>
              {/if}
            </div>

            <div class="info-card">
              <h3>Chemical Properties</h3>
              <div class="info-row">
                <span class="label">Electron Configuration:</span>
                <span class="value config">{element.electron_configuration}</span>
              </div>
              {#if element.electronegativity_pauling}
                <div class="info-row">
                  <span class="label">Electronegativity:</span>
                  <span class="value">{element.electronegativity_pauling}</span>
                </div>
              {/if}
              {#if element.ionization_energies && element.ionization_energies.length > 0}
                <div class="info-row">
                  <span class="label">1st Ionization Energy:</span>
                  <span class="value">{element.ionization_energies[0]} kJ/mol</span>
                </div>
              {/if}
            </div>

            {#if element.discovered_by}
              <div class="info-card">
                <h3>Discovery</h3>
                <div class="info-row">
                  <span class="label">Discovered by:</span>
                  <span class="value">{element.discovered_by}</span>
                </div>
              </div>
            {/if}
          </div>
        </div>

      {:else if activeTab === 'properties'}
        <div class="tab-content">
          <div class="properties-grid">
            {#if element.shells}
              <div class="info-card">
                <h3>Electron Shells</h3>
                <div class="shells-display">
                  {#each element.shells as electrons, index}
                    <div class="shell">
                      <span class="shell-label">Shell {index + 1}:</span>
                      <span class="shell-electrons">{electrons} electrons</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="info-card">
              <h3>Additional Properties</h3>
              {#if element.appearance}
                <div class="info-row">
                  <span class="label">Appearance:</span>
                  <span class="value">{element.appearance}</span>
                </div>
              {/if}
              {#if element.block}
                <div class="info-row">
                  <span class="label">Block:</span>
                  <span class="value">{element.block}-block</span>
                </div>
              {/if}
              {#if element.electron_affinity}
                <div class="info-row">
                  <span class="label">Electron Affinity:</span>
                  <span class="value">{element.electron_affinity} kJ/mol</span>
                </div>
              {/if}
            </div>
          </div>
        </div>

      {:else if activeTab === 'external'}
        <div class="tab-content">
          {#if isLoadingExternal}
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading external data...</p>
            </div>
          {:else if externalError}
            <div class="error-state">
              <p>Failed to load external data: {externalError}</p>
              <button on:click={loadExternalData} class="retry-button">Retry</button>
            </div>
          {:else if externalData}
            <div class="external-data">
              {#if externalData.wikipedia}
                <div class="info-card">
                  <h3>Wikipedia Information</h3>
                  <div class="wikipedia-content">
                    <h4>{externalData.wikipedia.title}</h4>
                    <p class="extract">{externalData.wikipedia.extract}</p>
                    {#if externalData.wikipedia.url}
                      <a href={externalData.wikipedia.url} target="_blank" rel="noopener noreferrer" class="external-link">
                        Read more on Wikipedia →
                      </a>
                    {/if}
                  </div>
                </div>
              {/if}

              {#if externalData.ptable}
                <div class="info-card">
                  <h3>Additional Data</h3>
                  {#if externalData.ptable.isotope_data && externalData.ptable.isotope_data.length > 0}
                    <div class="isotopes-section">
                      <h4>Common Isotopes</h4>
                      <div class="isotopes-list">
                        {#each externalData.ptable.isotope_data.slice(0, 3) as isotope}
                          <div class="isotope-item">
                            <span class="isotope-mass">{element.symbol}-{isotope.mass_number}</span>
                            {#if isotope.abundance}
                              <span class="isotope-abundance">{isotope.abundance.toFixed(1)}%</span>
                            {/if}
                            <span class="isotope-stability">{isotope.is_stable ? 'Stable' : 'Radioactive'}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  {#if externalData.ptable.compound_data && externalData.ptable.compound_data.length > 0}
                    <div class="compounds-section">
                      <h4>Common Compounds</h4>
                      <div class="compounds-list">
                        {#each externalData.ptable.compound_data.slice(0, 3) as compound}
                          <div class="compound-item">
                            <span class="compound-formula">{compound.formula}</span>
                            <span class="compound-name">{compound.name}</span>
                            <span class="compound-state">({compound.state})</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {:else}
            <div class="no-data-state">
              <p>No external data available for this element.</p>
            </div>
          {/if}
        </div>

      {:else if activeTab === 'wikipedia' && element.source}
        <div class="tab-content iframe-container">
          <iframe 
            src={element.source} 
            title={element.name + ' Wikipedia'}
            style={iframeStyle}
            sandbox="allow-scripts allow-same-origin allow-popups" 
            loading="lazy"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
      {/if}
    </div>
  </div>
</button>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    border: none;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .modal-content {
    background: linear-gradient(135deg, hsl(217.2 32.6% 17%) 0%, hsl(217.2 32.6% 12%) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    width: 90%;
    max-width: 1000px;
    height: 85%;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: white;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
  }

  .element-basic-info {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .atomic-number {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .atomic-mass {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .category {
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .modal-close-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s ease;
  }

  .modal-close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.05);
  }

  .tab-nav {
    display: flex;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 4px;
  }

  .tab-button {
    background: none;
    border: none;
    padding: 12px 16px;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s ease;
    position: relative;
  }

  .tab-button:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-button.active {
    color: #60a5fa;
    background: rgba(59, 130, 246, 0.1);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #60a5fa;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .tab-content {
    height: 100%;
  }

  .iframe-container {
    height: 100%;
    padding: 0;
  }

  .iframe-container iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }

  .overview-grid, .properties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
  }

  .info-card h3 {
    margin: 0 0 16px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #60a5fa;
  }

  .info-card h4 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .value {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
    text-align: right;
  }

  .value.config {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px 8px;
    border-radius: 4px;
  }

  .shells-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .shell-label {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .shell-electrons {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
  }

  .loading-state, .error-state, .no-data-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
    color: #94a3b8;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #60a5fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .retry-button {
    background: #60a5fa;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    margin-top: 12px;
    transition: background-color 0.2s ease;
  }

  .retry-button:hover {
    background: #3b82f6;
  }

  .external-data {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .wikipedia-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .extract {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e2e8f0;
    margin: 0;
  }

  .external-link {
    color: #60a5fa;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .external-link:hover {
    color: #93c5fd;
    text-decoration: underline;
  }

  .isotopes-section, .compounds-section {
    margin-top: 16px;
  }

  .isotopes-list, .compounds-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .isotope-item, .compound-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .isotope-mass, .compound-formula {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #60a5fa;
    font-size: 0.875rem;
  }

  .isotope-abundance {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .isotope-stability {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .compound-name {
    font-size: 0.875rem;
    color: white;
    flex: 1;
  }

  .compound-state {
    font-size: 0.75rem;
    color: #94a3b8;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      height: 90%;
      margin: 20px;
    }

    .modal-header {
      padding: 16px;
    }

    .modal-header h2 {
      font-size: 1.5rem;
    }

    .element-basic-info {
      flex-wrap: wrap;
      gap: 8px;
    }

    .modal-body {
      padding: 16px;
    }

    .overview-grid, .properties-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .tab-nav {
      padding: 0 16px;
      overflow-x: auto;
    }

    .tab-button {
      white-space: nowrap;
      padding: 10px 12px;
      font-size: 0.8rem;
    }

    .info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .value {
      text-align: left;
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      width: 100%;
      height: 100%;
      border-radius: 0;
      margin: 0;
    }

    .modal-header h2 {
      font-size: 1.25rem;
    }

    .info-card {
      padding: 16px;
    }
  }
</style> 
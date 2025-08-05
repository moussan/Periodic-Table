<script>
  // Import necessary Svelte functions
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getElementExternalData } from '$lib/api';
  import { Button } from '$lib/components/ui';
  import { Card } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui';

  // Export a prop `element` which is expected to contain the element data to display.
  export let element;
  // Create a dispatcher to send custom events from this component.
  const dispatch = createEventDispatcher();

  // External data state
  let externalData = null;
  let isLoadingExternal = false;
  let externalError = null;
  let activeTab = 'overview';
  let loadingProgress = 0;
  let loadingMessage = 'Initializing...';

  // Enhanced tab definitions with better organization and accessibility
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: '📋',
      description: 'Basic element information and key properties',
      shortcut: '1'
    },
    { 
      id: 'properties', 
      label: 'Properties', 
      icon: '⚛️',
      description: 'Detailed physical and chemical properties',
      shortcut: '2'
    },
    { 
      id: 'external', 
      label: 'External Data', 
      icon: '🌐',
      description: 'Information from Wikipedia and scientific databases',
      shortcut: '3'
    },
    { 
      id: 'isotopes', 
      label: 'Isotopes', 
      icon: '🔬',
      description: 'Isotope data and nuclear properties',
      shortcut: '4'
    },
    { 
      id: 'compounds', 
      label: 'Compounds', 
      icon: '🧪',
      description: 'Common compounds and chemical applications',
      shortcut: '5'
    }
  ];

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

  // Enhanced function to load external data with progress tracking
  async function loadExternalData() {
    if (!element || isLoadingExternal) return;
    
    isLoadingExternal = true;
    externalError = null;
    loadingProgress = 0;
    loadingMessage = 'Initializing data fetch...';
    
    try {
      console.log(`Loading external data for ${element.name}...`);
      
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        if (loadingProgress < 90) {
          loadingProgress += Math.random() * 15;
          if (loadingProgress < 30) {
            loadingMessage = 'Connecting to Wikipedia...';
          } else if (loadingProgress < 60) {
            loadingMessage = 'Fetching scientific data...';
          } else {
            loadingMessage = 'Processing information...';
          }
        }
      }, 200);
      
      const result = await getElementExternalData(element, {
        includeWikipedia: true,
        includePTable: true,
        timeout: 10000
      });
      
      clearInterval(progressInterval);
      loadingProgress = 100;
      loadingMessage = 'Complete!';
      
      if (result.success && result.data) {
        externalData = result.data;
        console.log(`External data loaded for ${element.name}:`, result);
        
        // Brief delay to show completion
        setTimeout(() => {
          loadingProgress = 0;
        }, 500);
      } else {
        externalError = result.errors.join(', ') || 'Failed to load external data';
        console.warn(`Failed to load external data for ${element.name}:`, result.errors);
      }
    } catch (error) {
      externalError = error.message;
      console.error(`Error loading external data for ${element.name}:`, error);
    } finally {
      setTimeout(() => {
        isLoadingExternal = false;
      }, 300);
    }
  }

  // Enhanced function to switch tabs with validation and accessibility
  function switchTab(tab) {
    if (tabs.find(t => t.id === tab)) {
      activeTab = tab;
      
      // Announce tab change for screen readers
      const tabInfo = tabs.find(t => t.id === tab);
      if (tabInfo) {
        announceToScreenReader(`Switched to ${tabInfo.label} tab: ${tabInfo.description}`);
      }
      
      // Focus management for keyboard users
      setTimeout(() => {
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
          tabContent.focus();
        }
      }, 100);
    }
  }

  // Function to announce changes to screen readers
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Enhanced keyboard handling with tab shortcuts
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
      return;
    }
    
    // Tab shortcuts (1-5 for different tabs)
    if (event.key >= '1' && event.key <= '5') {
      const tabIndex = parseInt(event.key) - 1;
      if (tabs[tabIndex]) {
        event.preventDefault();
        switchTab(tabs[tabIndex].id);
      }
    }
    
    // Arrow key navigation for tabs
    if (event.target.classList.contains('tab-button')) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        event.preventDefault();
        switchTab(tabs[currentIndex - 1].id);
      } else if (event.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
        event.preventDefault();
        switchTab(tabs[currentIndex + 1].id);
      }
    }
  }

  // Function to retry loading external data
  function retryLoadExternalData() {
    externalError = null;
    loadExternalData();
  }

  // Lifecycle function that runs after the component is first rendered to the DOM.
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    // Load external data when modal opens with slight delay for better UX
    setTimeout(() => {
      loadExternalData();
    }, 300);
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
        <div class="element-title-section">
          <h2 id="modal-title">{element.name}</h2>
          <div class="element-symbol-badge">{element.symbol}</div>
        </div>
        <div class="element-basic-info">
          <div class="info-chip atomic-number">
            <span class="chip-label">Atomic #</span>
            <span class="chip-value">{element.number}</span>
          </div>
          <div class="info-chip atomic-mass">
            <span class="chip-label">Mass</span>
            <span class="chip-value">{element.atomic_mass}</span>
          </div>
          <div class="info-chip category">
            <span class="chip-label">Category</span>
            <span class="chip-value">{element.category}</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button 
          class="action-button refresh-button" 
          on:click={retryLoadExternalData}
          aria-label="Refresh external data"
          title="Refresh external data"
          disabled={isLoadingExternal}
        >
          <span class="action-icon">🔄</span>
        </button>
        <button 
          class="modal-close-button" 
          on:click={close} 
          aria-label="Close modal"
          title="Close modal (Esc)"
        >
          <span class="close-icon">✕</span>
        </button>
      </div>
    </header>

    <!-- Enhanced Tab Navigation with accessibility -->
    <nav class="tab-nav" role="tablist" aria-label="Element information tabs">
      {#each tabs as tab, index}
        <button 
          class="tab-button" 
          class:active={activeTab === tab.id}
          on:click={() => switchTab(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls="tab-panel-{tab.id}"
          id="tab-{tab.id}"
          tabindex={activeTab === tab.id ? 0 : -1}
          title="{tab.description} (Press {tab.shortcut})"
        >
          <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
          <span class="tab-shortcut" aria-hidden="true">{tab.shortcut}</span>
        </button>
      {/each}
    </nav>

    <div class="modal-body">
      {#if activeTab === 'overview'}
        <div 
          class="tab-content" 
          role="tabpanel" 
          id="tab-panel-overview"
          aria-labelledby="tab-overview"
          tabindex="0"
        >
          <div class="overview-grid">
            <!-- Basic Information Card -->
            <Card class="info-card">
              <div class="card-header">
                <h3>Basic Information</h3>
                <Badge variant="secondary">{element.category}</Badge>
              </div>
              <div class="property-grid">
                <div class="property-item">
                  <span class="property-label">Atomic Number</span>
                  <span class="property-value highlight-primary">{element.number}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Symbol</span>
                  <span class="property-value highlight-secondary">{element.symbol}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Atomic Mass</span>
                  <span class="property-value">{element.atomic_mass} u</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Period</span>
                  <span class="property-value">{element.period}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Group</span>
                  <span class="property-value">{element.group}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Block</span>
                  <span class="property-value">{element.block}-block</span>
                </div>
              </div>
            </Card>

            <!-- Physical Properties Card -->
            <Card class="info-card">
              <div class="card-header">
                <h3>Physical Properties</h3>
                <Badge variant="outline">{element.phase || 'Unknown'}</Badge>
              </div>
              <div class="property-grid">
                {#if element.density}
                  <div class="property-item">
                    <span class="property-label">Density</span>
                    <span class="property-value">{element.density} g/cm³</span>
                  </div>
                {/if}
                {#if element.melt}
                  <div class="property-item">
                    <span class="property-label">Melting Point</span>
                    <span class="property-value">{element.melt} K</span>
                  </div>
                {/if}
                {#if element.boil}
                  <div class="property-item">
                    <span class="property-label">Boiling Point</span>
                    <span class="property-value">{element.boil} K</span>
                  </div>
                {/if}
                {#if element.appearance}
                  <div class="property-item full-width">
                    <span class="property-label">Appearance</span>
                    <span class="property-value">{element.appearance}</span>
                  </div>
                {/if}
              </div>
            </Card>

            <!-- Chemical Properties Card -->
            <Card class="info-card">
              <div class="card-header">
                <h3>Chemical Properties</h3>
              </div>
              <div class="property-grid">
                <div class="property-item full-width">
                  <span class="property-label">Electron Configuration</span>
                  <span class="property-value config">{element.electron_configuration}</span>
                </div>
                {#if element.electronegativity_pauling}
                  <div class="property-item">
                    <span class="property-label">Electronegativity</span>
                    <span class="property-value">{element.electronegativity_pauling}</span>
                  </div>
                {/if}
                {#if element.ionization_energies && element.ionization_energies.length > 0}
                  <div class="property-item">
                    <span class="property-label">1st Ionization Energy</span>
                    <span class="property-value">{element.ionization_energies[0]} kJ/mol</span>
                  </div>
                {/if}
                {#if element.electron_affinity}
                  <div class="property-item">
                    <span class="property-label">Electron Affinity</span>
                    <span class="property-value">{element.electron_affinity} kJ/mol</span>
                  </div>
                {/if}
              </div>
            </Card>

            <!-- Discovery Information Card -->
            {#if element.discovered_by}
              <Card class="info-card">
                <div class="card-header">
                  <h3>Discovery</h3>
                </div>
                <div class="property-grid">
                  <div class="property-item full-width">
                    <span class="property-label">Discovered by</span>
                    <span class="property-value">{element.discovered_by}</span>
                  </div>
                  {#if element.named_by}
                    <div class="property-item full-width">
                      <span class="property-label">Named by</span>
                      <span class="property-value">{element.named_by}</span>
                    </div>
                  {/if}
                </div>
              </Card>
            {/if}
          </div>
        </div>

      {:else if activeTab === 'properties'}
        <div 
          class="tab-content" 
          role="tabpanel" 
          id="tab-panel-properties"
          aria-labelledby="tab-properties"
          tabindex="0"
        >
          <div class="properties-grid">
            <!-- Electron Configuration Card -->
            {#if element.shells}
              <Card class="info-card">
                <div class="card-header">
                  <h3>Electron Configuration</h3>
                  <Badge variant="outline">Shells: {element.shells.length}</Badge>
                </div>
                <div class="electron-config-section">
                  <div class="config-display">
                    <span class="config-label">Configuration:</span>
                    <span class="config-value">{element.electron_configuration}</span>
                  </div>
                  {#if element.electron_configuration_semantic}
                    <div class="config-display">
                      <span class="config-label">Semantic:</span>
                      <span class="config-value">{element.electron_configuration_semantic}</span>
                    </div>
                  {/if}
                </div>
                <div class="shells-display">
                  <h4>Electron Shells</h4>
                  <div class="shells-grid">
                    {#each element.shells as electrons, index}
                      <div class="shell-item">
                        <div class="shell-number">{index + 1}</div>
                        <div class="shell-electrons">{electrons}e⁻</div>
                      </div>
                    {/each}
                  </div>
                </div>
              </Card>
            {/if}

            <!-- Atomic Properties Card -->
            <Card class="info-card">
              <div class="card-header">
                <h3>Atomic Properties</h3>
              </div>
              <div class="property-grid">
                <div class="property-item">
                  <span class="property-label">Atomic Radius</span>
                  <span class="property-value">{element.atomic_radius || 'N/A'}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Covalent Radius</span>
                  <span class="property-value">{element.covalent_radius || 'N/A'}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Van der Waals Radius</span>
                  <span class="property-value">{element.van_der_waals_radius || 'N/A'}</span>
                </div>
                <div class="property-item">
                  <span class="property-label">Atomic Volume</span>
                  <span class="property-value">{element.atomic_volume || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <!-- Ionization Energies Card -->
            {#if element.ionization_energies && element.ionization_energies.length > 0}
              <Card class="info-card">
                <div class="card-header">
                  <h3>Ionization Energies</h3>
                  <Badge variant="secondary">{element.ionization_energies.length} levels</Badge>
                </div>
                <div class="ionization-grid">
                  {#each element.ionization_energies.slice(0, 6) as energy, index}
                    <div class="ionization-item">
                      <span class="ionization-level">{index + 1}st</span>
                      <span class="ionization-value">{energy} kJ/mol</span>
                    </div>
                  {/each}
                </div>
              </Card>
            {/if}

            <!-- Thermodynamic Properties Card -->
            <Card class="info-card">
              <div class="card-header">
                <h3>Thermodynamic Properties</h3>
              </div>
              <div class="property-grid">
                {#if element.molar_heat}
                  <div class="property-item">
                    <span class="property-label">Molar Heat Capacity</span>
                    <span class="property-value">{element.molar_heat} J/(mol·K)</span>
                  </div>
                {/if}
                {#if element.heat_of_fusion}
                  <div class="property-item">
                    <span class="property-label">Heat of Fusion</span>
                    <span class="property-value">{element.heat_of_fusion} kJ/mol</span>
                  </div>
                {/if}
                {#if element.heat_of_vaporization}
                  <div class="property-item">
                    <span class="property-label">Heat of Vaporization</span>
                    <span class="property-value">{element.heat_of_vaporization} kJ/mol</span>
                  </div>
                {/if}
                {#if element.thermal_conductivity}
                  <div class="property-item">
                    <span class="property-label">Thermal Conductivity</span>
                    <span class="property-value">{element.thermal_conductivity} W/(m·K)</span>
                  </div>
                {/if}
              </div>
            </Card>
          </div>
        </div>

      {:else if activeTab === 'external'}
        <div 
          class="tab-content" 
          role="tabpanel" 
          id="tab-panel-external"
          aria-labelledby="tab-external"
          tabindex="0"
        >
          {#if isLoadingExternal}
            <div class="loading-state" role="status" aria-live="polite">
              <div class="loading-animation">
                <div class="loading-spinner">
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                </div>
                <div class="loading-particles">
                  <div class="particle"></div>
                  <div class="particle"></div>
                  <div class="particle"></div>
                  <div class="particle"></div>
                </div>
              </div>
              <div class="loading-content">
                <h3>Loading External Data</h3>
                <p class="loading-message">{loadingMessage}</p>
                <div class="loading-progress">
                  <div class="progress-track">
                    <div 
                      class="progress-bar" 
                      style="width: {loadingProgress}%"
                      role="progressbar"
                      aria-valuenow={loadingProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label="Loading progress"
                    ></div>
                  </div>
                  <span class="progress-text">{Math.round(loadingProgress)}%</span>
                </div>
                <div class="loading-sources">
                  <div class="source-indicator">
                    <span class="source-icon">📖</span>
                    <span class="source-name">Wikipedia</span>
                  </div>
                  <div class="source-indicator">
                    <span class="source-icon">🔬</span>
                    <span class="source-name">Scientific Data</span>
                  </div>
                </div>
              </div>
            </div>
          {:else if externalError}
            <div class="error-state" role="alert">
              <div class="error-visual">
                <div class="error-icon">⚠️</div>
                <div class="error-pulse"></div>
              </div>
              <div class="error-content">
                <h3>Unable to Load External Data</h3>
                <p class="error-message">{externalError}</p>
                <div class="error-details">
                  <p class="error-suggestion">
                    This might be due to network connectivity issues or temporary service unavailability.
                  </p>
                </div>
                <div class="error-actions">
                  <Button on:click={retryLoadExternalData} variant="outline" class="retry-button">
                    <span class="retry-icon">🔄</span>
                    Try Again
                  </Button>
                  <Button on:click={() => switchTab('overview')} variant="ghost" class="fallback-button">
                    <span class="fallback-icon">📋</span>
                    View Basic Info
                  </Button>
                </div>
              </div>
            </div>
          {:else if externalData}
            <div class="external-data-grid">
              {#if externalData.wikipedia}
                <Card class="wikipedia-card">
                  <div class="card-header">
                    <h3>Wikipedia Information</h3>
                    <Badge variant="secondary">Verified Source</Badge>
                  </div>
                  <div class="wikipedia-content">
                    <h4 class="wikipedia-title">{externalData.wikipedia.title}</h4>
                    {#if externalData.wikipedia.thumbnail}
                      <div class="wikipedia-image">
                        <img 
                          src={externalData.wikipedia.thumbnail.source} 
                          alt={element.name}
                          loading="lazy"
                        />
                      </div>
                    {/if}
                    <p class="wikipedia-extract">{externalData.wikipedia.extract}</p>
                    <div class="wikipedia-actions">
                      <a 
                        href={externalData.wikipedia.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="external-link"
                      >
                        <span class="link-icon">🔗</span>
                        Read full article on Wikipedia
                      </a>
                    </div>
                  </div>
                </Card>
              {/if}

              {#if externalData.ptable}
                <Card class="ptable-card">
                  <div class="card-header">
                    <h3>Additional Scientific Data</h3>
                    <Badge variant="outline">PTable.com</Badge>
                  </div>
                  <div class="ptable-content">
                    {#if externalData.ptable.additional_properties}
                      <div class="additional-properties">
                        <h4>Extended Properties</h4>
                        <div class="properties-list">
                          {#each Object.entries(externalData.ptable.additional_properties) as [key, value]}
                            <div class="property-item">
                              <span class="property-label">{key.replace(/_/g, ' ')}</span>
                              <span class="property-value">{value}</span>
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                </Card>
              {/if}

              <!-- Data Sources Attribution -->
              <Card class="sources-card">
                <div class="card-header">
                  <h3>Data Sources</h3>
                </div>
                <div class="sources-list">
                  {#if externalData.wikipedia}
                    <div class="source-item">
                      <span class="source-name">Wikipedia</span>
                      <span class="source-description">General information and descriptions</span>
                      <a href={externalData.wikipedia.url} target="_blank" rel="noopener noreferrer" class="source-link">
                        Visit Source
                      </a>
                    </div>
                  {/if}
                  {#if externalData.ptable}
                    <div class="source-item">
                      <span class="source-name">PTable.com</span>
                      <span class="source-description">Scientific properties and data</span>
                      <a href="https://ptable.com" target="_blank" rel="noopener noreferrer" class="source-link">
                        Visit Source
                      </a>
                    </div>
                  {/if}
                </div>
              </Card>
            </div>
          {:else}
            <div class="no-data-state">
              <div class="no-data-icon">📡</div>
              <h3>No External Data Available</h3>
              <p>External data sources are not available for this element at the moment.</p>
              <Button on:click={loadExternalData} variant="outline">
                Try Loading Again
              </Button>
            </div>
          {/if}
        </div>

      {:else if activeTab === 'isotopes'}
        <div 
          class="tab-content" 
          role="tabpanel" 
          id="tab-panel-isotopes"
          aria-labelledby="tab-isotopes"
          tabindex="0"
        >
          {#if externalData?.ptable?.isotope_data && externalData.ptable.isotope_data.length > 0}
            <div class="isotopes-grid">
              <Card class="isotopes-overview">
                <div class="card-header">
                  <h3>Isotope Overview</h3>
                  <Badge variant="secondary">{externalData.ptable.isotope_data.length} isotopes</Badge>
                </div>
                <div class="isotope-stats">
                  <div class="stat-item">
                    <span class="stat-label">Stable Isotopes</span>
                    <span class="stat-value">
                      {externalData.ptable.isotope_data.filter(i => i.is_stable).length}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Radioactive Isotopes</span>
                    <span class="stat-value">
                      {externalData.ptable.isotope_data.filter(i => !i.is_stable).length}
                    </span>
                  </div>
                </div>
              </Card>

              <Card class="isotopes-list-card">
                <div class="card-header">
                  <h3>All Isotopes</h3>
                </div>
                <div class="isotopes-table">
                  <div class="isotope-header">
                    <span>Isotope</span>
                    <span>Mass</span>
                    <span>Abundance</span>
                    <span>Half-life</span>
                    <span>Status</span>
                  </div>
                  {#each externalData.ptable.isotope_data as isotope}
                    <div class="isotope-row">
                      <span class="isotope-symbol">{element.symbol}-{isotope.mass_number}</span>
                      <span class="isotope-mass">{isotope.atomic_mass.toFixed(6)} u</span>
                      <span class="isotope-abundance">
                        {#if isotope.abundance}
                          {isotope.abundance.toFixed(2)}%
                        {:else}
                          Trace
                        {/if}
                      </span>
                      <span class="isotope-halflife">
                        {isotope.half_life || 'N/A'}
                      </span>
                      <Badge variant={isotope.is_stable ? 'default' : 'destructive'}>
                        {isotope.is_stable ? 'Stable' : 'Radioactive'}
                      </Badge>
                    </div>
                  {/each}
                </div>
              </Card>
            </div>
          {:else}
            <div class="no-data-state">
              <div class="no-data-icon">🔬</div>
              <h3>No Isotope Data Available</h3>
              <p>Isotope information is not available for this element.</p>
              {#if !externalData}
                <Button on:click={loadExternalData} variant="outline">
                  Load External Data
                </Button>
              {/if}
            </div>
          {/if}
        </div>

      {:else if activeTab === 'compounds'}
        <div 
          class="tab-content" 
          role="tabpanel" 
          id="tab-panel-compounds"
          aria-labelledby="tab-compounds"
          tabindex="0"
        >
          {#if externalData?.ptable?.compound_data && externalData.ptable.compound_data.length > 0}
            <div class="compounds-grid">
              <Card class="compounds-overview">
                <div class="card-header">
                  <h3>Common Compounds</h3>
                  <Badge variant="secondary">{externalData.ptable.compound_data.length} compounds</Badge>
                </div>
                <div class="compound-categories">
                  {#each [...new Set(externalData.ptable.compound_data.map(c => c.state))] as state}
                    <Badge variant="outline">{state}</Badge>
                  {/each}
                </div>
              </Card>

              <div class="compounds-list">
                {#each externalData.ptable.compound_data as compound}
                  <Card class="compound-card">
                    <div class="compound-header">
                      <h4 class="compound-formula">{compound.formula}</h4>
                      <Badge variant="outline">{compound.state}</Badge>
                    </div>
                    <div class="compound-details">
                      <div class="compound-name">{compound.name}</div>
                      {#if compound.common_name}
                        <div class="compound-common-name">({compound.common_name})</div>
                      {/if}
                      <div class="compound-weight">
                        Molecular Weight: {compound.molecular_weight} g/mol
                      </div>
                      {#if compound.uses && compound.uses.length > 0}
                        <div class="compound-uses">
                          <span class="uses-label">Uses:</span>
                          <div class="uses-list">
                            {#each compound.uses as use}
                              <Badge variant="secondary">{use}</Badge>
                            {/each}
                          </div>
                        </div>
                      {/if}
                      {#if compound.hazards && compound.hazards.length > 0}
                        <div class="compound-hazards">
                          <span class="hazards-label">⚠️ Hazards:</span>
                          <div class="hazards-list">
                            {#each compound.hazards as hazard}
                              <Badge variant="destructive">{hazard}</Badge>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </div>
                  </Card>
                {/each}
              </div>
            </div>
          {:else}
            <div class="no-data-state">
              <div class="no-data-icon">🧪</div>
              <h3>No Compound Data Available</h3>
              <p>Compound information is not available for this element.</p>
              {#if !externalData}
                <Button on:click={loadExternalData} variant="outline">
                  Load External Data
                </Button>
              {/if}
            </div>
          {/if}
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
    padding: 28px 28px 20px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(10px);
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }

  .element-title-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 2.25rem;
    font-weight: 800;
    color: white;
    line-height: 1.1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .element-symbol-badge {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #60a5fa;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .element-basic-info {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .info-chip {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    min-width: 80px;
  }

  .info-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .chip-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .chip-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
  }

  .atomic-number .chip-value {
    color: #60a5fa;
  }

  .atomic-mass .chip-value {
    color: #4ade80;
  }

  .category .chip-value {
    color: #c084fc;
    text-transform: capitalize;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .action-button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .refresh-button:hover:not(:disabled) {
    border-color: rgba(34, 197, 94, 0.4);
    color: #4ade80;
  }

  .modal-close-button {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #f87171;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .modal-close-button:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }

  .close-icon {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .tab-nav {
    display: flex;
    padding: 0 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    gap: 4px;
    overflow-x: auto;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(5px);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tab-nav::-webkit-scrollbar {
    display: none;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tab-nav::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    background: transparent;
    border: none;
    padding: 16px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 12px 12px 0 0;
    white-space: nowrap;
    position: relative;
    backdrop-filter: blur(10px);
    border: 1px solid transparent;
    border-bottom: none;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .tab-button:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  .tab-button.active {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
    color: white;
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #60a5fa, #a855f7, #ec4899);
    border-radius: 2px;
  }

  .tab-icon {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }

  .tab-button:hover .tab-icon {
    transform: scale(1.1);
  }

  .tab-label {
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .tab-shortcut {
    background: rgba(255, 255, 255, 0.1);
    color: #64748b;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    transition: all 0.3s ease;
  }

  .tab-button.active .tab-shortcut {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
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
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .info-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #60a5fa;
  }

  .card-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .property-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 20px;
  }

  .property-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .property-item:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  .property-item.full-width {
    grid-column: 1 / -1;
  }

  .property-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .property-value {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
  }

  .property-value.highlight-primary {
    color: #60a5fa;
    font-size: 1rem;
  }

  .property-value.highlight-secondary {
    color: #4ade80;
    font-size: 1rem;
  }

  .property-value.config {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
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

  .electron-config-section {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .config-display {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .config-label {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
    min-width: 100px;
  }

  .config-value {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: white;
    background: rgba(0, 0, 0, 0.3);
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .shells-display {
    padding: 20px;
  }

  .shells-display h4 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .shells-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .shell-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    min-width: 60px;
  }

  .shell-number {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .shell-electrons {
    font-size: 0.875rem;
    color: #60a5fa;
    font-weight: 600;
  }

  .ionization-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    padding: 20px;
  }

  .ionization-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 8px;
  }

  .ionization-level {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .ionization-value {
    font-size: 0.875rem;
    color: #c084fc;
    font-weight: 600;
    text-align: center;
  }

  .loading-state, .error-state, .no-data-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 350px;
    text-align: center;
    color: #94a3b8;
    padding: 48px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
    border-radius: 16px;
    margin: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .loading-animation {
    position: relative;
    margin-bottom: 32px;
  }

  .loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-radius: 50%;
    animation: spin 2s linear infinite;
  }

  .spinner-ring:nth-child(1) {
    border-top-color: #60a5fa;
    animation-delay: 0s;
    animation-duration: 1.5s;
  }

  .spinner-ring:nth-child(2) {
    border-right-color: #a855f7;
    animation-delay: 0.2s;
    animation-duration: 2s;
  }

  .spinner-ring:nth-child(3) {
    border-bottom-color: #ec4899;
    animation-delay: 0.4s;
    animation-duration: 2.5s;
  }

  .loading-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
  }

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: linear-gradient(45deg, #60a5fa, #a855f7);
    border-radius: 50%;
    animation: float 3s ease-in-out infinite;
  }

  .particle:nth-child(1) {
    top: 20%;
    left: 20%;
    animation-delay: 0s;
  }

  .particle:nth-child(2) {
    top: 20%;
    right: 20%;
    animation-delay: 0.5s;
  }

  .particle:nth-child(3) {
    bottom: 20%;
    left: 20%;
    animation-delay: 1s;
  }

  .particle:nth-child(4) {
    bottom: 20%;
    right: 20%;
    animation-delay: 1.5s;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes float {
    0%, 100% { 
      transform: translateY(0px) scale(1);
      opacity: 0.7;
    }
    50% { 
      transform: translateY(-20px) scale(1.2);
      opacity: 1;
    }
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .loading-state h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .loading-message {
    font-size: 1rem;
    color: #cbd5e1;
    margin: 0;
    font-weight: 500;
  }

  .loading-progress {
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #60a5fa, #a855f7, #ec4899);
    border-radius: 3px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .progress-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #60a5fa;
    font-family: 'JetBrains Mono', monospace;
  }

  .loading-sources {
    display: flex;
    gap: 24px;
    margin-top: 16px;
  }

  .source-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .source-icon {
    font-size: 1.5rem;
  }

  .source-name {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .error-state, .no-data-state {
    gap: 20px;
  }

  .error-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-icon, .no-data-icon {
    font-size: 4rem;
    position: relative;
    z-index: 2;
  }

  .error-pulse {
    position: absolute;
    width: 80px;
    height: 80px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.5;
    }
    100% {
      transform: scale(0.8);
      opacity: 1;
    }
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 500px;
  }

  .error-state h3, .no-data-state h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .error-message {
    margin: 0;
    font-size: 1rem;
    color: #fca5a5;
    text-align: center;
    line-height: 1.5;
  }

  .error-details {
    margin-top: 8px;
  }

  .error-suggestion {
    margin: 0;
    font-size: 0.875rem;
    color: #cbd5e1;
    text-align: center;
    line-height: 1.4;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .retry-button, .fallback-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
  }

  .fallback-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  }

  .retry-icon, .fallback-icon {
    font-size: 1rem;
  }

  /* Screen reader only class for accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .external-data-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .wikipedia-card, .ptable-card, .sources-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .wikipedia-content, .ptable-content {
    padding: 20px;
  }

  .wikipedia-title {
    margin: 0 0 16px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
  }

  .wikipedia-image {
    float: right;
    margin: 0 0 16px 16px;
    max-width: 200px;
  }

  .wikipedia-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .wikipedia-extract {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e2e8f0;
    margin: 0 0 16px 0;
    text-align: justify;
  }

  .wikipedia-actions {
    display: flex;
    justify-content: flex-start;
  }

  .external-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #60a5fa;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 8px 16px;
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .external-link:hover {
    color: #93c5fd;
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.5);
  }

  .link-icon {
    font-size: 0.875rem;
  }

  .additional-properties {
    margin-bottom: 20px;
  }

  .additional-properties h4 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .properties-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .sources-list {
    padding: 20px;
  }

  .source-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .source-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #60a5fa;
  }

  .source-description {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .source-link {
    font-size: 0.75rem;
    color: #60a5fa;
    text-decoration: none;
    margin-top: 4px;
  }

  .source-link:hover {
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
/* Isotopes Tab Styles */
  .isotopes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .isotopes-overview {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .isotope-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    padding: 20px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    color: #60a5fa;
    font-weight: 700;
  }

  .isotopes-list-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .isotopes-table {
    padding: 20px;
  }

  .isotope-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .isotope-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    margin-bottom: 8px;
    transition: background-color 0.2s ease;
  }

  .isotope-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .isotope-symbol {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #60a5fa;
    font-size: 0.875rem;
  }

  .isotope-mass {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: white;
  }

  .isotope-abundance {
    font-size: 0.875rem;
    color: #4ade80;
    font-weight: 500;
  }

  .isotope-halflife {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Compounds Tab Styles */
  .compounds-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .compounds-overview {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .compound-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 20px;
  }

  .compounds-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .compound-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .compound-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .compound-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .compound-formula {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 1.125rem;
    font-weight: 700;
    color: #60a5fa;
  }

  .compound-details {
    padding: 20px;
  }

  .compound-name {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
  }

  .compound-common-name {
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 8px;
  }

  .compound-weight {
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  .compound-uses, .compound-hazards {
    margin-bottom: 12px;
  }

  .uses-label, .hazards-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    display: block;
    margin-bottom: 8px;
  }

  .uses-list, .hazards-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* Responsive Design Enhancements */
  @media (max-width: 1024px) {
    .external-data-grid {
      grid-template-columns: 1fr;
    }
    
    .isotope-header, .isotope-row {
      grid-template-columns: 1fr 1fr 1fr;
      font-size: 0.75rem;
    }
    
    .isotope-header span:nth-child(4),
    .isotope-header span:nth-child(5),
    .isotope-row span:nth-child(4),
    .isotope-row span:nth-child(5) {
      display: none;
    }
  }
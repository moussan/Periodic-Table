<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui';
  import { Input } from '$lib/components/ui';
  import { 
    filterStore, 
    toggleCategory, 
    togglePeriod, 
    toggleGroup, 
    toggleBlock, 
    togglePhase,
    updatePropertyRange,
    resetFilters,
    activeFiltersCount,
    filterSummary,
    filterPresets,
    applyFilterPreset
  } from '$lib/stores/filters';
  import FilterPresetManager from './FilterPresetManager.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { 
    elementCategoriesStore,
    availablePeriodsStore,
    availableGroupsStore,
    availableBlocksStore,
    availablePhasesStore
  } from '$lib/stores/elements';

  const dispatch = createEventDispatcher();

  // Component props
  export let isOpen = false;
  export let showPresets = true;

  // Local state for preset manager
  let showPresetManager = false;
  let showClearConfirm = false;

  // Local state for property ranges
  let propertyRanges = {
    atomic_mass: { min: '', max: '', enabled: false },
    melting_point: { min: '', max: '', enabled: false },
    boiling_point: { min: '', max: '', enabled: false },
    density: { min: '', max: '', enabled: false },
    electronegativity: { min: '', max: '', enabled: false },
    ionization_energy: { min: '', max: '', enabled: false }
  };

  // Reactive statements
  $: hasActiveFilters = $activeFiltersCount > 0;

  // Property range configurations
  const propertyConfigs = {
    atomic_mass: { label: 'Atomic Mass', unit: 'u', step: 0.1, min: 0, max: 300 },
    melting_point: { label: 'Melting Point', unit: 'K', step: 1, min: 0, max: 4000 },
    boiling_point: { label: 'Boiling Point', unit: 'K', step: 1, min: 0, max: 6000 },
    density: { label: 'Density', unit: 'g/cm³', step: 0.01, min: 0, max: 25 },
    electronegativity: { label: 'Electronegativity', unit: '', step: 0.01, min: 0, max: 4 },
    ionization_energy: { label: 'Ionization Energy', unit: 'kJ/mol', step: 1, min: 0, max: 2500 }
  };

  // Event handlers
  function handleCategoryToggle(category: string) {
    toggleCategory(category);
    dispatch('filterChange', { type: 'category', value: category });
  }

  function handlePeriodToggle(period: number) {
    togglePeriod(period);
    dispatch('filterChange', { type: 'period', value: period });
  }

  function handleGroupToggle(group: number) {
    toggleGroup(group);
    dispatch('filterChange', { type: 'group', value: group });
  }

  function handleBlockToggle(block: string) {
    toggleBlock(block);
    dispatch('filterChange', { type: 'block', value: block });
  }

  function handlePhaseToggle(phase: string) {
    togglePhase(phase);
    dispatch('filterChange', { type: 'phase', value: phase });
  }

  function handlePropertyRangeToggle(property: string) {
    const range = propertyRanges[property];
    range.enabled = !range.enabled;
    
    if (range.enabled && range.min && range.max) {
      updatePropertyRange(property, [parseFloat(range.min), parseFloat(range.max)]);
    } else {
      updatePropertyRange(property, null);
    }
    
    dispatch('filterChange', { type: 'propertyRange', property, enabled: range.enabled });
  }

  function handlePropertyRangeChange(property: string) {
    const range = propertyRanges[property];
    
    if (range.enabled && range.min && range.max) {
      const min = parseFloat(range.min);
      const max = parseFloat(range.max);
      
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        updatePropertyRange(property, [min, max]);
        dispatch('filterChange', { type: 'propertyRange', property, range: [min, max] });
      }
    }
  }

  function handleResetFilters() {
    if (hasActiveFilters) {
      showClearConfirm = true;
    }
  }

  function confirmResetFilters() {
    resetFilters();
    // Reset local property ranges
    Object.keys(propertyRanges).forEach(key => {
      propertyRanges[key] = { min: '', max: '', enabled: false };
    });
    dispatch('reset');
    showClearConfirm = false;
  }

  function handlePresetApply(preset: any) {
    applyFilterPreset(preset);
    dispatch('presetApply', preset);
  }

  function handlePresetManagerToggle() {
    showPresetManager = !showPresetManager;
  }

  function handlePresetSaved(event: any) {
    console.log('Preset saved:', event.detail);
    dispatch('presetSaved', event.detail);
  }

  function handlePresetDeleted(event: any) {
    console.log('Preset deleted:', event.detail);
    dispatch('presetDeleted', event.detail);
  }

  function togglePanel() {
    isOpen = !isOpen;
    dispatch('toggle', { isOpen });
  }

  // Initialize property ranges from store
  $: {
    Object.entries($filterStore.propertyRanges).forEach(([key, range]) => {
      if (range && propertyRanges[key]) {
        propertyRanges[key] = {
          min: range[0].toString(),
          max: range[1].toString(),
          enabled: true
        };
      }
    });
  }
</script>

<div class="filter-panel">
  <!-- Filter toggle button -->
  <div class="filter-header">
    <Button
      variant="outline"
      class="filter-toggle"
      on:click={togglePanel}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      Advanced Filters
      {#if hasActiveFilters}
        <Badge variant="secondary" class="filter-count">
          {$activeFiltersCount}
        </Badge>
      {/if}
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        class="chevron"
        class:rotated={isOpen}
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </Button>

    {#if hasActiveFilters}
      <Button
        variant="ghost"
        size="sm"
        class="reset-button"
        on:click={handleResetFilters}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
        Clear All
      </Button>
    {/if}
  </div>

  <!-- Active filters summary -->
  {#if hasActiveFilters && !isOpen}
    <div class="active-filters-summary">
      <div class="summary-chips">
        {#each $filterSummary as summary}
          <Badge variant="secondary" class="summary-chip">
            {summary}
          </Badge>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Filter panel content -->
  {#if isOpen}
    <div class="filter-content glass-subtle">
      <!-- Filter presets -->
      {#if showPresets}
        <div class="filter-section">
          <div class="presets-header">
            <h3 class="section-title">Quick Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              class="manage-presets-button"
              on:click={handlePresetManagerToggle}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Manage
            </Button>
          </div>
          <div class="preset-grid">
            {#each $filterPresets as preset}
              <Button
                variant="outline"
                size="sm"
                class="preset-button"
                on:click={() => handlePresetApply(preset)}
              >
                {preset.name}
              </Button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Element categories -->
      <div class="filter-section">
        <h3 class="section-title">Categories</h3>
        <div class="filter-chips">
          {#each $elementCategoriesStore as category}
            <button
              class="filter-chip"
              class:active={$filterStore.categories.includes(category)}
              on:click={() => handleCategoryToggle(category)}
            >
              <span class="chip-label">{category}</span>
              {#if $filterStore.categories.includes(category)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Periods -->
      <div class="filter-section">
        <h3 class="section-title">Periods</h3>
        <div class="filter-chips">
          {#each $availablePeriodsStore as period}
            <button
              class="filter-chip period-chip"
              class:active={$filterStore.periods.includes(period)}
              on:click={() => handlePeriodToggle(period)}
            >
              <span class="chip-label">Period {period}</span>
              {#if $filterStore.periods.includes(period)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Groups -->
      <div class="filter-section">
        <h3 class="section-title">Groups</h3>
        <div class="filter-chips">
          {#each $availableGroupsStore as group}
            <button
              class="filter-chip group-chip"
              class:active={$filterStore.groups.includes(group)}
              on:click={() => handleGroupToggle(group)}
            >
              <span class="chip-label">Group {group}</span>
              {#if $filterStore.groups.includes(group)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Blocks -->
      <div class="filter-section">
        <h3 class="section-title">Blocks</h3>
        <div class="filter-chips">
          {#each $availableBlocksStore as block}
            <button
              class="filter-chip block-chip"
              class:active={$filterStore.blocks.includes(block)}
              on:click={() => handleBlockToggle(block)}
            >
              <span class="chip-label">{block}-block</span>
              {#if $filterStore.blocks.includes(block)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Phases -->
      <div class="filter-section">
        <h3 class="section-title">Phases</h3>
        <div class="filter-chips">
          {#each $availablePhasesStore as phase}
            <button
              class="filter-chip phase-chip"
              class:active={$filterStore.phases.includes(phase)}
              on:click={() => handlePhaseToggle(phase)}
            >
              <span class="chip-label">{phase}</span>
              {#if $filterStore.phases.includes(phase)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Property ranges -->
      <div class="filter-section">
        <h3 class="section-title">Property Ranges</h3>
        <div class="property-ranges">
          {#each Object.entries(propertyConfigs) as [property, config]}
            <div class="property-range">
              <div class="property-header">
                <label class="property-label">
                  <input
                    type="checkbox"
                    bind:checked={propertyRanges[property].enabled}
                    on:change={() => handlePropertyRangeToggle(property)}
                  />
                  <span>{config.label}</span>
                  {#if config.unit}
                    <span class="unit">({config.unit})</span>
                  {/if}
                </label>
              </div>
              
              {#if propertyRanges[property].enabled}
                <div class="range-inputs">
                  <Input
                    type="number"
                    placeholder="Min"
                    bind:value={propertyRanges[property].min}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    class="range-input"
                    on:input={() => handlePropertyRangeChange(property)}
                  />
                  <span class="range-separator">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    bind:value={propertyRanges[property].max}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    class="range-input"
                    on:input={() => handlePropertyRangeChange(property)}
                  />
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Filter Preset Manager Modal -->
  <FilterPresetManager
    bind:isOpen={showPresetManager}
    on:presetApply={handlePresetApply}
    on:presetSaved={handlePresetSaved}
    on:presetDeleted={handlePresetDeleted}
  />

  <!-- Clear Filters Confirmation Dialog -->
  <ConfirmDialog
    bind:isOpen={showClearConfirm}
    title="Clear All Filters"
    message="Are you sure you want to clear all active filters? This action cannot be undone."
    confirmText="Clear All"
    cancelText="Cancel"
    variant="destructive"
    on:confirm={confirmResetFilters}
  />
</div>

<style>
  .filter-panel {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .filter-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
    justify-content: flex-start;
    padding: var(--space-md) var(--space-lg);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-normal);
  }

  .filter-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: hsl(var(--primary));
  }

  .filter-count {
    font-size: 10px;
    padding: 2px 6px;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .chevron {
    margin-left: auto;
    transition: transform var(--transition-fast);
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .reset-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: hsl(var(--destructive));
  }

  .reset-button:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .active-filters-summary {
    margin-bottom: var(--space-md);
  }

  .summary-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .summary-chip {
    font-size: var(--font-size-xs);
    padding: var(--space-xs) var(--space-sm);
  }

  .filter-content {
    border-radius: var(--radius);
    padding: var(--space-xl);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filter-section {
    margin-bottom: var(--space-xl);
  }

  .filter-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin-bottom: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .section-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: hsl(var(--primary));
    border-radius: 2px;
  }

  .presets-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }

  .presets-header .section-title {
    margin-bottom: 0;
  }

  .manage-presets-button {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
  }

  .manage-presets-button:hover {
    color: hsl(var(--primary));
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-sm);
  }

  .preset-button {
    font-size: var(--font-size-sm);
    padding: var(--space-sm) var(--space-md);
    transition: all var(--transition-fast);
  }

  .preset-button:hover {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-color: hsl(var(--primary));
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: calc(var(--radius) / 2);
    color: hsl(var(--foreground));
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .filter-chip.active {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-color: hsl(var(--primary));
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }

  .chip-label {
    text-transform: capitalize;
  }

  .property-ranges {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
  }

  .property-range {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: calc(var(--radius) / 2);
    padding: var(--space-md);
  }

  .property-header {
    margin-bottom: var(--space-md);
  }

  .property-label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: hsl(var(--foreground));
    cursor: pointer;
  }

  .property-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: hsl(var(--primary));
  }

  .unit {
    color: hsl(var(--muted-foreground));
    font-weight: 400;
  }

  .range-inputs {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  :global(.range-input) {
    flex: 1;
    font-size: var(--font-size-sm) !important;
    height: 36px !important;
  }

  .range-separator {
    color: hsl(var(--muted-foreground));
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .filter-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm);
    }

    .filter-toggle {
      justify-content: center;
    }

    .filter-content {
      padding: var(--space-lg);
    }

    .preset-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }

    .property-ranges {
      grid-template-columns: 1fr;
    }

    .range-inputs {
      flex-direction: column;
      align-items: stretch;
    }

    .range-separator {
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .filter-chips {
      justify-content: center;
    }

    .filter-chip {
      flex: 1;
      min-width: 0;
      justify-content: center;
    }

    .chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
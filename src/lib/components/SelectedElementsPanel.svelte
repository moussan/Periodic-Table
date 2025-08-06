<script>
  import { createEventDispatcher } from 'svelte';
  import { selectedElementsStore, selectionStatus, deselectElement, clearSelection } from '$lib/stores';
  import { elementsStore } from '$lib/stores';

  const dispatch = createEventDispatcher();

  // Get selected elements data
  $: selectedElements = $selectedElementsStore.map(number => 
    $elementsStore.find(el => el.number === number)
  ).filter(Boolean);

  function handleRemoveElement(elementNumber) {
    deselectElement(elementNumber);
    dispatch('elementRemoved', { elementNumber });
  }

  function handleCompareElements() {
    if ($selectionStatus.canCompare) {
      dispatch('compare', { elements: selectedElements });
    }
  }

  function handleElementClick(element) {
    dispatch('elementInfo', { element });
  }

  // Get category color for element
  function getCategoryColor(category) {
    const colors = {
      'alkali metal': 'rgb(255, 99, 132)',
      'alkaline earth metal': 'rgb(54, 162, 235)',
      'transition metal': 'rgb(255, 205, 86)',
      'post-transition metal': 'rgb(75, 192, 192)',
      'metalloid': 'rgb(153, 102, 255)',
      'diatomic nonmetal': 'rgb(255, 159, 64)',
      'polyatomic nonmetal': 'rgb(199, 199, 199)',
      'noble gas': 'rgb(83, 102, 255)',
      'lanthanide': 'rgb(255, 99, 255)',
      'actinide': 'rgb(255, 159, 255)',
      'halogen': 'rgb(255, 206, 84)'
    };
    return colors[category?.toLowerCase()] || 'rgb(201, 203, 207)';
  }
</script>

{#if $selectionStatus.count > 0}
  <div class="selected-elements-panel glass-subtle rounded-lg border border-white/10 p-4">
    <div class="panel-header">
      <div class="header-content">
        <h3 class="panel-title">Selected Elements</h3>
        <div class="selection-info">
          <span class="count-badge">{$selectionStatus.count}</span>
          {#if $selectionStatus.canCompare}
            <span class="ready-indicator">Ready to compare</span>
          {/if}
        </div>
      </div>
      
      <div class="header-actions">
        {#if $selectionStatus.canCompare}
          <button 
            class="compare-btn"
            on:click={handleCompareElements}
            aria-label="Compare selected elements"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5c0-1.66 4-3 9-3s9 1.34 9 3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            Compare
          </button>
        {/if}
        
        <button 
          class="clear-all-btn"
          on:click={clearSelection}
          aria-label="Clear all selected elements"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <div class="elements-grid">
      {#each selectedElements as element (element.number)}
        <div 
          class="selected-element-card glass"
          style="--category-color: {getCategoryColor(element.category)}"
        >
          <button 
            class="remove-btn"
            on:click={() => handleRemoveElement(element.number)}
            aria-label="Remove {element.name} from selection"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <button 
            class="element-content"
            on:click={() => handleElementClick(element)}
            aria-label="View details for {element.name}"
          >
            <div class="element-number">{element.number}</div>
            <div class="element-symbol">{element.symbol}</div>
            <div class="element-name">{element.name}</div>
            <div class="element-mass">{(element.atomic_mass || 0).toFixed(2)}</div>
          </button>

          <div class="category-indicator" title="{element.category}">
            <div class="category-dot"></div>
          </div>
        </div>
      {/each}
    </div>

    {#if $selectionStatus.count < $selectionStatus.max}
      <div class="add-more-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8M12 8v8"/>
        </svg>
        Click elements in the table to add them ({$selectionStatus.max - $selectionStatus.count} more available)
      </div>
    {:else}
      <div class="selection-full-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
        Maximum selection reached
      </div>
    {/if}
  </div>
{/if}

<style>
  .selected-elements-panel {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all var(--transition-normal);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-lg);
    gap: var(--space-md);
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .panel-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .selection-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: hsl(var(--primary));
    color: white;
    border-radius: 50%;
    font-size: var(--font-size-sm);
    font-weight: 600;
  }

  .ready-indicator {
    font-size: var(--font-size-sm);
    color: rgb(34, 197, 94);
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  .compare-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius);
    border: 2px solid hsl(var(--primary));
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, rgba(59, 130, 246, 0.8) 100%);
    color: white;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .compare-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius);
    border: 1px solid rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.1);
    color: rgb(248, 113, 113);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .clear-all-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .elements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .selected-element-card {
    position: relative;
    border-radius: var(--radius);
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    transition: all var(--transition-fast);
    overflow: hidden;
  }

  .selected-element-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--category-color);
    opacity: 0.8;
  }

  .selected-element-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .remove-btn {
    position: absolute;
    top: var(--space-xs);
    right: var(--space-xs);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: rgba(239, 68, 68, 0.8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    z-index: 2;
  }

  .remove-btn:hover {
    background: rgb(239, 68, 68);
    transform: scale(1.1);
  }

  .element-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-md);
    width: 100%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .element-content:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .element-number {
    font-size: var(--font-size-xs);
    color: hsl(var(--muted-foreground));
    margin-bottom: var(--space-xs);
  }

  .element-symbol {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: hsl(var(--foreground));
    margin-bottom: var(--space-xs);
  }

  .element-name {
    font-size: var(--font-size-sm);
    color: hsl(var(--foreground));
    margin-bottom: var(--space-xs);
    text-align: center;
  }

  .element-mass {
    font-size: var(--font-size-xs);
    color: hsl(var(--muted-foreground));
  }

  .category-indicator {
    position: absolute;
    bottom: var(--space-xs);
    right: var(--space-xs);
  }

  .category-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--category-color);
    box-shadow: 0 0 8px var(--category-color);
  }

  .add-more-hint,
  .selection-full-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    text-align: center;
  }

  .add-more-hint {
    color: hsl(var(--primary));
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
  }

  .selection-full-hint {
    color: rgb(34, 197, 94);
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.05);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .panel-header {
      flex-direction: column;
      gap: var(--space-md);
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .elements-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-sm);
    }

    .compare-btn,
    .clear-all-btn {
      flex: 1;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .elements-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    }

    .element-symbol {
      font-size: var(--font-size-lg);
    }

    .element-name {
      font-size: var(--font-size-xs);
    }
  }
</style>
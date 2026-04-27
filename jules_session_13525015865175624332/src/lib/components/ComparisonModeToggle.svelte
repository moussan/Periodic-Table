<script>
  import { createEventDispatcher } from 'svelte';
  import { selectedElementsStore, selectionStatus, clearSelection } from '$lib/stores';

  export let comparisonMode = false;
  
  const dispatch = createEventDispatcher();

  function toggleComparisonMode() {
    comparisonMode = !comparisonMode;
    dispatch('toggle', { comparisonMode });
  }

  function handleClearSelection() {
    clearSelection();
    dispatch('selectionCleared');
  }
</script>

<div class="comparison-toggle-container glass-subtle rounded-lg border border-white/10 p-4">
  <div class="toggle-header">
    <h3 class="toggle-title">Element Comparison</h3>
    <p class="toggle-description">Select elements to compare their properties</p>
  </div>
  
  <div class="toggle-controls">
    <button 
      class="mode-toggle-btn"
      class:active={comparisonMode}
      on:click={toggleComparisonMode}
      aria-pressed={comparisonMode}
      aria-label="{comparisonMode ? 'Exit' : 'Enter'} comparison mode"
    >
      <div class="toggle-icon">
        {#if comparisonMode}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        {/if}
      </div>
      <span class="toggle-text">
        {comparisonMode ? 'Exit Comparison' : 'Compare Elements'}
      </span>
    </button>

    {#if comparisonMode && $selectionStatus.count > 0}
      <button 
        class="clear-btn"
        on:click={handleClearSelection}
        aria-label="Clear all selected elements"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
        </svg>
        Clear Selection
      </button>
    {/if}
  </div>

  {#if comparisonMode}
    <div class="selection-status">
      <div class="status-info">
        <span class="selection-count">
          {$selectionStatus.count} / {$selectionStatus.max} selected
        </span>
        {#if $selectionStatus.canCompare}
          <span class="status-ready">Ready to compare</span>
        {:else}
          <span class="status-hint">Select at least 2 elements</span>
        {/if}
      </div>
      
      <div class="selection-progress">
        <div 
          class="progress-bar"
          style="width: {($selectionStatus.count / $selectionStatus.max) * 100}%"
        ></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .comparison-toggle-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all var(--transition-normal);
  }

  .comparison-toggle-container:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .toggle-header {
    margin-bottom: var(--space-lg);
    text-align: center;
  }

  .toggle-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0 0 var(--space-xs) 0;
  }

  .toggle-description {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    margin: 0;
  }

  .toggle-controls {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .mode-toggle-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius);
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: hsl(var(--foreground));
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  .mode-toggle-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .mode-toggle-btn:hover::before {
    opacity: 1;
  }

  .mode-toggle-btn:hover {
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  }

  .mode-toggle-btn.active {
    background: linear-gradient(135deg, hsl(var(--primary)) 0%, rgba(59, 130, 246, 0.8) 100%);
    border-color: hsl(var(--primary));
    color: white;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }

  .mode-toggle-btn.active:hover {
    box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-fast);
  }

  .mode-toggle-btn:hover .toggle-icon {
    transform: scale(1.1);
  }

  .toggle-text {
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .clear-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: calc(var(--radius) / 1.5);
    border: 1px solid rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.1);
    color: rgb(248, 113, 113);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
  }

  .selection-status {
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .selection-count {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: hsl(var(--primary));
  }

  .status-ready {
    font-size: var(--font-size-sm);
    color: rgb(34, 197, 94);
    font-weight: 500;
  }

  .status-hint {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
    font-style: italic;
  }

  .selection-progress {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, hsl(var(--primary)) 0%, rgba(59, 130, 246, 0.8) 100%);
    border-radius: 2px;
    transition: width var(--transition-normal);
    position: relative;
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .toggle-controls {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .mode-toggle-btn {
      width: 100%;
      justify-content: center;
    }

    .status-info {
      flex-direction: column;
      text-align: center;
      gap: var(--space-xs);
    }
  }
</style>
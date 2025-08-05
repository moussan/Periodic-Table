<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui';
  import { Input } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui';
  import { filterStore } from '$lib/stores/filters';
  import { loadFilterPresets, saveFilterPreset, deleteFilterPreset, type FilterPreset } from '$lib/stores/filterPresets';

  const dispatch = createEventDispatcher();

  // Component props
  export let isOpen = false;

  // Local state
  let presetName = '';
  let savedPresets: FilterPreset[] = [];
  let showSaveForm = false;
  let isLoading = false;

  // Load presets on mount
  $: if (isOpen) {
    loadPresets();
  }

  async function loadPresets() {
    isLoading = true;
    try {
      savedPresets = await loadFilterPresets();
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSavePreset() {
    if (!presetName.trim()) return;

    try {
      const preset: FilterPreset = {
        id: Date.now().toString(),
        name: presetName.trim(),
        filters: { ...$filterStore },
        created: new Date().toISOString(),
        description: generatePresetDescription($filterStore)
      };

      await saveFilterPreset(preset);
      await loadPresets();
      
      presetName = '';
      showSaveForm = false;
      
      dispatch('presetSaved', preset);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  }

  async function handleDeletePreset(presetId: string) {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      await deleteFilterPreset(presetId);
      await loadPresets();
      dispatch('presetDeleted', { id: presetId });
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  }

  function handleApplyPreset(preset: FilterPreset) {
    dispatch('presetApply', preset);
    isOpen = false;
  }

  function generatePresetDescription(filters: any): string {
    const parts = [];
    
    if (filters.searchTerm) parts.push(`Search: "${filters.searchTerm}"`);
    if (filters.categories.length > 0) parts.push(`${filters.categories.length} categories`);
    if (filters.periods.length > 0) parts.push(`${filters.periods.length} periods`);
    if (filters.groups.length > 0) parts.push(`${filters.groups.length} groups`);
    
    const activeRanges = Object.values(filters.propertyRanges).filter(range => range !== null).length;
    if (activeRanges > 0) parts.push(`${activeRanges} property ranges`);
    
    return parts.length > 0 ? parts.join(', ') : 'No filters';
  }

  function toggleSaveForm() {
    showSaveForm = !showSaveForm;
    if (!showSaveForm) {
      presetName = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && presetName.trim()) {
      handleSavePreset();
    } else if (event.key === 'Escape') {
      showSaveForm = false;
      presetName = '';
    }
  }
</script>

{#if isOpen}
  <div class="preset-manager-overlay" on:click={() => isOpen = false}>
    <div class="preset-manager glass" on:click|stopPropagation>
      <div class="preset-header">
        <h2 class="preset-title">Filter Presets</h2>
        <Button
          variant="ghost"
          size="sm"
          class="close-button"
          on:click={() => isOpen = false}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </Button>
      </div>

      <div class="preset-content">
        <!-- Save current filters as preset -->
        <div class="save-section">
          {#if !showSaveForm}
            <Button
              variant="outline"
              class="save-preset-button"
              on:click={toggleSaveForm}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Save Current Filters
            </Button>
          {:else}
            <div class="save-form">
              <div class="form-row">
                <Input
                  bind:value={presetName}
                  placeholder="Enter preset name..."
                  class="preset-name-input"
                  on:keydown={handleKeydown}
                  autofocus
                />
                <Button
                  variant="default"
                  size="sm"
                  disabled={!presetName.trim()}
                  on:click={handleSavePreset}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  on:click={toggleSaveForm}
                >
                  Cancel
                </Button>
              </div>
              <div class="current-filters-preview">
                <span class="preview-label">Current filters:</span>
                <span class="preview-text">{generatePresetDescription($filterStore)}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Saved presets list -->
        <div class="presets-section">
          <h3 class="section-title">Saved Presets</h3>
          
          {#if isLoading}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>Loading presets...</span>
            </div>
          {:else if savedPresets.length === 0}
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              <p>No saved presets yet</p>
              <p class="empty-subtitle">Save your current filters to create your first preset</p>
            </div>
          {:else}
            <div class="presets-list">
              {#each savedPresets as preset}
                <div class="preset-item">
                  <div class="preset-info">
                    <div class="preset-name">{preset.name}</div>
                    <div class="preset-description">{preset.description}</div>
                    <div class="preset-meta">
                      <span class="preset-date">
                        Created {new Date(preset.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div class="preset-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      on:click={() => handleApplyPreset(preset)}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="delete-button"
                      on:click={() => handleDeletePreset(preset.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .preset-manager-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .preset-manager {
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    border-radius: var(--radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .preset-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preset-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .close-button {
    color: hsl(var(--muted-foreground));
  }

  .close-button:hover {
    color: hsl(var(--foreground));
  }

  .preset-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
  }

  .save-section {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .save-preset-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    justify-content: center;
    padding: var(--space-md);
  }

  .save-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .form-row {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  :global(.preset-name-input) {
    flex: 1;
  }

  .current-filters-preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: calc(var(--radius) / 2);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .preview-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  .preview-text {
    font-size: var(--font-size-sm);
    color: hsl(var(--foreground));
  }

  .presets-section {
    flex: 1;
  }

  .section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0 0 var(--space-lg) 0;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    color: hsl(var(--muted-foreground));
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top: 2px solid hsl(var(--primary));
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-2xl);
    text-align: center;
    color: hsl(var(--muted-foreground));
  }

  .empty-state svg {
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
  }

  .empty-subtitle {
    font-size: var(--font-size-sm);
    opacity: 0.7;
  }

  .presets-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .preset-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: calc(var(--radius) / 2);
    transition: all var(--transition-fast);
  }

  .preset-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .preset-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .preset-name {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  .preset-description {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
  }

  .preset-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .preset-date {
    font-size: var(--font-size-xs);
    color: hsl(var(--muted-foreground));
    opacity: 0.7;
  }

  .preset-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .delete-button {
    color: hsl(var(--destructive));
  }

  .delete-button:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .preset-manager-overlay {
      padding: var(--space-md);
    }

    .preset-manager {
      max-height: 90vh;
    }

    .preset-item {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm);
    }

    .preset-actions {
      justify-content: flex-end;
    }

    .form-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
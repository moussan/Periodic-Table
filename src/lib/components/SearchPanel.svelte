<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { debounce } from '$lib/utils';
  import { Input } from '$lib/components/ui';
  import { Button } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui';
  import { 
    filterStore, 
    updateSearchTerm, 
    addSearchToHistory, 
    searchHistoryStore,
    hasActiveFilters,
    resetFilters
  } from '$lib/stores/filters';
  import { filteredElementsStore, elementsStore } from '$lib/stores/elements';

  const dispatch = createEventDispatcher();

  // Component props
  export let placeholder = 'Search elements by name, symbol, or properties...';
  export let showHistory = true;
  export let showResults = true;
  export let debounceMs = 300;

  // Local state
  let searchInput: HTMLInputElement;
  let searchTerm = '';
  let isSearchFocused = false;
  let showSearchHistory = false;
  let searchResults: any[] = [];

  // Reactive statements
  $: searchTerm = $filterStore.searchTerm;
  $: totalElements = $elementsStore.length;
  $: filteredCount = $filteredElementsStore.length;
  $: hasResults = searchTerm.trim().length > 0;
  $: showResultsPanel = hasResults && isSearchFocused && showResults;

  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    updateSearchTerm(term);
    if (term.trim()) {
      addSearchToHistory(term.trim());
      dispatch('search', { term: term.trim() });
    }
  }, debounceMs);

  // Event handlers
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchTerm = target.value;
    debouncedSearch(searchTerm);
  }

  function handleSearchFocus() {
    isSearchFocused = true;
    showSearchHistory = searchTerm.trim().length === 0 && $searchHistoryStore.length > 0;
  }

  function handleSearchBlur() {
    // Delay hiding to allow for clicks on history items
    setTimeout(() => {
      isSearchFocused = false;
      showSearchHistory = false;
    }, 150);
  }

  function handleHistoryClick(historyTerm: string) {
    searchTerm = historyTerm;
    updateSearchTerm(historyTerm);
    searchInput?.focus();
    showSearchHistory = false;
    dispatch('search', { term: historyTerm });
  }

  function handleClearSearch() {
    searchTerm = '';
    updateSearchTerm('');
    searchInput?.focus();
    dispatch('clear');
  }

  function handleResetFilters() {
    resetFilters();
    searchInput?.focus();
    dispatch('reset');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClearSearch();
      searchInput?.blur();
    } else if (event.key === 'Enter' && searchTerm.trim()) {
      addSearchToHistory(searchTerm.trim());
      searchInput?.blur();
      dispatch('search', { term: searchTerm.trim() });
    }
  }

  // Quick search suggestions based on current elements
  $: searchSuggestions = searchTerm.trim().length > 0 ? 
    $elementsStore
      .filter(element => {
        const term = searchTerm.toLowerCase();
        return element.name.toLowerCase().includes(term) ||
               element.symbol.toLowerCase().includes(term) ||
               element.category.toLowerCase().includes(term);
      })
      .slice(0, 8)
      .map(element => ({
        type: 'element',
        value: element.name,
        symbol: element.symbol,
        number: element.number,
        category: element.category
      }))
    : [];

  onMount(() => {
    // Focus search input on mount if no search term
    if (!searchTerm.trim()) {
      searchInput?.focus();
    }
  });
</script>

<div class="search-panel glass">
  <div class="search-container">
    <!-- Search input with modern styling -->
    <div class="search-input-wrapper" class:focused={isSearchFocused} class:has-value={searchTerm.trim().length > 0}>
      <div class="search-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      
      <Input
        bind:this={searchInput}
        bind:value={searchTerm}
        {placeholder}
        class="search-input"
        on:input={handleSearchInput}
        on:focus={handleSearchFocus}
        on:blur={handleSearchBlur}
        on:keydown={handleKeydown}
        autocomplete="off"
        spellcheck="false"
      />
      
      {#if searchTerm.trim().length > 0}
        <Button
          variant="ghost"
          size="sm"
          class="clear-button"
          on:click={handleClearSearch}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </Button>
      {/if}
    </div>

    <!-- Search results summary -->
    {#if hasResults}
      <div class="search-summary">
        <div class="results-count">
          <span class="count-number">{filteredCount}</span>
          <span class="count-text">of {totalElements} elements</span>
        </div>
        
        {#if $hasActiveFilters}
          <Button
            variant="outline"
            size="sm"
            class="reset-filters-btn"
            on:click={handleResetFilters}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            Clear All Filters
          </Button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Search dropdown with history and suggestions -->
  {#if (showSearchHistory || showResultsPanel) && isSearchFocused}
    <div class="search-dropdown glass-subtle">
      <!-- Search history -->
      {#if showSearchHistory && $searchHistoryStore.length > 0}
        <div class="dropdown-section">
          <div class="section-header">
            <span class="section-title">Recent Searches</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="history-list">
            {#each $searchHistoryStore.slice(0, 5) as historyItem}
              <button
                class="history-item"
                on:click={() => handleHistoryClick(historyItem)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>{historyItem}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Search suggestions -->
      {#if showResultsPanel && searchSuggestions.length > 0}
        <div class="dropdown-section">
          <div class="section-header">
            <span class="section-title">Suggestions</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div class="suggestions-list">
            {#each searchSuggestions as suggestion}
              <button
                class="suggestion-item"
                on:click={() => handleHistoryClick(suggestion.value)}
              >
                <div class="suggestion-element">
                  <span class="element-number">{suggestion.number}</span>
                  <span class="element-symbol">{suggestion.symbol}</span>
                </div>
                <div class="suggestion-info">
                  <span class="element-name">{suggestion.value}</span>
                  <Badge variant="secondary" class="category-badge">
                    {suggestion.category}
                  </Badge>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- No results message -->
      {#if showResultsPanel && searchSuggestions.length === 0 && searchTerm.trim().length > 0}
        <div class="dropdown-section">
          <div class="no-results">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>No elements found for "{searchTerm}"</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-panel {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    border-radius: var(--radius);
    padding: var(--space-lg);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .search-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius);
    transition: all var(--transition-normal);
  }

  .search-input-wrapper.focused {
    background: rgba(255, 255, 255, 0.08);
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .search-input-wrapper.has-value {
    background: rgba(255, 255, 255, 0.08);
  }

  .search-icon {
    position: absolute;
    left: var(--space-md);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    z-index: 1;
    transition: color var(--transition-fast);
  }

  .search-input-wrapper.focused .search-icon {
    color: hsl(var(--primary));
  }

  :global(.search-input) {
    background: transparent !important;
    border: none !important;
    padding-left: 48px !important;
    padding-right: 48px !important;
    font-size: var(--font-size-base) !important;
    height: 48px !important;
    color: hsl(var(--foreground)) !important;
  }

  :global(.search-input:focus) {
    outline: none !important;
    box-shadow: none !important;
    ring: none !important;
  }

  :global(.search-input::placeholder) {
    color: hsl(var(--muted-foreground)) !important;
  }

  .clear-button {
    position: absolute;
    right: var(--space-sm);
    color: hsl(var(--muted-foreground));
    transition: all var(--transition-fast);
  }

  .clear-button:hover {
    color: hsl(var(--foreground));
    background: rgba(255, 255, 255, 0.1);
  }

  .search-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: calc(var(--radius) / 2);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .results-count {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .count-number {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: hsl(var(--primary));
  }

  .count-text {
    font-size: var(--font-size-sm);
    color: hsl(var(--muted-foreground));
  }

  .reset-filters-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
  }

  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: var(--space-sm);
    border-radius: var(--radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    max-height: 400px;
    overflow-y: auto;
  }

  .dropdown-section {
    padding: var(--space-md);
  }

  .dropdown-section:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .section-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .history-list,
  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    border-radius: calc(var(--radius) / 2);
    color: hsl(var(--foreground));
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: hsl(var(--primary));
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    border-radius: calc(var(--radius) / 2);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .suggestion-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .suggestion-element {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: calc(var(--radius) / 2);
    flex-shrink: 0;
    position: relative;
  }

  .element-number {
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 10px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
  }

  .element-symbol {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: hsl(var(--primary));
  }

  .suggestion-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 1;
  }

  .element-name {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  :global(.category-badge) {
    font-size: 10px !important;
    padding: 2px 6px !important;
    align-self: flex-start;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xl);
    color: hsl(var(--muted-foreground));
    text-align: center;
  }

  .no-results svg {
    opacity: 0.5;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .search-panel {
      padding: var(--space-md);
    }

    .search-summary {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm);
    }

    .reset-filters-btn {
      align-self: stretch;
      justify-content: center;
    }

    .suggestion-item {
      gap: var(--space-sm);
    }

    .suggestion-element {
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 480px) {
    :global(.search-input) {
      padding-left: 40px !important;
      padding-right: 40px !important;
      height: 44px !important;
    }

    .search-icon {
      left: var(--space-sm);
    }

    .clear-button {
      right: var(--space-xs);
    }
  }
</style>
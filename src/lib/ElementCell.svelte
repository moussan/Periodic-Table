<script>
  import { createEventDispatcher } from "svelte";
  import {
    selectedElementsStore,
    toggleElementSelection,
    isSelectionFull,
  } from "$lib/stores";

  export let element;
  export let isFiltered = false; // Element is filtered out (dimmed)
  export let isHighlighted = false; // Element matches filter (highlighted)
  export let comparisonMode = false; // Whether comparison mode is active
  const dispatch = createEventDispatcher();

  // Check if this element is selected
  $: isSelected = $selectedElementsStore.includes(element.number);
  $: canSelect = !$isSelectionFull || isSelected;

  function handleWikiClick(e) {
    e.stopPropagation();
    dispatch("showWiki", element);
  }

  function handleOrbitClick(e) {
    e.stopPropagation();
    dispatch("showOrbitAnimation", element);
  }

  function handleElementClick(e) {
    if (comparisonMode) {
      e.stopPropagation();
      if (canSelect) {
        toggleElementSelection(element.number);
        dispatch("elementToggle", { element, selected: !isSelected });
      }
    }
  }

  function handleSelectClick(e) {
    e.stopPropagation();
    if (canSelect) {
      toggleElementSelection(element.number);
      dispatch("elementToggle", { element, selected: !isSelected });
    }
  }

  function handleKeyDown(e) {
    if (comparisonMode && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleElementClick(e);
    }
  }

  $: orbitalFormula =
    element?.electron_configuration_semantic ||
    element?.electron_configuration ||
    "N/A";
  $: categoryClass =
    element?.category?.replace(/\s+/g, "-").toLowerCase() || "unknown";
</script>

{#if comparisonMode}
  <button
    class="element-cell element-{categoryClass} glass rounded-lg border border-white/20 p-2 relative flex flex-col justify-between min-h-[100px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50"
    class:filtered={isFiltered}
    class:highlighted={isHighlighted}
    class:selected={isSelected}
    class:comparison-mode={comparisonMode}
    class:can-select={canSelect}
    style="grid-column: {element.xpos}; grid-row: {element.ypos};"
    title="{element.name} ({element.category})"
    on:click={handleElementClick}
    disabled={!canSelect}
    aria-pressed={isSelected}
    aria-label="{isSelected
      ? 'Deselect'
      : 'Select'} {element.name} for comparison"
  >
    <!-- Selection indicator -->
    <button
      class="absolute top-1 right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all selection-indicator"
      class:selected={isSelected}
      class:disabled={!canSelect}
      on:click={handleSelectClick}
      disabled={!canSelect}
      aria-label="{isSelected
        ? 'Deselect'
        : 'Select'} {element.name} for comparison"
    >
      {#if isSelected}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-white"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      {/if}
    </button>

    <!-- Atomic number -->
    <div
      class="absolute top-1 left-1 text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/90"
    >
      {element.number}
    </div>

    <!-- Element symbol -->
    <div class="text-2xl font-bold text-center mt-6 mb-1 text-white">
      {element.symbol}
    </div>

    <!-- Element name -->
    <div
      class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/90 mb-1 truncate"
    >
      {element.name}
    </div>

    <!-- Atomic weight -->
    <div
      class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/80 mb-2"
    >
      {(element.atomic_mass || 0).toFixed(3)}
    </div>

    <!-- Orbital button -->
    <button
      class="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white/90 hover:bg-primary/20 transition-all font-mono truncate flex items-center justify-center gap-1"
      on:click={handleOrbitClick}
      aria-label="Show orbitals for {element.name}"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="1" />
        <path
          d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"
        />
      </svg>
      <span class="truncate">{orbitalFormula}</span>
    </button>
  </button>
{:else}
  <div
    class="element-cell element-{categoryClass} glass rounded-lg border border-white/20 p-2 relative flex flex-col justify-between min-h-[100px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50"
    class:filtered={isFiltered}
    class:highlighted={isHighlighted}
    class:selected={isSelected}
    class:comparison-mode={comparisonMode}
    class:can-select={canSelect}
    style="grid-column: {element.xpos}; grid-row: {element.ypos};"
    title="{element.name} ({element.category})"
  >
    <!-- Info button -->
    <button
      class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary/20 transition-all"
      on:click={handleWikiClick}
      aria-label="Show info for {element.name}"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="text-white/80"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,16,14" />
        <circle cx="12" cy="17" r=".5" />
      </svg>
    </button>

    <!-- Atomic number -->
    <div
      class="absolute top-1 left-1 text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/90"
    >
      {element.number}
    </div>

    <!-- Element symbol -->
    <div class="text-2xl font-bold text-center mt-6 mb-1 text-white">
      {element.symbol}
    </div>

    <!-- Element name -->
    <div
      class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/90 mb-1 truncate"
    >
      {element.name}
    </div>

    <!-- Atomic weight -->
    <div
      class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/80 mb-2"
    >
      {(element.atomic_mass || 0).toFixed(3)}
    </div>

    <!-- Orbital button -->
    <button
      class="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white/90 hover:bg-primary/20 transition-all font-mono truncate flex items-center justify-center gap-1"
      on:click={handleOrbitClick}
      aria-label="Show orbitals for {element.name}"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="1" />
        <path
          d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"
        />
      </svg>
      <span class="truncate">{orbitalFormula}</span>
    </button>
  </div>
{/if}

<style>
  .element-alkali-metal {
    background: linear-gradient(
      135deg,
      rgba(255, 99, 132, 0.3) 0%,
      rgba(255, 99, 132, 0.1) 100%
    );
    border-color: rgba(255, 99, 132, 0.4);
  }

  .element-alkaline-earth-metal {
    background: linear-gradient(
      135deg,
      rgba(54, 162, 235, 0.3) 0%,
      rgba(54, 162, 235, 0.1) 100%
    );
    border-color: rgba(54, 162, 235, 0.4);
  }

  .element-noble-gas {
    background: linear-gradient(
      135deg,
      rgba(83, 102, 255, 0.3) 0%,
      rgba(83, 102, 255, 0.1) 100%
    );
    border-color: rgba(83, 102, 255, 0.4);
  }

  .element-transition-metal {
    background: linear-gradient(
      135deg,
      rgba(255, 205, 86, 0.3) 0%,
      rgba(255, 205, 86, 0.1) 100%
    );
    border-color: rgba(255, 205, 86, 0.4);
  }

  .element-post-transition-metal {
    background: linear-gradient(
      135deg,
      rgba(75, 192, 192, 0.3) 0%,
      rgba(75, 192, 192, 0.1) 100%
    );
    border-color: rgba(75, 192, 192, 0.4);
  }

  .element-metalloid {
    background: linear-gradient(
      135deg,
      rgba(153, 102, 255, 0.3) 0%,
      rgba(153, 102, 255, 0.1) 100%
    );
    border-color: rgba(153, 102, 255, 0.4);
  }

  .element-diatomic-nonmetal {
    background: linear-gradient(
      135deg,
      rgba(255, 159, 64, 0.3) 0%,
      rgba(255, 159, 64, 0.1) 100%
    );
    border-color: rgba(255, 159, 64, 0.4);
  }

  .element-polyatomic-nonmetal {
    background: linear-gradient(
      135deg,
      rgba(199, 199, 199, 0.3) 0%,
      rgba(199, 199, 199, 0.1) 100%
    );
    border-color: rgba(199, 199, 199, 0.4);
  }

  .element-lanthanide {
    background: linear-gradient(
      135deg,
      rgba(255, 99, 255, 0.3) 0%,
      rgba(255, 99, 255, 0.1) 100%
    );
    border-color: rgba(255, 99, 255, 0.4);
  }

  .element-actinide {
    background: linear-gradient(
      135deg,
      rgba(255, 159, 255, 0.3) 0%,
      rgba(255, 159, 255, 0.1) 100%
    );
    border-color: rgba(255, 159, 255, 0.4);
  }

  .element-halogen {
    background: linear-gradient(
      135deg,
      rgba(255, 206, 84, 0.3) 0%,
      rgba(255, 206, 84, 0.1) 100%
    );
    border-color: rgba(255, 206, 84, 0.4);
  }

  .element-unknown {
    background: linear-gradient(
      135deg,
      rgba(201, 203, 207, 0.3) 0%,
      rgba(201, 203, 207, 0.1) 100%
    );
    border-color: rgba(201, 203, 207, 0.4);
  }

  .element-cell:hover {
    z-index: 10;
  }

  .element-cell:hover .text-2xl {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }

  /* Filtering states */
  .element-cell.filtered {
    opacity: 0.3;
    transform: scale(0.95);
    filter: grayscale(0.7);
    pointer-events: none;
  }

  .element-cell.highlighted {
    border-color: hsl(var(--primary)) !important;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    transform: scale(1.02);
    z-index: 10;
    position: relative;
  }

  .element-cell.highlighted::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(
      45deg,
      hsl(var(--primary)),
      transparent,
      hsl(var(--primary))
    );
    z-index: -1;
    opacity: 0.3;
    animation: pulse-border 2s ease-in-out infinite;
  }

  @keyframes pulse-border {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* Selection states */
  .element-cell.comparison-mode {
    cursor: pointer;
  }

  .element-cell.comparison-mode:not(.can-select) {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .element-cell.selected {
    border-color: hsl(var(--primary)) !important;
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.6),
      inset 0 0 20px rgba(59, 130, 246, 0.1);
    transform: scale(1.05);
    z-index: 15;
    position: relative;
  }

  .element-cell.selected::before {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    background: linear-gradient(
      45deg,
      hsl(var(--primary)),
      transparent,
      hsl(var(--primary))
    );
    z-index: -1;
    opacity: 0.4;
    animation: selection-pulse 2s ease-in-out infinite;
  }

  .element-cell.comparison-mode:hover:not(.selected):not(.filtered) {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  }

  /* Selection indicator styles */
  .selection-indicator {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .selection-indicator.selected {
    background: hsl(var(--primary));
    border-color: hsl(var(--primary));
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  .selection-indicator.disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }

  .selection-indicator:hover:not(.disabled) {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    transform: scale(1.1);
  }

  @keyframes selection-pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Button reset for comparison mode */
  button.element-cell {
    background: inherit;
    border: inherit;
    font: inherit;
    color: inherit;
    text-align: inherit;
    cursor: pointer;
  }

  button.element-cell:disabled {
    cursor: not-allowed;
  }

  /* Smooth transitions for filtering */
  .element-cell {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>

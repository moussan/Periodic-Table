<script>
  import ElementCell from './ElementCell.svelte';
  import { createEventDispatcher } from 'svelte';
  import periodicTableData from '$lib/data/PeriodicTableJSON.json';

  // Props passed into the component
  export let elements = periodicTableData.elements; // Filtered elements
  export let allElements = periodicTableData.elements; // All elements for reference
  export let maxC = 18; // Max columns for the main table
  export let maxR = 7; // Max rows for the main table
  export let elementMap; // Map for quick lookup
  
  // Create a set of filtered element numbers for quick lookup
  $: filteredElementNumbers = new Set(elements.map(el => el.number));
  $: isFiltering = elements.length !== allElements.length;

  // Initialize the event dispatcher
  const dispatch = createEventDispatcher();

  // Define ranges for lanthanides and actinides
  const lanthanideRange = { start: 57, end: 71 }; // La to Lu
  const actinideRange = { start: 89, end: 103 };  // Ac to Lr
  
  // Modern placeholders for Lanthanides and Actinides in the main table
  const lanthanidePlaceholder = { 
    xpos: 3, ypos: 6, symbol: 'La-Lu', number: '57-71', 
    name: 'Lanthanides', category: 'lanthanide-placeholder' 
  };
  const actinidePlaceholder = { 
    xpos: 3, ypos: 7, symbol: 'Ac-Lr', number: '89-103', 
    name: 'Actinides', category: 'actinide-placeholder' 
  };

  // Separate and position lanthanides and actinides
  let lanthanides = elements.filter(el => el.number >= lanthanideRange.start && el.number <= lanthanideRange.end);
  let actinides = elements.filter(el => el.number >= actinideRange.start && el.number <= actinideRange.end);

  // Position elements in their separate rows
  lanthanides.forEach((el, index) => el.display_xpos = index + 2);
  actinides.forEach((el, index) => el.display_xpos = index + 2);
</script>

<!-- Modern periodic table with futuristic design -->
<div class="periodic-table-container glass-subtle rounded-2xl border border-white/10 p-6 backdrop-blur-md">
  <!-- Main periodic table grid -->
  <div class="periodic-table-grid main-table futuristic-grid">
    {#each Array(maxR) as _, r}
      {#each Array(maxC) as _, c}
        {@const x = c + 1}
        {@const y = r + 1}
        {@const key = `${x}-${y}`}
        {@const element = elementMap.get(key)}
        
        <!-- Regular elements -->
        {#if element && !(element.number >= lanthanideRange.start && element.number <= lanthanideRange.end) && !(element.number >= actinideRange.start && element.number <= actinideRange.end)}
          <ElementCell 
            {element} 
            isFiltered={isFiltering && !filteredElementNumbers.has(element.number)}
            isHighlighted={isFiltering && filteredElementNumbers.has(element.number)}
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
          />
        
        <!-- Lanthanide placeholder -->
        {:else if x === lanthanidePlaceholder.xpos && y === lanthanidePlaceholder.ypos}
          <div 
            class="placeholder-cell lanthanide-placeholder glass rounded-lg border border-purple-400/30 p-2 flex flex-col items-center justify-center min-h-[100px] transition-all duration-500 hover:scale-110 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-400/20 group"
            style="grid-column: {x}; grid-row: {y};"
          >
            <div class="text-sm font-bold text-purple-300 mb-1 group-hover:text-purple-200 transition-colors duration-300">{lanthanidePlaceholder.number}</div>
            <div class="text-xs text-purple-200 group-hover:text-purple-100 transition-colors duration-300">{lanthanidePlaceholder.name}</div>
            <div class="text-xs text-purple-300/70 mt-1 group-hover:text-purple-200 transition-all duration-300 group-hover:animate-pulse">↓</div>
          </div>
        
        <!-- Actinide placeholder -->
        {:else if x === actinidePlaceholder.xpos && y === actinidePlaceholder.ypos}
          <div 
            class="placeholder-cell actinide-placeholder glass rounded-lg border border-pink-400/30 p-2 flex flex-col items-center justify-center min-h-[100px] transition-all duration-500 hover:scale-110 hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-400/20 group"
            style="grid-column: {x}; grid-row: {y};"
          >
            <div class="text-sm font-bold text-pink-300 mb-1 group-hover:text-pink-200 transition-colors duration-300">{actinidePlaceholder.number}</div>
            <div class="text-xs text-pink-200 group-hover:text-pink-100 transition-colors duration-300">{actinidePlaceholder.name}</div>
            <div class="text-xs text-pink-300/70 mt-1 group-hover:text-pink-200 transition-all duration-300 group-hover:animate-pulse">↓</div>
          </div>
        
        <!-- Empty cells for gaps -->
        {:else if !elementMap.has(key) && !((x === 3 && y === 6) || (x === 3 && y === 7))}
          <div 
            class="empty-cell rounded-lg border border-white/5 min-h-[100px] transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02]"
            style="grid-column: {x}; grid-row: {y};"
          ></div>
        {/if}
      {/each}
    {/each}
  </div>

  <!-- Lanthanide series -->
  {#if lanthanides.length > 0}
    <div class="series-container mt-8 animate-fade-in">
      <div class="periodic-table-grid lanthanide-row futuristic-series">
        <div class="series-label glass rounded-lg border border-purple-400/30 flex items-center justify-center min-h-[100px] text-purple-200 font-bold text-sm transition-all duration-500 hover:scale-105 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20 group" style="grid-column: 1; grid-row: 1;">
          <div class="text-center">
            <div class="group-hover:text-purple-100 transition-colors duration-300">Lanthanides</div>
            <div class="text-xs text-purple-300/70 mt-1 group-hover:text-purple-200 transition-colors duration-300">57-71</div>
          </div>
        </div>
        {#each lanthanides as element}
          <ElementCell 
            element={{...element, xpos: element.display_xpos, ypos: 1}}
            isFiltered={isFiltering && !filteredElementNumbers.has(element.number)}
            isHighlighted={isFiltering && filteredElementNumbers.has(element.number)} 
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Actinide series -->
  {#if actinides.length > 0}
    <div class="series-container mt-4 animate-fade-in">
      <div class="periodic-table-grid actinide-row futuristic-series">
        <div class="series-label glass rounded-lg border border-pink-400/30 flex items-center justify-center min-h-[100px] text-pink-200 font-bold text-sm transition-all duration-500 hover:scale-105 hover:border-pink-400/50 hover:shadow-lg hover:shadow-pink-400/20 group" style="grid-column: 1; grid-row: 1;">
          <div class="text-center">
            <div class="group-hover:text-pink-100 transition-colors duration-300">Actinides</div>
            <div class="text-xs text-pink-300/70 mt-1 group-hover:text-pink-200 transition-colors duration-300">89-103</div>
          </div>
        </div>
        {#each actinides as element}
          <ElementCell 
            element={{...element, xpos: element.display_xpos, ypos: 1}}
            isFiltered={isFiltering && !filteredElementNumbers.has(element.number)}
            isHighlighted={isFiltering && filteredElementNumbers.has(element.number)} 
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Component styling -->
<style>
  .periodic-table-container {
    margin: 2rem auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center; 
    max-width: 100vw;
    overflow-x: auto;
    box-sizing: border-box;
    position: relative;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
    box-shadow: 
      0 0 50px rgba(59, 130, 246, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all var(--transition-slow);
  }

  .periodic-table-container:hover {
    box-shadow: 
      0 0 80px rgba(59, 130, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .periodic-table-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 18), minmax(52px, 1fr));
    grid-template-rows: repeat(var(--rows, 7), minmax(68px, auto));
    gap: 4px;
    margin-bottom: 2rem;
    width: fit-content;
    max-width: 100vw;
    overflow-x: auto;
    position: relative;
  }

  .futuristic-grid {
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%);
    border-radius: 1rem;
    padding: 1rem;
    position: relative;
  }

  .futuristic-grid::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 1rem;
    padding: 1px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }
  /* Define grid variables for the main table */
  .main-table {
      --cols: 18;
      --rows: 7;
  }
  
  .lanthanide-row, .actinide-row {
      --cols: 17; /* 1 label + 15 elements + 1 for potential gap */
      --rows: 1;
      margin-top: 0.5rem;
  }

  .futuristic-series {
    background: 
      linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
    border-radius: 0.75rem;
    padding: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .futuristic-series::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  .futuristic-series:hover::before {
    opacity: 1;
  }

  /* Styling for empty cells */
  .empty-cell {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.005) 100%);
    position: relative;
    overflow: hidden;
  }

  .empty-cell::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  .empty-cell:hover::before {
    opacity: 1;
  }

  /* Enhanced placeholder styling */
  .placeholder-cell {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .lanthanide-placeholder {
    background: linear-gradient(135deg, 
      rgba(147, 51, 234, 0.15) 0%, 
      rgba(147, 51, 234, 0.05) 50%,
      rgba(147, 51, 234, 0.1) 100%);
    box-shadow: 
      0 4px 16px rgba(147, 51, 234, 0.1),
      inset 0 1px 0 rgba(147, 51, 234, 0.2);
  }

  .lanthanide-placeholder:hover {
    background: linear-gradient(135deg, 
      rgba(147, 51, 234, 0.2) 0%, 
      rgba(147, 51, 234, 0.08) 50%,
      rgba(147, 51, 234, 0.15) 100%);
    box-shadow: 
      0 8px 32px rgba(147, 51, 234, 0.2),
      inset 0 1px 0 rgba(147, 51, 234, 0.3);
  }

  .actinide-placeholder {
    background: linear-gradient(135deg, 
      rgba(236, 72, 153, 0.15) 0%, 
      rgba(236, 72, 153, 0.05) 50%,
      rgba(236, 72, 153, 0.1) 100%);
    box-shadow: 
      0 4px 16px rgba(236, 72, 153, 0.1),
      inset 0 1px 0 rgba(236, 72, 153, 0.2);
  }

  .actinide-placeholder:hover {
    background: linear-gradient(135deg, 
      rgba(236, 72, 153, 0.2) 0%, 
      rgba(236, 72, 153, 0.08) 50%,
      rgba(236, 72, 153, 0.15) 100%);
    box-shadow: 
      0 8px 32px rgba(236, 72, 153, 0.2),
      inset 0 1px 0 rgba(236, 72, 153, 0.3);
  }

  /* Enhanced series labels styling */
  .series-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9em;
    padding: 0.75rem;
    min-height: 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .series-label::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  .series-label:hover::before {
    opacity: 1;
  }

  /* Animation classes */
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.5);
    }
  }

  /* Category-based color enhancements */
  .periodic-table-grid :global(.element-alkali-metal) {
    background: linear-gradient(135deg, 
      rgba(255, 99, 132, 0.2) 0%, 
      rgba(255, 99, 132, 0.1) 50%,
      rgba(255, 99, 132, 0.15) 100%);
    border-color: rgba(255, 99, 132, 0.4);
    box-shadow: 0 4px 16px rgba(255, 99, 132, 0.1);
  }

  .periodic-table-grid :global(.element-alkali-metal:hover) {
    box-shadow: 0 8px 32px rgba(255, 99, 132, 0.2);
    border-color: rgba(255, 99, 132, 0.6);
  }

  .periodic-table-grid :global(.element-alkaline-earth-metal) {
    background: linear-gradient(135deg, 
      rgba(54, 162, 235, 0.2) 0%, 
      rgba(54, 162, 235, 0.1) 50%,
      rgba(54, 162, 235, 0.15) 100%);
    border-color: rgba(54, 162, 235, 0.4);
    box-shadow: 0 4px 16px rgba(54, 162, 235, 0.1);
  }

  .periodic-table-grid :global(.element-alkaline-earth-metal:hover) {
    box-shadow: 0 8px 32px rgba(54, 162, 235, 0.2);
    border-color: rgba(54, 162, 235, 0.6);
  }

  .periodic-table-grid :global(.element-transition-metal) {
    background: linear-gradient(135deg, 
      rgba(255, 205, 86, 0.2) 0%, 
      rgba(255, 205, 86, 0.1) 50%,
      rgba(255, 205, 86, 0.15) 100%);
    border-color: rgba(255, 205, 86, 0.4);
    box-shadow: 0 4px 16px rgba(255, 205, 86, 0.1);
  }

  .periodic-table-grid :global(.element-transition-metal:hover) {
    box-shadow: 0 8px 32px rgba(255, 205, 86, 0.2);
    border-color: rgba(255, 205, 86, 0.6);
  }

  .periodic-table-grid :global(.element-noble-gas) {
    background: linear-gradient(135deg, 
      rgba(83, 102, 255, 0.2) 0%, 
      rgba(83, 102, 255, 0.1) 50%,
      rgba(83, 102, 255, 0.15) 100%);
    border-color: rgba(83, 102, 255, 0.4);
    box-shadow: 0 4px 16px rgba(83, 102, 255, 0.1);
  }

  .periodic-table-grid :global(.element-noble-gas:hover) {
    box-shadow: 0 8px 32px rgba(83, 102, 255, 0.2);
    border-color: rgba(83, 102, 255, 0.6);
  }

  .periodic-table-grid :global(.element-diatomic-nonmetal) {
    background: linear-gradient(135deg, 
      rgba(255, 159, 64, 0.2) 0%, 
      rgba(255, 159, 64, 0.1) 50%,
      rgba(255, 159, 64, 0.15) 100%);
    border-color: rgba(255, 159, 64, 0.4);
    box-shadow: 0 4px 16px rgba(255, 159, 64, 0.1);
  }

  .periodic-table-grid :global(.element-diatomic-nonmetal:hover) {
    box-shadow: 0 8px 32px rgba(255, 159, 64, 0.2);
    border-color: rgba(255, 159, 64, 0.6);
  }

  .periodic-table-grid :global(.element-lanthanide) {
    background: linear-gradient(135deg, 
      rgba(255, 99, 255, 0.2) 0%, 
      rgba(255, 99, 255, 0.1) 50%,
      rgba(255, 99, 255, 0.15) 100%);
    border-color: rgba(255, 99, 255, 0.4);
    box-shadow: 0 4px 16px rgba(255, 99, 255, 0.1);
  }

  .periodic-table-grid :global(.element-lanthanide:hover) {
    box-shadow: 0 8px 32px rgba(255, 99, 255, 0.2);
    border-color: rgba(255, 99, 255, 0.6);
  }

  .periodic-table-grid :global(.element-actinide) {
    background: linear-gradient(135deg, 
      rgba(255, 159, 255, 0.2) 0%, 
      rgba(255, 159, 255, 0.1) 50%,
      rgba(255, 159, 255, 0.15) 100%);
    border-color: rgba(255, 159, 255, 0.4);
    box-shadow: 0 4px 16px rgba(255, 159, 255, 0.1);
  }

  .periodic-table-grid :global(.element-actinide:hover) {
    box-shadow: 0 8px 32px rgba(255, 159, 255, 0.2);
    border-color: rgba(255, 159, 255, 0.6);
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    .periodic-table-container {
      padding: 1rem;
      margin: 1.5rem auto;
    }
    
    .periodic-table-grid {
      grid-template-columns: repeat(var(--cols, 18), minmax(46px, 1fr));
      grid-template-rows: repeat(var(--rows, 7), minmax(62px, auto));
      gap: 3px;
      max-width: 100vw;
    }
    
    .futuristic-grid {
      padding: 0.75rem;
    }
    
    .series-label {
      font-size: 0.85em;
      padding: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    .periodic-table-container {
      padding: 0.75rem;
      margin: 1rem auto;
    }
    
    .periodic-table-grid {
      grid-template-columns: repeat(var(--cols, 18), minmax(40px, 1fr));
      grid-template-rows: repeat(var(--rows, 7), minmax(56px, auto));
      gap: 2px;
      max-width: 100vw;
    }
    
    .lanthanide-row, .actinide-row {
      grid-template-columns: repeat(var(--cols, 17), minmax(40px, 1fr));
    }
    
    .futuristic-grid, .futuristic-series {
      padding: 0.5rem;
    }
    
    .series-label {
      font-size: 0.8em;
      min-height: 56px;
      padding: 0.25rem;
    }
    
    .placeholder-cell {
      min-height: 56px;
      padding: 0.25rem;
    }
    
    .empty-cell {
      min-height: 56px;
    }
  }

  @media (max-width: 480px) {
    .periodic-table-container {
      padding: 0.5rem;
      margin: 0.5rem auto;
    }
    
    .periodic-table-grid {
      grid-template-columns: repeat(var(--cols, 18), minmax(32px, 1fr));
      grid-template-rows: repeat(var(--rows, 7), minmax(48px, auto));
      gap: 1px;
    }
    
    .lanthanide-row, .actinide-row {
      grid-template-columns: repeat(var(--cols, 17), minmax(32px, 1fr));
    }
    
    .futuristic-grid, .futuristic-series {
      padding: 0.25rem;
    }
    
    .series-label {
      font-size: 0.7em;
      min-height: 48px;
      padding: 0.125rem;
    }
    
    .placeholder-cell {
      min-height: 48px;
      padding: 0.125rem;
    }
    
    .empty-cell {
      min-height: 48px;
    }
  }
</style> 
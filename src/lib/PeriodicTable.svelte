<script>
<!-- Import the ElementCell component -->
  import ElementCell from '$lib/ElementCell.svelte';
// Import the createEventDispatcher to dispatch custom events
  import { createEventDispatcher } from 'svelte';

// Props passed into the component
  export let elements = []; // Full list of elements from JSON
  export let maxC = 18; // Max columns for the main table
  export let maxR = 7;  // Max rows for the main table (not including lanthanides/actinides below)
  export let elementMap; // Map for quick lookup: `${xpos}-${ypos}` -> element

// Initialize the event dispatcher
  const dispatch = createEventDispatcher();

  // We need to handle lanthanides and actinides separately as they are usually shown below the main table.
  // The JSON data uses ypos 8 and 9 for these, but visually they are offset.
  // Let's define ranges for them based on atomic number.
  // Define the atomic number range for Lanthanides
  const lanthanideRange = { start: 57, end: 71 }; // La to Lu
  const actinideRange = { start: 89, end: 103 };  // Ac to Lr

  // Placeholder for Lanthanides and Actinides in the main table
  const lanthanidePlaceholder = { xpos: 3, ypos: 6, symbol: 'La-Lu', number: '57-71', name:'Lanthanides', category: 'lanthanide-placeholder' };
  const actinidePlaceholder = { xpos: 3, ypos: 7, symbol: 'Ac-Lr', number: '89-103', name:'Actinides', category: 'actinide-placeholder' };
  
  // Separate Lanthanides and Actinides for bottom rows
  let lanthanides = elements.filter(el => el.number >= lanthanideRange.start && el.number <= lanthanideRange.end);
  let actinides = elements.filter(el => el.number >= actinideRange.start && el.number <= actinideRange.end);

  // Adjust xpos for display in their own rows below the main table.
  // They will be displayed as a 15-element wide series.
  lanthanides.forEach((el, index) => el.display_xpos = index + 2); // Start at column 2 (after a gap)
  actinides.forEach((el, index) => el.display_xpos = index + 2);

  // Function to handle clicks on element cells.
  // Dispatches an event if a valid element is clicked (not a placeholder).
  function handleElementClick(element) {
    if (element && element.name && !element.name.includes('placeholder')) { // Do not trigger for placeholders
        dispatch('elementClick', element);
    }
  }

// The main container for the entire periodic table display.
</script>

<!-- The main periodic table grid -->
<div class="periodic-table-container">
  <div class="periodic-table-grid main-table">
    {#each Array(maxR) as _, r}
      {#each Array(maxC) as _, c}
        {@const x = c + 1}
        {@const y = r + 1}
        {@const key = `${x}-${y}`}
        {@const element = elementMap.get(key)}
        
        <!-- Render an ElementCell if it's a regular element in the main table -->
        {#if element && !(element.number >= lanthanideRange.start && element.number <= lanthanideRange.end) && !(element.number >= actinideRange.start && element.number <= actinideRange.end)}
          <ElementCell 
            {element} 
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
          />
        {:else if x === lanthanidePlaceholder.xpos && y === lanthanidePlaceholder.ypos}
           <!-- Render a placeholder for the Lanthanides in the main table -->
           <div class="element-cell placeholder lanthanide-placeholder" style="grid-column: {x}; grid-row: {y};">
            <div class="element-symbol">{lanthanidePlaceholder.number}</div>
            <div class="element-name">{lanthanidePlaceholder.name}</div>
          </div>
        {:else if x === actinidePlaceholder.xpos && y === actinidePlaceholder.ypos}
          <!-- Render a placeholder for the Actinides in the main table -->
          <div class="element-cell placeholder actinide-placeholder" style="grid-column: {x}; grid-row: {y};">
            <div class="element-symbol">{actinidePlaceholder.number}</div>
            <div class="element-name">{actinidePlaceholder.name}</div>
          </div>
        {:else if !elementMap.has(key) && !((x === 3 && y === 6) || (x === 3 && y ===7)) }
          <!-- Render an empty cell for gaps in the table structure -->
          <div class="empty-cell" style="grid-column: {x}; grid-row: {y};"></div>
        {/if}
      {/each}
    {/each}
  </div>

  {#if lanthanides.length > 0}
    <!-- Display the Lanthanide series if data exists -->
    <div class="periodic-table-grid lanthanide-row">
        <!-- Label for the Lanthanide series row -->
        <div class="series-label" style="grid-column: 1; grid-row: 1;">Lanthanides</div>
      <!-- Render each Lanthanide element -->
      {#each lanthanides as element, i}
        <ElementCell 
            element={{...element, xpos: element.display_xpos, ypos: 1 }} 
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
        />
      {/each}
    </div>
  {/if}

  {#if actinides.length > 0}
    <!-- Display the Actinide series if data exists -->
    <div class="periodic-table-grid actinide-row">
        <!-- Label for the Actinide series row -->
        <div class="series-label" style="grid-column: 1; grid-row: 1;">Actinides</div>
      <!-- Render each Actinide element -->
      {#each actinides as element, i}
        <ElementCell 
            element={{...element, xpos: element.display_xpos, ypos: 1}} 
            on:showWiki={e => dispatch('showWiki', e.detail)}
            on:showOrbitAnimation={e => dispatch('showOrbitAnimation', e.detail)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Component styling -->
<style>
  .periodic-table-container {
    margin: 20px auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center; 
    max-width: 100vw;
    overflow-x: auto;
    box-sizing: border-box;
  }

  .periodic-table-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 18), minmax(48px, 1fr));
    grid-template-rows: repeat(var(--rows, 7), minmax(60px, auto));
    gap: 2px;
    margin-bottom: 20px; /* Space between main table and series rows */
    width: fit-content;
    max-width: 100vw;
    overflow-x: auto;
  }
  /* Define grid variables for the main table */
  .main-table {
      --cols: 18;
      --rows: 7;
  }
  .lanthanide-row, .actinide-row {
      --cols: 17; /* 1 label + 15 elements + 1 for potential gap */
      --rows: 1;
      margin-top: 2px;
  }

  /* Styling for empty cells */
  .empty-cell {
    border: 1px dashed #eee;
    min-height: 80px;
  }
  /* Styling for placeholder cells (Lanthanides/Actinides in main table) */
  .placeholder {
    background-color: #e0e0e0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 0.8em;
    padding: 5px;
    border: 1px solid #ccc;
  }
  /* Styling for the symbol within placeholders */
  .placeholder .element-symbol {
      font-size: 1em;
      font-weight: bold;
  }
  /* Styling for the name within placeholders */
  .placeholder .element-name {
      font-size: 0.8em;
  }
  /* Specific background colors for placeholders */
  .lanthanide-placeholder { background-color: #ddffdd; }
  .actinide-placeholder { background-color: #ffdddd; }

  /* Styling for the series labels (Lanthanides/Actinides) */
  .series-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9em;
    padding: 5px;
    /* background-color: #f0f0f0; */
    border: 1px solid #ccc;
    min-height: 80px;
    text-align: center;
  }

  /* Override text color for better visibility on placeholders/labels */
  .lanthanide-placeholder, .actinide-placeholder, .series-label {
    color: #fff !important;
    background-color: inherit;
  }

  /* Responsive adjustments */
  @media (max-width: 1200px) {
    /* Adjust grid gap and element padding/font sizes for medium screens */
    .periodic-table-grid {
      gap: 1px;
      max-width: 100vw;
    }
    .element-cell {
      min-height: 90px; 
      padding: 3px;
    }
    .element-symbol { font-size: 1.2em; }
    .element-name { font-size: 0.65em; }
    .element-atomic-weight { font-size: 0.6em; }
    .element-orbital { font-size: 0.5em; }
  }

  @media (max-width: 768px) {
    /* Further adjust grid columns, rows, and element styling for smaller screens */
    .periodic-table-grid {
        grid-template-columns: repeat(var(--cols, 18), minmax(36px, 1fr));
        grid-template-rows: repeat(var(--rows, 7), minmax(48px, auto));
        max-width: 100vw;
    }
    .lanthanide-row, .actinide-row {
        grid-template-columns: repeat(var(--cols, 17), minmax(36px, 1fr));
    }
    .element-cell {
      min-height: 70px;
      padding: 2px;
    }
    .element-number { font-size: 0.6em; top: 1px; left: 1px;}
    .element-symbol { font-size: 1em; }
    .element-name { font-size: 0.55em; }
    .element-atomic-weight { font-size: 0.5em; }
    .element-orbital { display: none; } /* Hide orbital on very small screens */
    .series-label { font-size: 0.8em; min-height: 65px;}
  }
</style> 
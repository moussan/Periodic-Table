<script>
  import { createEventDispatcher } from 'svelte';
  export let element;

  const dispatch = createEventDispatcher();

  // Function to get a contrasting text color (black or white) based on background
  function getContrastingTextColor(hexColor) {
    if (!hexColor) return '#000000'; // Default to black if no color provided
    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Determine background and text color for the cell
  // Use cpk-hex if available, otherwise a default
  const bgColor = element && element['cpk-hex'] ? `#${element['cpk-hex']}` : '#f0f0f0';
  const textColor = element && element['cpk-hex'] ? getContrastingTextColor(element['cpk-hex']) : '#000000';

  $: orbitalFormula = element?.electron_configuration_semantic || element?.electron_configuration || 'N/A';

  function handleWikiClick(e) {
    e.stopPropagation();
    dispatch('showWiki', element);
  }

  function handleOrbitClick(e) {
    e.stopPropagation();
    dispatch('showOrbitAnimation', element);
  }
</script>

<div 
  class="element-cell {element?.category?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}" 
  style="grid-column: {element.xpos}; grid-row: {element.ypos}; background-color: {bgColor}; color: {textColor};"
  title="{element.name} ({element.category})\nAtomic Mass: {element.atomic_mass}\nDensity: {element.density}\nMelting Point: {element.melt}K\nBoiling Point: {element.boil}K"
>
  <button class="info-btn" title="More info" on:click={handleWikiClick} tabindex="0" aria-label="Show Wikipedia info">
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" fill="white"/>
      <line x1="10" y1="5" x2="10" y2="15" stroke="currentColor" stroke-width="2" />
      <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" stroke-width="2" />
    </svg>
  </button>
  <div class="element-number">{element.number}</div>
  <div class="element-symbol">{element.symbol}</div>
  <div class="element-name">{element.name}</div>
  <div class="element-atomic-weight">{(element.atomic_mass || 0).toFixed(3)}</div>
  <button class="element-orbital" title="Show orbital animation" on:click={handleOrbitClick} tabindex="0">
    {orbitalFormula}
  </button>
</div>

<style>
  .element-cell {
    border: 1px solid #ccc;
    padding: 5px;
    text-align: center;
    cursor: default;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    min-height: 100px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    transition: transform 0.15s cubic-bezier(.4,1.3,.6,1), box-shadow 0.15s;
  }

  .element-cell:hover,
  .element-cell:focus-visible {
    transform: scale(1.06);
    box-shadow: 0 4px 16px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10);
    z-index: 2;
  }

  .info-btn {
    position: absolute;
    top: 3px;
    right: 3px;
    background: rgba(255,255,255,0.8);
    border: none;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
    z-index: 2;
    color: #333;
    transition: background 0.2s;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .info-btn:hover, .info-btn:focus {
    background: #e0e0e0;
    outline: 2px solid #007bff;
  }

  .element-number {
    font-size: 0.7em;
    position: absolute;
    top: 3px;
    left: 3px;
  }

  .element-symbol {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.1em 0;
  }

  .element-name {
    font-size: 0.75em;
    word-wrap: break-word;
    hyphens: auto;
    margin-bottom: 0.2em;
  }

  .element-atomic-weight {
    font-size: 0.7em;
    margin-bottom: 0.2em;
  }
  .element-orbital {
    font-size: 0.6em;
    word-break: break-all;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    text-decoration: underline dotted;
    padding: 0;
    margin: 0;
    outline: none;
    transition: color 0.2s;
  }
  .element-orbital:hover, .element-orbital:focus {
    color: #007bff;
    background: #f0f8ff;
  }

  /* Example category styles - more can be added based on 'cpk-hex' or category names */
  .diatomic-nonmetal { background-color: #ccffcc; }
  .noble-gas { background-color: #ffcccc; }
  .alkali-metal { background-color: #ffddcc; }
  .alkaline-earth-metal { background-color: #ffffcc; }
  .metalloid { background-color: #ddddff; }
  .halogen { background-color: #ccffff; }
  .post-transition-metal { background-color: #cccccc; }
  .transition-metal { background-color: #ffccff; }
  .lanthanide { background-color: #ddffdd; }
  .actinide { background-color: #ffdddd; }
  .unknown { background-color: #f0f0f0; color: #333; }

</style> 
<script>
  import { createEventDispatcher } from 'svelte';
  
  export let element;
  const dispatch = createEventDispatcher();

  function handleWikiClick(e) {
    e.stopPropagation();
    dispatch('showWiki', element);
  }

  function handleOrbitClick(e) {
    e.stopPropagation();
    dispatch('showOrbitAnimation', element);
  }

  $: orbitalFormula = element?.electron_configuration_semantic || element?.electron_configuration || 'N/A';
  $: categoryClass = element?.category?.replace(/\s+/g, '-').toLowerCase() || 'unknown';
</script>

<div 
  class="element-cell element-{categoryClass} glass rounded-lg border border-white/20 p-2 relative flex flex-col justify-between min-h-[100px] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50"
  style="grid-column: {element.xpos}; grid-row: {element.ypos};"
  title="{element.name} ({element.category})"
>
  <!-- Info button -->
  <button 
    class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary/20 transition-all"
    on:click={handleWikiClick}
    aria-label="Show info for {element.name}"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/80">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,16,14"/>
      <circle cx="12" cy="17" r=".5"/>
    </svg>
  </button>

  <!-- Atomic number -->
  <div class="absolute top-1 left-1 text-xs font-medium px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/90">
    {element.number}
  </div>

  <!-- Element symbol -->
  <div class="text-2xl font-bold text-center mt-6 mb-1 text-white">
    {element.symbol}
  </div>

  <!-- Element name -->
  <div class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/90 mb-1 truncate">
    {element.name}
  </div>

  <!-- Atomic weight -->
  <div class="text-xs text-center px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/80 mb-2">
    {(element.atomic_mass || 0).toFixed(3)}
  </div>

  <!-- Orbital button -->
  <button 
    class="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 text-white/90 hover:bg-primary/20 transition-all font-mono truncate flex items-center justify-center gap-1"
    on:click={handleOrbitClick}
    aria-label="Show orbitals for {element.name}"
  >
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="1"/>
      <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
    </svg>
    <span class="truncate">{orbitalFormula}</span>
  </button>
</div>

<style>
  .element-alkali-metal {
    background: linear-gradient(135deg, rgba(255, 99, 132, 0.3) 0%, rgba(255, 99, 132, 0.1) 100%);
    border-color: rgba(255, 99, 132, 0.4);
  }
  
  .element-noble-gas {
    background: linear-gradient(135deg, rgba(83, 102, 255, 0.3) 0%, rgba(83, 102, 255, 0.1) 100%);
    border-color: rgba(83, 102, 255, 0.4);
  }
  
  .element-transition-metal {
    background: linear-gradient(135deg, rgba(255, 205, 86, 0.3) 0%, rgba(255, 205, 86, 0.1) 100%);
    border-color: rgba(255, 205, 86, 0.4);
  }
  
  .element-unknown {
    background: linear-gradient(135deg, rgba(201, 203, 207, 0.3) 0%, rgba(201, 203, 207, 0.1) 100%);
    border-color: rgba(201, 203, 207, 0.4);
  }
</style>
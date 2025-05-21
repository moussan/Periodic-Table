<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let element;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  let iframeStyle = "width: 100%; height: 100%; border: none;";
</script>

<div class="modal-backdrop" on:click={close} role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-content" on:click|stopPropagation>
    <header class="modal-header">
      <h2 id="modal-title">{element.name} ({element.symbol})</h2>
      <button class="modal-close-button" on:click={close} aria-label="Close modal">&times;</button>
    </header>
    <div class="modal-body">
        {#if element.source}
            <iframe 
                src={element.source} 
                title={element.name + ' Wikipedia'}
                style={iframeStyle}
                sandbox="allow-scripts allow-same-origin allow-popups" 
                loading="lazy"
                referrerpolicy="no-referrer"
            ></iframe>
        {:else}
            <p>No Wikipedia source URL available for this element.</p>
        {/if}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* To contain the iframe */
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.8em;
    color: #333;
  }

  .modal-close-button {
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: #888;
  }
  .modal-close-button:hover {
      color: #333;
  }

  .modal-body {
    flex-grow: 1; /* Allows iframe to fill space */
    overflow-y: auto; /* Scroll if content overflows, though iframe should handle its own */
    position: relative; /* For iframe absolute positioning if needed */
  }

  .modal-body iframe {
    /* Styles are applied inline now for dynamic filter */
  }

  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      height: 90%;
      padding: 15px;
    }
    .modal-header h2 {
      font-size: 1.4em;
    }
    .modal-close-button {
        font-size: 1.8em;
    }
  }
</style> 
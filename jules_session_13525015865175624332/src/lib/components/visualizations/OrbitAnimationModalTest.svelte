<script>
  import OrbitAnimationModal from '../../OrbitAnimationModal.svelte';
  
  // Test element data
  const testElement = {
    number: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomic_mass: 1.008,
    electron_configuration: '1s1',
    electron_configuration_semantic: '1s¹',
    shells: [1],
    category: 'nonmetal',
    period: 1,
    group: 1,
    block: 's'
  };
  
  let showModal = false;
  
  function openModal() {
    showModal = true;
  }
  
  function closeModal() {
    showModal = false;
  }
</script>

<div class="test-container">
  <h2>OrbitAnimationModal Test</h2>
  <button on:click={openModal}>Open Orbital Modal</button>
  
  {#if showModal}
    <OrbitAnimationModal 
      element={testElement}
      on:close={closeModal}
    />
  {/if}
</div>

<style>
  .test-container {
    padding: 20px;
    text-align: center;
  }
  
  button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background: #0056b3;
  }
</style>
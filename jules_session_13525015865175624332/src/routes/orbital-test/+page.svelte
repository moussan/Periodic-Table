<script lang="ts">
  import OrbitalViewerTest from '$lib/components/visualizations/OrbitalViewerTest.svelte';
</script>

<svelte:head>
  <title>Orbital Viewer Test</title>
</svelte:head>

<main>
  <OrbitalViewerTest />
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e);
    padding: 20px;
  }
</style>
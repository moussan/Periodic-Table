<script>
  export let value = '';
  export let type = 'text';
  let className = '';
  export { className as class };
</script>

<input
  type="text"
  bind:value
  class="input {className}"
  {...$$restProps}
  on:input
  on:change
  on:keydown
  on:focus
  on:blur
/>

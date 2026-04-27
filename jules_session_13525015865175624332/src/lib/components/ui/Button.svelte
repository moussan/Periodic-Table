<script>
  export let variant = 'default';
  export let size = 'default';
  let className = '';
  export { className as class };
</script>

<button
  class="btn {variant !== 'default' ? 'btn-' + variant : ''} {size !== 'default' ? 'btn-' + size : ''} {className}"
  {...$$restProps}
  on:click
>
  <slot />
</button>

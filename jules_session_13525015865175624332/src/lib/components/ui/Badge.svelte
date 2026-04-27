<script>
  export let variant = 'default';
  let className = '';
  export { className as class };
</script>

<span
  class="badge {variant !== 'default' ? 'badge-' + variant : ''} {className}"
  {...$$restProps}
>
  <slot />
</span>

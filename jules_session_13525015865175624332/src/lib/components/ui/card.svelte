<script lang="ts">
  import { cn } from '$lib/utils';
  
  let className: string = '';
  export { className as class };
</script>

<div class={cn('glass rounded-lg border shadow-sm', className)} {...$$restProps}>
  <slot />
</div>
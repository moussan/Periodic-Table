<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui';

  const dispatch = createEventDispatcher();

  // Component props
  export let isOpen = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let variant: 'default' | 'destructive' = 'default';

  function handleConfirm() {
    dispatch('confirm');
    isOpen = false;
  }

  function handleCancel() {
    dispatch('cancel');
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter') {
      handleConfirm();
    }
  }
</script>

{#if isOpen}
  <div class="dialog-overlay" on:click={handleCancel} on:keydown={handleKeydown}>
    <div class="dialog glass" on:click|stopPropagation>
      <div class="dialog-header">
        <h3 class="dialog-title">{title}</h3>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-message">{message}</p>
      </div>
      
      <div class="dialog-actions">
        <Button
          variant="ghost"
          on:click={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          on:click={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .dialog {
    width: 100%;
    max-width: 400px;
    border-radius: var(--radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    overflow: hidden;
  }

  .dialog-header {
    padding: var(--space-lg) var(--space-lg) var(--space-md) var(--space-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .dialog-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .dialog-content {
    padding: var(--space-md) var(--space-lg);
  }

  .dialog-message {
    font-size: var(--font-size-base);
    color: hsl(var(--muted-foreground));
    margin: 0;
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg) var(--space-lg) var(--space-lg);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .dialog-overlay {
      padding: var(--space-md);
    }

    .dialog-actions {
      flex-direction: column-reverse;
    }

    .dialog-actions :global(button) {
      width: 100%;
    }
  }
</style>
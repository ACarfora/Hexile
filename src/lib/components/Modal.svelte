<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  type Props = {
    open: boolean;
    title?: string;
    titleAlign?: 'start' | 'center';
    description?: string;
    /** Click on the backdrop closes the modal. Default true. */
    closeOnBackdrop?: boolean;
    /** Pressing Escape closes the modal. Default true. */
    closeOnEscape?: boolean;
    /** Optional callback fired after the modal closes. */
    onclose?: () => void;
    children: Snippet;
    actions?: Snippet;
  };

  let {
    open = $bindable(),
    title,
    titleAlign = 'start',
    description,
    closeOnBackdrop = true,
    closeOnEscape = true,
    onclose,
    children,
    actions
  }: Props = $props();

  let dialogEl = $state<HTMLDivElement | null>(null);
  let lastFocused: HTMLElement | null = null;

  function close() {
    open = false;
    onclose?.();
  }

  function focusFirst() {
    if (!dialogEl) return;
    const target = dialogEl.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    target?.focus();
  }

  function handleKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape' && closeOnEscape) {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab' || !dialogEl) return;
    const focusables = Array.from(
      dialogEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !dialogEl.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleBackdrop(e: MouseEvent) {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) close();
  }

  $effect(() => {
    if (!open) return;
    lastFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
      lastFocused?.focus?.();
    };
  });

  // Once the dialog is in the DOM, hand it focus.
  $effect(() => {
    if (open && dialogEl) focusFirst();
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="backdrop"
    onclick={handleBackdrop}
    transition:fade={{ duration: 180 }}
  >
    <div
      bind:this={dialogEl}
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
      transition:scale={{ duration: 220, start: 0.94, opacity: 0 }}
    >
      {#if title}
        <h2 id="modal-title" class="title" style:text-align={titleAlign}>{title}</h2>
      {/if}
      {#if description}
        <p id="modal-desc" class="desc">{description}</p>
      {/if}
      <div class="body">
        {@render children()}
      </div>
      {#if actions}
        <div class="actions">
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .dialog {
    background: var(--page-bg);
    color: var(--page-fg);
    border-radius: 16px;
    padding: 24px 24px 20px;
    max-width: 380px;
    width: 100%;
    font-family: var(--font-body);
  }
  .title {
    margin: 0 0 4px;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 20px;
    line-height: 1.25;
  }
  .desc {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--page-fg-muted);
    line-height: 1.5;
  }
  .body {
    font-size: 15px;
    line-height: 1.5;
  }
  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .backdrop,
    .dialog {
      transition: none;
    }
  }
</style>

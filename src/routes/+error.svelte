<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const status = $derived(page.status);
  const errorMessage = $derived(page.error?.message ?? '');

  const heading = $derived(status === 404 ? 'Page not found' : 'Something went wrong');
  const subline = $derived(
    status === 404
      ? 'The page you were looking for doesn’t exist.'
      : 'An unexpected error occurred. You can head back and try again.'
  );
</script>

<svelte:head>
  <title>Hexile — {status}</title>
</svelte:head>

<main class="error-page">
  <div class="error-card">
    <div class="status" aria-hidden="true">{status}</div>
    <h1 class="heading">{heading}</h1>
    <p class="subline">{subline}</p>
    {#if errorMessage && status !== 404}
      <p class="detail">{errorMessage}</p>
    {/if}
    <div class="actions">
      <button type="button" class="btn-primary" onclick={() => goto('/')}>Back to menu</button>
    </div>
  </div>
</main>

<style>
  .error-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--page-bg);
    color: var(--page-fg);
  }
  .error-card {
    max-width: 360px;
    width: 100%;
    text-align: center;
    font-family: var(--font-body);
  }
  .status {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: clamp(72px, 18vw, 112px);
    line-height: 1;
    color: var(--color-accent);
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    font-variant-numeric: tabular-nums;
  }
  .heading {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 24px;
    line-height: 1.2;
    margin: 0 0 8px;
  }
  .subline {
    color: var(--page-fg-muted);
    font-size: 15px;
    line-height: 1.5;
    margin: 0 0 16px;
  }
  .detail {
    font-size: 13px;
    color: var(--page-fg-muted);
    background: var(--hover-soft);
    border-radius: 10px;
    padding: 10px 14px;
    margin: 0 0 24px;
    word-break: break-word;
    text-align: left;
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  }
  .actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
</style>

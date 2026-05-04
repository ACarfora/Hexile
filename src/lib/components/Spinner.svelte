<script lang="ts">
  let { caption = 'Generating puzzle…' }: { caption?: string } = $props();
</script>

<div class="wrap" role="status" aria-live="polite">
  <div class="dots" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div class="caption">{caption}</div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
  }
  .dots {
    display: flex;
    gap: 10px;
  }
  .dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-accent);
    animation: bounce 1.2s infinite ease-in-out both;
  }
  .dots span:nth-child(1) {
    animation-delay: -0.32s;
  }
  .dots span:nth-child(2) {
    animation-delay: -0.16s;
  }
  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0.4);
      opacity: 0.3;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .caption {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--page-fg-muted);
  }
  @media (prefers-reduced-motion: reduce) {
    .dots span {
      animation: none;
      opacity: 0.6;
    }
  }
</style>

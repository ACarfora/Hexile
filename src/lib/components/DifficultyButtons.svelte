<script lang="ts">
  import type { Difficulty } from '$lib/game/types';

  type Props = { onselect: (difficulty: Difficulty) => void };
  let { onselect }: Props = $props();

  const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

  function label(d: Difficulty): string {
    return d.charAt(0).toUpperCase() + d.slice(1);
  }
</script>

<div class="buttons">
  {#each DIFFICULTIES as d, i (d)}
    <button
      type="button"
      class="btn"
      style="animation-delay: {200 + i * 80}ms"
      onclick={() => onselect(d)}
    >
      {label(d)}
    </button>
  {/each}
</div>

<style>
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    align-items: center;
  }

  .btn {
    width: clamp(180px, 50%, 220px);
    border: 0;
    border-radius: 999px;
    background: #1c1c1c;
    color: #ffffff;
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 500;
    padding: 14px 24px;
    cursor: pointer;
    transition:
      transform 140ms ease,
      background-color 140ms ease;
    animation: btn-in 480ms cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
  }

  .btn:hover {
    background: #000000;
    transform: translateY(-1px);
  }

  .btn:active {
    transform: scale(0.97);
  }

  .btn:focus-visible {
    outline: 3px solid var(--color-accent-soft);
    outline-offset: 3px;
  }

  @keyframes btn-in {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn {
      animation: none;
      transition: none;
    }
    .btn:hover,
    .btn:active {
      transform: none;
    }
  }
</style>

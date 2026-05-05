<script lang="ts">
  import { goto } from '$app/navigation';
  import { game } from '$lib/stores/game.svelte';
  import { timer, formatTime } from '$lib/stores/timer.svelte';
  import { theme } from '$lib/stores/theme.svelte';
  import Modal from '$lib/components/Modal.svelte';

  type Props = {
    onnewgame?: () => void;
    onrestart?: () => void;
  };
  let { onnewgame, onrestart }: Props = $props();

  const difficulty = $derived(game.state?.puzzle.difficulty ?? '');
  let helpOpen = $state(false);
  let confirmNewGameOpen = $state(false);
  let confirmRestartOpen = $state(false);

  function startNewGame() {
    confirmNewGameOpen = false;
    onnewgame?.();
  }

  function startRestart() {
    confirmRestartOpen = false;
    onrestart?.();
  }
</script>

<header>
  <div class="left">
    <button class="iconbtn" aria-label="Back to menu" onclick={() => goto('/')}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="15 6 9 12 15 18" />
      </svg>
    </button>
    <button class="iconbtn" aria-label="How to play" onclick={() => (helpOpen = true)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  </div>

  <div class="centre">
    <button
      class="iconbtn"
      aria-label={timer.paused ? 'Resume' : 'Pause'}
      onclick={() => timer.togglePause()}
    >
      {#if timer.paused}
        <svg viewBox="0 0 24 24" aria-hidden="true" class="filled">
          <polygon points="7 5 19 12 7 19" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true" class="filled">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      {/if}
    </button>
    <div class="difficulty">{difficulty}</div>
  </div>

  <div class="right">
    <button class="iconbtn" aria-label="Toggle dark mode" onclick={() => theme.toggle()}>
      {#if theme.current === 'dark'}
        <svg viewBox="0 0 24 24" aria-hidden="true" class="filled">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
        </svg>
      {/if}
    </button>
    <div class="timer">{formatTime(timer.elapsed)}</div>
  </div>
</header>

<Modal bind:open={helpOpen} title="How to play">
  <p class="help-text">
    Fill the numbers 1-6 once in every hexagon so that where the hexagons touch, the numbers are
    the same. No number is repeated in any single hexagon.
  </p>

  {#snippet actions()}
    <button type="button" class="btn-primary" onclick={() => (helpOpen = false)}>Got it</button>
  {/snippet}
</Modal>

<Modal
  open={timer.paused && !confirmNewGameOpen && !confirmRestartOpen}
  title="Paused"
  titleAlign="center"
  closeOnBackdrop={false}
  closeOnEscape={false}
  onclose={() => timer.resume()}
>
  <div class="paused-content">
    <div class="paused-time">{formatTime(timer.elapsed)}</div>
    <button type="button" class="btn-primary" onclick={() => timer.resume()}>Resume</button>
    <button type="button" class="btn-ghost" onclick={() => (confirmRestartOpen = true)}>
      Restart game
    </button>
    <button type="button" class="btn-ghost" onclick={() => (confirmNewGameOpen = true)}>
      New Game
    </button>
  </div>
</Modal>

<Modal bind:open={confirmRestartOpen} title="Are you sure?">
  <p class="confirm-text">Restarting will clear all your entries and reset the timer.</p>

  {#snippet actions()}
    <button type="button" class="btn-ghost" onclick={() => (confirmRestartOpen = false)}>
      No
    </button>
    <button type="button" class="btn-primary" onclick={startRestart}>Yes</button>
  {/snippet}
</Modal>

<Modal bind:open={confirmNewGameOpen} title="Are you sure?">
  <p class="confirm-text">Starting a new game will discard your current progress.</p>

  {#snippet actions()}
    <button type="button" class="btn-ghost" onclick={() => (confirmNewGameOpen = false)}>
      No
    </button>
    <button type="button" class="btn-primary" onclick={startNewGame}>Yes</button>
  {/snippet}
</Modal>

<style>
  header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto;
    align-items: center;
    padding: 14px 20px 6px;
    column-gap: 12px;
  }

  @media (max-width: 480px) {
    header {
      padding: 8px 16px 4px;
    }
  }
  .left {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .centre,
  .right {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .centre {
    align-items: center;
  }
  .right {
    align-items: flex-end;
  }
  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--page-fg);
    cursor: pointer;
    transition: background-color 120ms ease;
  }
  .iconbtn:hover {
    background: var(--hover-soft);
  }
  .iconbtn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .iconbtn svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .iconbtn svg.filled {
    fill: currentColor;
    stroke: none;
  }
  .difficulty {
    font-size: 14px;
    font-weight: 500;
    color: var(--page-fg);
    text-transform: lowercase;
    min-height: 18px;
    line-height: 1.2;
  }
  .timer {
    font-variant-numeric: tabular-nums;
    font-size: 22px;
    font-weight: 700;
    color: var(--page-fg);
    line-height: 1;
  }
  .help-text {
    margin: 0;
    line-height: 1.55;
  }

  .paused-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .paused-time {
    font-family: var(--font-heading);
    font-size: 56px;
    font-weight: 700;
    color: var(--color-accent);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .paused-content button {
    min-width: 160px;
  }
  .confirm-text {
    margin: 0;
    line-height: 1.55;
  }
</style>

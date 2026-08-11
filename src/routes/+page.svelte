<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import HexCluster from '$lib/components/HexCluster.svelte';
  import DifficultyButtons from '$lib/components/DifficultyButtons.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { peekSavedDifficulty, clearSavedGameAndTimer, game } from '$lib/stores/game.svelte';
  import { timer, formatTime } from '$lib/stores/timer.svelte';
  import { records } from '$lib/stores/records.svelte';
  import type { Difficulty } from '$lib/game/types';

  const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

  let today = $state('');
  let isoDate = $state('');

  let confirmOpen = $state(false);
  let bestsOpen = $state(false);
  let pendingDifficulty = $state<Difficulty | null>(null);
  let savedDifficulty = $state<Difficulty | null>(null);

  onMount(() => {
    const now = new Date();
    isoDate = now.toISOString().slice(0, 10);
    today = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
  });

  function selectDifficulty(difficulty: Difficulty) {
    const saved = peekSavedDifficulty();
    if (saved && saved !== difficulty) {
      savedDifficulty = saved;
      pendingDifficulty = difficulty;
      confirmOpen = true;
      return;
    }
    goto(`/play?difficulty=${difficulty}`);
  }

  function confirmDiscard() {
    if (!pendingDifficulty) return;
    const target = pendingDifficulty;
    game.discard();
    clearSavedGameAndTimer();
    timer.reset();
    confirmOpen = false;
    pendingDifficulty = null;
    savedDifficulty = null;
    goto(`/play?difficulty=${target}`);
  }

  function cancelDiscard() {
    confirmOpen = false;
    pendingDifficulty = null;
    savedDifficulty = null;
  }
</script>

<svelte:head>
  <title>Hexile</title>
</svelte:head>

<main class="landing">
  <div class="landing__inner">
    <div class="brand">
      <div class="brand__hex">
        <HexCluster />
      </div>
      <h1 class="title">Hexile</h1>
    </div>

    <DifficultyButtons onselect={selectDifficulty} />

    <div class="footer-group">
      <time class="today" datetime={isoDate}>{today}</time>
      <button type="button" class="bests-btn" onclick={() => (bestsOpen = true)}>
        Personal Bests
      </button>
    </div>
  </div>
</main>

<Modal bind:open={confirmOpen} title="Discard current game?" onclose={cancelDiscard}>
  <p class="modal-body-text">
    You have an unfinished
    <strong>{savedDifficulty ?? ''}</strong>
    game. Starting a new
    <strong>{pendingDifficulty ?? ''}</strong>
    puzzle will discard your current progress.
  </p>

  {#snippet actions()}
    <button type="button" class="btn-ghost" onclick={cancelDiscard}>Cancel</button>
    <button type="button" class="btn-primary" onclick={confirmDiscard}>
      Discard &amp; start
    </button>
  {/snippet}
</Modal>

<Modal bind:open={bestsOpen} title="Personal Bests">
  <ul class="bests-list">
    {#each DIFFICULTIES as d (d)}
      {@const best = records.best[d]}
      <li class="bests-row">
        <span class="bests-diff">{d}</span>
        <span class="bests-time" class:empty={!best}>
          {best ? formatTime(best.timeMs) : '—'}
        </span>
      </li>
    {/each}
  </ul>

  {#snippet actions()}
    <button type="button" class="btn-primary" onclick={() => (bestsOpen = false)}>Close</button>
  {/snippet}
</Modal>

<style>
  .landing {
    background: var(--color-accent);
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    overflow: hidden;
  }

  .landing__inner {
    max-width: 480px;
    margin: 0 auto;
    padding: clamp(48px, 12vh, 96px) 24px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(24px, 6vh, 48px);
  }

  .brand {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    animation: brand-in 600ms cubic-bezier(0.2, 0.7, 0.3, 1) 80ms backwards;
  }

  .brand__hex {
    width: clamp(160px, 45%, 220px);
  }

  .title {
    margin: 0;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: clamp(40px, 12vw, 56px);
    color: #111111;
    letter-spacing: -0.01em;
    line-height: 1;
  }

  .footer-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .today {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 15px;
    color: #111111;
    text-align: center;
    min-height: 1.4em;
    animation: brand-in 600ms cubic-bezier(0.2, 0.7, 0.3, 1) 480ms backwards;
  }

  .bests-btn {
    border: 1.5px solid rgba(17, 17, 17, 0.5);
    border-radius: 999px;
    background: transparent;
    color: #111111;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 700;
    padding: 8px 22px;
    cursor: pointer;
    transition: background-color 140ms ease;
    animation: brand-in 600ms cubic-bezier(0.2, 0.7, 0.3, 1) 560ms backwards;
  }
  .bests-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  .bests-btn:focus-visible {
    outline: 3px solid var(--color-accent-soft);
    outline-offset: 3px;
  }

  .bests-list {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .bests-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 10px 2px;
  }
  .bests-row + .bests-row {
    border-top: 1px solid var(--hover-soft);
  }
  .bests-diff {
    font-weight: 600;
    text-transform: capitalize;
  }
  .bests-time {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .bests-time.empty {
    color: var(--page-fg-muted);
    font-weight: 400;
  }

  .modal-body-text {
    margin: 0;
  }
  .modal-body-text strong {
    text-transform: capitalize;
    font-weight: 700;
  }

  @keyframes brand-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .brand,
    .today,
    .bests-btn {
      animation: none;
    }
  }
</style>

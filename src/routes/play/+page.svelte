<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import GeneratorWorker from '$lib/workers/generator.worker?worker';
  import TopBar from '$lib/components/TopBar.svelte';
  import Board from '$lib/components/Board.svelte';
  import Numpad from '$lib/components/Numpad.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { game } from '$lib/stores/game.svelte';
  import { timer, formatTime } from '$lib/stores/timer.svelte';
  import { getBoard } from '$lib/game/state';
  import { isWon } from '$lib/game/validate';
  import type { Difficulty } from '$lib/game/types';
  import type { WorkerResponse } from '$lib/workers/generator.worker';

  const VALID: Difficulty[] = ['easy', 'medium', 'hard'];

  let loading = $state(false);
  let error = $state<string | null>(null);
  let solvedOpen = $state(false);
  let solvedSnapshot = $state<{ time: string; difficulty: Difficulty } | null>(null);
  let worker: Worker | null = null;

  function difficultyFromUrl(): Difficulty {
    const d = page.url.searchParams.get('difficulty');
    return VALID.includes(d as Difficulty) ? (d as Difficulty) : 'medium';
  }

  function generate(difficulty: Difficulty) {
    loading = true;
    error = null;
    worker?.terminate();
    worker = new GeneratorWorker();
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === 'success') {
        timer.reset();
        game.startNew(e.data.puzzle);
      } else {
        error = e.data.message;
      }
      loading = false;
    };
    worker.onerror = (e) => {
      error = e.message || 'Worker failed';
      loading = false;
    };
    worker.postMessage({ type: 'generate', difficulty });
  }

  onMount(() => {
    if (!game.state) generate(difficultyFromUrl());
    return () => worker?.terminate();
  });

  function handleKey(e: KeyboardEvent) {
    if (timer.paused || loading || solvedOpen) return;
    if (!game.state) return;
    if (game.selectedHex === null || game.selectedTri === null) return;
    if (e.key >= '1' && e.key <= '6') {
      timer.begin();
      game.setEntry(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      timer.begin();
      game.clearEntry();
    }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const won = $derived.by(() => {
    if (!game.state) return false;
    return isWon(getBoard(game.state));
  });

  // Open the completion modal when the puzzle is solved.
  // We snapshot the time + difficulty so the modal keeps showing them even
  // after the action buttons clear the underlying state.
  $effect(() => {
    if (!won || !game.state) return;
    timer.stop();
    solvedSnapshot = {
      time: formatTime(timer.elapsed),
      difficulty: game.state.puzzle.difficulty
    };
    solvedOpen = true;
  });

  function startNewPuzzle(difficulty: Difficulty) {
    game.discard();
    timer.reset();
    generate(difficulty);
  }

  function backToMenu() {
    solvedOpen = false;
    game.discard();
    timer.reset();
    goto('/');
  }

  function playAgain() {
    if (!solvedSnapshot) return;
    solvedOpen = false;
    startNewPuzzle(solvedSnapshot.difficulty);
  }

  function newGameSameDifficulty() {
    if (!game.state) return;
    startNewPuzzle(game.state.puzzle.difficulty);
  }

  function restartPuzzle() {
    if (!game.state) return;
    game.startNew(game.state.puzzle);
    timer.reset();
  }
</script>

<svelte:head>
  <title>Hexile — Play</title>
</svelte:head>

<div class="play" class:paused={timer.paused}>
  <TopBar onnewgame={newGameSameDifficulty} onrestart={restartPuzzle} />

  {#if loading}
    <main class="state">
      <Spinner />
    </main>
  {:else if error}
    <main class="state">
      <div class="error-card">
        <p class="title">Couldn't generate puzzle.</p>
        <p class="msg">{error}</p>
        <div class="actions">
          <button class="btn-primary" onclick={() => generate(difficultyFromUrl())}>
            Try again
          </button>
          <button class="btn-ghost" onclick={() => goto('/')}>Back</button>
        </div>
      </div>
    </main>
  {:else if game.state}
    <main class="board-area">
      <Board />
    </main>
    <footer class="numpad-area">
      <Numpad />
    </footer>
  {/if}
</div>

<Modal bind:open={solvedOpen} title="Solved!" closeOnBackdrop={false}>
  <div class="solved-time">{solvedSnapshot?.time ?? ''}</div>
  <div class="solved-meta">{solvedSnapshot?.difficulty ?? ''} puzzle</div>

  {#snippet actions()}
    <button type="button" class="btn-ghost" onclick={backToMenu}>Back to menu</button>
    <button type="button" class="btn-primary" onclick={playAgain}>Play again</button>
  {/snippet}
</Modal>

<style>
  .play {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
  }

  .play.paused .board-area,
  .play.paused .numpad-area {
    opacity: 0.4;
    pointer-events: none;
    transition: opacity 200ms ease;
  }

  .state {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .board-area {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    position: relative;
  }
  .numpad-area {
    flex: 0 0 auto;
    padding: 8px 16px 24px;
  }

  .error-card {
    text-align: center;
    font-family: var(--font-body);
    max-width: 320px;
  }
  .error-card .title {
    font-weight: 700;
    margin: 0 0 4px;
  }
  .error-card .msg {
    opacity: 0.6;
    font-size: 13px;
    margin: 0 0 20px;
  }
  .error-card .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  /* Completion modal contents */
  .solved-time {
    font-family: var(--font-heading);
    font-size: 56px;
    font-weight: 700;
    color: var(--color-accent);
    text-align: center;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin: 4px 0 6px;
  }
  .solved-meta {
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--page-fg-muted);
    text-transform: capitalize;
  }
</style>

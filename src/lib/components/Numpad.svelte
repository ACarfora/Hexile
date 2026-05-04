<script lang="ts">
  import { game } from '$lib/stores/game.svelte';
  import { timer } from '$lib/stores/timer.svelte';
  import { getValue } from '$lib/game/state';

  type Cell = { value: number | 'erase'; label: string; x: number; y: number };

  const POSITIONS: Cell[] = [
    { value: 1, label: '1', x: -62.35, y: 0 },
    { value: 2, label: '2', x: -20.78, y: 0 },
    { value: 3, label: '3', x: 20.78, y: 0 },
    { value: 4, label: '4', x: 62.35, y: 0 },
    { value: 5, label: '5', x: -41.57, y: 36 },
    { value: 6, label: '6', x: 0, y: 36 },
    { value: 'erase', label: 'X', x: 41.57, y: 36 }
  ];

  const HEX_POINTS = '0,-24 20.78,-12 20.78,12 0,24 -20.78,12 -20.78,-12';

  const activeValue = $derived.by<number | null>(() => {
    if (!game.state || game.selectedHex === null || game.selectedTri === null) return null;
    return getValue(game.state, game.selectedHex, game.selectedTri) ?? null;
  });

  function handleClick(value: number | 'erase') {
    if (timer.paused) return;
    timer.begin();
    if (value === 'erase') game.clearEntry();
    else game.setEntry(value);
  }

  function handleKey(e: KeyboardEvent, value: number | 'erase') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(value);
    }
  }
</script>

<svg viewBox="-86 -28 172 92" class="numpad-svg" aria-label="Number pad">
  {#each POSITIONS as pos (pos.value)}
    <g
      class={['numpad-btn', { active: pos.value !== 'erase' && activeValue === pos.value }]}
      transform="translate({pos.x} {pos.y})"
      role="button"
      tabindex="0"
      aria-label={pos.value === 'erase' ? 'Erase' : `Enter ${pos.value}`}
      onclick={() => handleClick(pos.value)}
      onkeydown={(e) => handleKey(e, pos.value)}
    >
      <polygon points={HEX_POINTS} class="numpad-hex" />
      <text text-anchor="middle" dominant-baseline="central" class="numpad-label">{pos.label}</text>
    </g>
  {/each}
</svg>

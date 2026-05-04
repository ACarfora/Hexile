<script lang="ts">
  import { HEXES, HEX_VERTICES, BOARD_BOUNDS, cellKey } from '$lib/game/layout';
  import { findConflicts } from '$lib/game/validate';
  import { isGiven, getValue } from '$lib/game/state';
  import { game } from '$lib/stores/game.svelte';
  import { timer } from '$lib/stores/timer.svelte';

  const PADDING = 10;
  const VB_X = BOARD_BOUNDS.minX - PADDING;
  const VB_Y = BOARD_BOUNDS.minY - PADDING;
  const VB_W = BOARD_BOUNDS.maxX - BOARD_BOUNDS.minX + PADDING * 2;
  const VB_H = BOARD_BOUNDS.maxY - BOARD_BOUNDS.minY + PADDING * 2;

  const TRI_INDICES = [0, 1, 2, 3, 4, 5] as const;
  const OUTLINE_POINTS = HEX_VERTICES.map((v) => `${v.x},${v.y}`).join(' ');

  function vertexPoints(tri: number): string {
    const v1 = HEX_VERTICES[tri];
    const v2 = HEX_VERTICES[(tri + 1) % 6];
    return `0,0 ${v1.x},${v1.y} ${v2.x},${v2.y}`;
  }

  function textPos(tri: number): { x: number; y: number } {
    const v1 = HEX_VERTICES[tri];
    const v2 = HEX_VERTICES[(tri + 1) % 6];
    return { x: (v1.x + v2.x) / 3, y: (v1.y + v2.y) / 3 };
  }

  const board = $derived.by(() => {
    if (!game.state) return {};
    return { ...game.state.puzzle.givens, ...game.state.entries };
  });

  const conflicts = $derived(findConflicts(board));

  function handleClick(hex: number, tri: number) {
    if (timer.paused) return;
    if (!game.state) return;
    timer.begin();
    if (isGiven(game.state, hex, tri)) {
      game.clearSelection();
      return;
    }
    game.select(hex, tri);
  }

  function handleKey(e: KeyboardEvent, hex: number, tri: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(hex, tri);
    }
  }
</script>

<svg viewBox="{VB_X} {VB_Y} {VB_W} {VB_H}" preserveAspectRatio="xMidYMid meet" class="board">
  {#each HEXES as hex (hex.id)}
    <g class="hex" transform="translate({hex.cx} {hex.cy})">
      {#each TRI_INDICES as tri (tri)}
        {@const key = cellKey(hex.id, tri)}
        {@const value = game.state ? getValue(game.state, hex.id, tri) : undefined}
        {@const given = game.state ? isGiven(game.state, hex.id, tri) : false}
        {@const selected = game.selectedHex === hex.id && game.selectedTri === tri}
        {@const conflict = conflicts.has(key)}
        {@const pos = textPos(tri)}
        <polygon
          points={vertexPoints(tri)}
          class={['tri', { selected, conflict, given }]}
          role="button"
          tabindex="-1"
          aria-label={`Hex ${hex.id} segment ${tri + 1}${value !== undefined ? `, value ${value}` : ''}`}
          onclick={() => handleClick(hex.id, tri)}
          onkeydown={(e) => handleKey(e, hex.id, tri)}
        />
        <text
          x={pos.x}
          y={pos.y}
          class={['tri-text', { given, conflict, selected }]}
          text-anchor="middle"
          dominant-baseline="central">{value ?? ''}</text
        >
      {/each}
      <polygon points={OUTLINE_POINTS} class="hex-outline" />
    </g>
  {/each}
</svg>

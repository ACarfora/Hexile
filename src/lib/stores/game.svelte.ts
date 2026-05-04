import { browser } from '$app/environment';
import {
  newState,
  setEntry as pureSetEntry,
  clearEntry as pureClearEntry
} from '$lib/game/state';
import type { Difficulty, GameState, Puzzle } from '$lib/game/types';

const STORAGE_KEY = 'hexile:game';

class GameStore {
  state = $state<GameState | null>(null);
  selectedHex = $state<number | null>(null);
  selectedTri = $state<number | null>(null);

  constructor() {
    if (browser) this.load();
  }

  startNew(puzzle: Puzzle) {
    this.state = newState(puzzle);
    this.selectedHex = null;
    this.selectedTri = null;
    this.persist();
  }

  select(hex: number, tri: number) {
    this.selectedHex = hex;
    this.selectedTri = tri;
  }

  clearSelection() {
    this.selectedHex = null;
    this.selectedTri = null;
  }

  setEntry(value: number) {
    if (!this.state || this.selectedHex === null || this.selectedTri === null) return;
    this.state = pureSetEntry(this.state, this.selectedHex, this.selectedTri, value);
    this.persist();
  }

  clearEntry() {
    if (!this.state || this.selectedHex === null || this.selectedTri === null) return;
    this.state = pureClearEntry(this.state, this.selectedHex, this.selectedTri);
    this.persist();
  }

  discard() {
    this.state = null;
    this.selectedHex = null;
    this.selectedTri = null;
    if (browser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* localStorage unavailable */
      }
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.puzzle?.givens || !parsed?.puzzle?.solution) return;
      if (!parsed.entries) parsed.entries = {};
      this.state = parsed as GameState;
    } catch {
      /* corrupt storage */
    }
  }

  private persist() {
    if (!browser || !this.state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* localStorage unavailable */
    }
  }
}

export const game = new GameStore();

/** Peek at the saved game's difficulty without instantiating the store fully. */
export function peekSavedDifficulty(): Difficulty | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const d = parsed?.puzzle?.difficulty;
    return d === 'easy' || d === 'medium' || d === 'hard' ? d : null;
  } catch {
    return null;
  }
}

/** Wipe the saved game and timer. Used when the user opts to discard. */
export function clearSavedGameAndTimer() {
  if (!browser) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('hexile:timer');
  } catch {
    /* localStorage unavailable */
  }
}

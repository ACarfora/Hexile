import { browser } from '$app/environment';
import {
  newState,
  setEntry as pureSetEntry,
  clearEntry as pureClearEntry,
  isLocked
} from '$lib/game/state';
import { cellKey } from '$lib/game/layout';
import type { Difficulty, GameState, Move, Puzzle } from '$lib/game/types';

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
    const hex = this.selectedHex;
    const tri = this.selectedTri;
    if (isLocked(this.state, hex, tri)) return;
    const prev = this.state.entries[cellKey(hex, tri)];
    if (prev === value) return;
    const next = pureSetEntry(this.state, hex, tri, value);
    this.state = { ...next, history: [...next.history, { hex, tri, prev }] };
    this.persist();
  }

  clearEntry() {
    if (!this.state || this.selectedHex === null || this.selectedTri === null) return;
    const hex = this.selectedHex;
    const tri = this.selectedTri;
    if (isLocked(this.state, hex, tri)) return;
    const prev = this.state.entries[cellKey(hex, tri)];
    if (prev === undefined) return;
    const next = pureClearEntry(this.state, hex, tri);
    this.state = { ...next, history: [...next.history, { hex, tri, prev }] };
    this.persist();
  }

  /** Reveal the correct value for the selected cell and lock it. Not added to undo history. */
  hint() {
    if (!this.state || this.selectedHex === null || this.selectedTri === null) return;
    const hex = this.selectedHex;
    const tri = this.selectedTri;
    if (isLocked(this.state, hex, tri)) return;
    const key = cellKey(hex, tri);
    const correct = this.state.puzzle.solution[key];
    if (correct === undefined) return;
    const newEntries = { ...this.state.entries };
    delete newEntries[key];
    // Drop any history entries for this cell — once hinted, undo on this cell is a no-op anyway.
    const newHistory = this.state.history.filter((m) => !(m.hex === hex && m.tri === tri));
    this.state = {
      ...this.state,
      entries: newEntries,
      hints: { ...this.state.hints, [key]: correct },
      history: newHistory
    };
    this.clearSelection();
    this.persist();
  }

  /** Pop the most recent setEntry/clearEntry and restore the previous value. */
  undo() {
    if (!this.state || this.state.history.length === 0) return;
    const history = this.state.history;
    const last = history[history.length - 1];
    const key = cellKey(last.hex, last.tri);
    const newEntries = { ...this.state.entries };
    if (last.prev === undefined) {
      delete newEntries[key];
    } else {
      newEntries[key] = last.prev;
    }
    this.state = {
      ...this.state,
      entries: newEntries,
      history: history.slice(0, -1)
    };
    this.select(last.hex, last.tri);
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
      // Back-compat: pre-PWA-undo saves won't have hints/history.
      if (!parsed.hints) parsed.hints = {};
      if (!Array.isArray(parsed.history)) parsed.history = [];
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

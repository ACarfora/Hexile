// Pure operations on GameState. Persistence (localStorage) lives in lib/stores/game.ts.

import { cellKey } from './layout';
import type { Board, GameState, Puzzle } from './types';

export function newState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    entries: {},
    startedAt: Date.now()
  };
}

export function isGiven(state: GameState, hex: number, tri: number): boolean {
  return state.puzzle.givens[cellKey(hex, tri)] !== undefined;
}

export function getValue(state: GameState, hex: number, tri: number): number | undefined {
  const k = cellKey(hex, tri);
  const given = state.puzzle.givens[k];
  if (given !== undefined) return given;
  return state.entries[k];
}

export function setEntry(state: GameState, hex: number, tri: number, value: number): GameState {
  if (isGiven(state, hex, tri)) return state;
  return {
    ...state,
    entries: { ...state.entries, [cellKey(hex, tri)]: value }
  };
}

export function clearEntry(state: GameState, hex: number, tri: number): GameState {
  if (isGiven(state, hex, tri)) return state;
  const next: Board = { ...state.entries };
  delete next[cellKey(hex, tri)];
  return { ...state, entries: next };
}

export function getBoard(state: GameState): Board {
  return { ...state.puzzle.givens, ...state.entries };
}

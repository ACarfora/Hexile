// Rule checking for the current board state.
// Board shape: { [cellKey]: number } — only filled cells appear.

import { HEXES, ADJACENCIES, cellKey } from './layout';
import type { Board, CellKey } from './types';

export function findConflicts(board: Board): Set<CellKey> {
  const conflicts = new Set<CellKey>();

  // Rule 1: within each hex, no value 1..6 may repeat.
  for (const hex of HEXES) {
    const seen = new Map<number, CellKey>();
    for (let tri = 0; tri < 6; tri++) {
      const key = cellKey(hex.id, tri);
      const v = board[key];
      if (v === undefined) continue;
      const prev = seen.get(v);
      if (prev !== undefined) {
        conflicts.add(prev);
        conflicts.add(key);
      } else {
        seen.set(v, key);
      }
    }
  }

  // Rule 2: across each shared edge, the two triangles hold the same value.
  for (const adj of ADJACENCIES) {
    const ka = cellKey(adj.a, adj.aTri);
    const kb = cellKey(adj.b, adj.bTri);
    const va = board[ka];
    const vb = board[kb];
    if (va !== undefined && vb !== undefined && va !== vb) {
      conflicts.add(ka);
      conflicts.add(kb);
    }
  }

  return conflicts;
}

export function isComplete(board: Board): boolean {
  for (const hex of HEXES) {
    for (let tri = 0; tri < 6; tri++) {
      const v = board[cellKey(hex.id, tri)];
      if (typeof v !== 'number' || v < 1 || v > 6) return false;
    }
  }
  return true;
}

export function isWon(board: Board): boolean {
  return isComplete(board) && findConflicts(board).size === 0;
}

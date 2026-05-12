export type Difficulty = 'easy' | 'medium' | 'hard';

/** Cell identifier: "<hexId>:<triIndex>" — hex 1-13, tri 0-5. */
export type CellKey = `${number}:${number}`;

/** Map of cell keys to numeric values 1-6. Empty cells are absent. */
export type Board = Partial<Record<CellKey, number>>;

export interface Puzzle {
  id: string;
  difficulty: Difficulty;
  givens: Board;
  solution: Board;
  seed: number;
}

export interface GameState {
  puzzle: Puzzle;
  entries: Board;
  hints: Board;
  history: Move[];
  startedAt: number;
}

/** A single undoable change to `entries`. `prev` is the value before the change (undefined = empty). */
export interface Move {
  hex: number;
  tri: number;
  prev: number | undefined;
}

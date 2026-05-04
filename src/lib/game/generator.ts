// Puzzle generator. Builds a complete solution, then strips cells while
// preserving uniqueness, until the difficulty's target givens count is reached.

import { CELLS, cellKey } from './layout';
import { solve, countSolutions } from './solver';
import type { Board, CellKey, Difficulty, Puzzle } from './types';

const TARGETS: Record<Difficulty, number> = {
  easy: 39, // 50% of 78 cells
  medium: 31, // ~40% of 78 cells
  hard: 22 // ~28% of 78 cells
};

const ALL_CELL_KEYS: CellKey[] = CELLS.map((c) => cellKey(c.hex, c.tri));

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generate(difficulty: Difficulty, seed: number = Date.now()): Puzzle {
  const target = TARGETS[difficulty];
  if (target === undefined) throw new Error(`Unknown difficulty: ${difficulty}`);

  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptSeed = (seed + attempt) >>> 0;
    const rand = makeRng(attemptSeed);

    const solution = solve({}, (candidates) => shuffleInPlace(candidates, rand));
    if (!solution) continue;

    const givens: Board = { ...solution };
    const order = shuffleInPlace([...ALL_CELL_KEYS], rand);
    for (const key of order) {
      if (Object.keys(givens).length <= target) break;
      const saved = givens[key];
      delete givens[key];
      if (countSolutions(givens, 2) !== 1 && saved !== undefined) {
        givens[key] = saved;
      }
    }

    if (Object.keys(givens).length <= target) {
      return {
        id: `gen-${Date.now()}-${attemptSeed}`,
        difficulty,
        givens,
        solution,
        seed: attemptSeed
      };
    }
  }

  throw new Error(`Failed to generate ${difficulty} puzzle after ${maxAttempts} attempts`);
}

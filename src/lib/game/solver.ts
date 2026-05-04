// Backtracking solver with constraint propagation.
// Domains are 6-bit bitmasks: bit (v-1) set means value v is still possible.

import { HEXES, ADJACENCIES, CELLS, cellKey } from './layout';
import type { Board, CellKey } from './types';

type Domains = Record<CellKey, number>;
type CandidateOrder = (candidates: number[]) => void;

const ALL_KEYS: CellKey[] = CELLS.map((c) => cellKey(c.hex, c.tri));
const FULL_DOMAIN = 0b111111;
const VALUE_BITS = [1, 2, 4, 8, 16, 32];

const PARTNER = Object.fromEntries(
  ADJACENCIES.flatMap((a): Array<[CellKey, CellKey]> => [
    [cellKey(a.a, a.aTri), cellKey(a.b, a.bTri)],
    [cellKey(a.b, a.bTri), cellKey(a.a, a.aTri)]
  ])
) as Partial<Record<CellKey, CellKey>>;

const HEX_CELLS = Object.fromEntries(
  HEXES.map((h): [number, CellKey[]] => [
    h.id,
    [0, 1, 2, 3, 4, 5].map((t) => cellKey(h.id, t))
  ])
) as Record<number, CellKey[]>;

const POPCOUNT: Uint8Array = (() => {
  const t = new Uint8Array(64);
  for (let i = 1; i < 64; i++) t[i] = t[i >> 1] + (i & 1);
  return t;
})();

function makeDomains(givens: Board): Domains {
  const d = {} as Domains;
  for (const k of ALL_KEYS) {
    const g = givens[k];
    d[k] = g !== undefined ? VALUE_BITS[g - 1] : FULL_DOMAIN;
  }
  return d;
}

function propagate(domains: Domains): boolean {
  let changed = true;
  while (changed) {
    changed = false;

    for (const k of ALL_KEYS) {
      const partner = PARTNER[k];
      if (!partner) continue;
      const meet = domains[k] & domains[partner];
      if (meet === 0) return false;
      if (meet !== domains[k] || meet !== domains[partner]) {
        domains[k] = meet;
        domains[partner] = meet;
        changed = true;
      }
    }

    for (const hex of HEXES) {
      const cells = HEX_CELLS[hex.id];

      for (const k of cells) {
        const dk = domains[k];
        if (POPCOUNT[dk] === 1) {
          for (const sib of cells) {
            if (sib === k) continue;
            if (domains[sib] & dk) {
              domains[sib] &= ~dk;
              if (domains[sib] === 0) return false;
              changed = true;
            }
          }
        }
      }

      for (const bit of VALUE_BITS) {
        let only: CellKey | null = null;
        let count = 0;
        for (const k of cells) {
          if (domains[k] & bit) {
            count++;
            only = k;
            if (count > 1) break;
          }
        }
        if (count === 0) return false;
        if (count === 1 && only !== null && domains[only] !== bit) {
          domains[only] = bit;
          changed = true;
        }
      }
    }
  }
  return true;
}

function pickCell(domains: Domains): CellKey | null {
  let best: CellKey | null = null;
  let bestSize = 7;
  for (const k of ALL_KEYS) {
    const size = POPCOUNT[domains[k]];
    if (size > 1 && size < bestSize) {
      best = k;
      bestSize = size;
      if (size === 2) return best;
    }
  }
  return best;
}

function domainsToState(domains: Domains): Board {
  const s: Board = {};
  for (const k of ALL_KEYS) s[k] = VALUE_BITS.indexOf(domains[k]) + 1;
  return s;
}

function search(
  domains: Domains,
  cap: number,
  candidateOrder: CandidateOrder,
  onSolution: (state: Board) => void
): number {
  if (cap <= 0) return 0;
  const cell = pickCell(domains);
  if (cell === null) {
    onSolution(domainsToState(domains));
    return 1;
  }
  const candidates: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (domains[cell] & VALUE_BITS[i]) candidates.push(i + 1);
  }
  candidateOrder(candidates);
  let found = 0;
  for (const v of candidates) {
    const snapshot: Domains = { ...domains };
    domains[cell] = VALUE_BITS[v - 1];
    if (propagate(domains)) {
      found += search(domains, cap - found, candidateOrder, onSolution);
      if (found >= cap) {
        Object.assign(domains, snapshot);
        return found;
      }
    }
    Object.assign(domains, snapshot);
  }
  return found;
}

export function solve(givens: Board, candidateOrder: CandidateOrder = () => {}): Board | null {
  const domains = makeDomains(givens);
  if (!propagate(domains)) return null;
  let result: Board | null = null;
  search(domains, 1, candidateOrder, (s) => {
    result = s;
  });
  return result;
}

export function countSolutions(givens: Board, cap = 2): number {
  const domains = makeDomains(givens);
  if (!propagate(domains)) return 0;
  return search(
    domains,
    cap,
    () => {},
    () => {}
  );
}

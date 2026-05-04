// The fixed canonical board: 13 flat-top hexagons, each split into 6 triangular cells.
// All other modules read from this one. Pure data + small derivations.

import type { CellKey } from './types';

export const SIZE = 50;
const SQRT3 = Math.sqrt(3);

export interface Hex {
  id: number;
  q: number;
  r: number;
  cx: number;
  cy: number;
}

export interface Vertex {
  x: number;
  y: number;
}

export interface Adjacency {
  a: number;
  aTri: number;
  b: number;
  bTri: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function axialToPixel(q: number, r: number): { cx: number; cy: number } {
  return {
    cx: 1.5 * SIZE * q,
    cy: SQRT3 * SIZE * (r + q / 2)
  };
}

const HEX_COORDS: Array<{ id: number; q: number; r: number }> = [
  { id: 1,  q:  0, r: 0 },
  { id: 2,  q: -1, r: 1 },
  { id: 3,  q:  1, r: 0 },
  { id: 4,  q:  0, r: 1 },
  { id: 5,  q: -1, r: 2 },
  { id: 6,  q:  1, r: 1 },
  { id: 7,  q:  0, r: 2 },
  { id: 8,  q: -1, r: 3 },
  { id: 9,  q:  1, r: 2 },
  { id: 10, q:  0, r: 3 },
  { id: 11, q: -1, r: 4 },
  { id: 12, q:  1, r: 3 },
  { id: 13, q:  0, r: 4 }
];

export const HEXES: Hex[] = HEX_COORDS.map((h) => ({ ...h, ...axialToPixel(h.q, h.r) }));

// Hex vertex offsets from centre, clockwise from upper-left.
// Vertex i and vertex (i+1)%6 are the two endpoints of triangle i's base edge.
export const HEX_VERTICES: Vertex[] = [
  { x: -SIZE / 2, y: (-SIZE * SQRT3) / 2 },
  { x:  SIZE / 2, y: (-SIZE * SQRT3) / 2 },
  { x:  SIZE,     y:  0                  },
  { x:  SIZE / 2, y:  (SIZE * SQRT3) / 2 },
  { x: -SIZE / 2, y:  (SIZE * SQRT3) / 2 },
  { x: -SIZE,     y:  0                  }
];

// Six axial neighbour directions for flat-top hexes, with the
// triangle pairing on the shared edge: A's `aTri` coincides with B's `bTri`.
const NEIGHBOUR_DIRS: Array<{ dq: number; dr: number; aTri: number; bTri: number }> = [
  { dq:  0, dr: -1, aTri: 0, bTri: 3 }, // N
  { dq:  1, dr: -1, aTri: 1, bTri: 4 }, // NE
  { dq:  1, dr:  0, aTri: 2, bTri: 5 }, // SE
  { dq:  0, dr:  1, aTri: 3, bTri: 0 }, // S
  { dq: -1, dr:  1, aTri: 4, bTri: 1 }, // SW
  { dq: -1, dr:  0, aTri: 5, bTri: 2 }  // NW
];

function buildAdjacencies(hexes: Hex[]): Adjacency[] {
  const byCoord = new Map<string, number>(hexes.map((h) => [`${h.q},${h.r}`, h.id]));
  const adj: Adjacency[] = [];
  for (const a of hexes) {
    for (const dir of NEIGHBOUR_DIRS) {
      const bId = byCoord.get(`${a.q + dir.dq},${a.r + dir.dr}`);
      if (bId !== undefined && bId > a.id) {
        adj.push({ a: a.id, aTri: dir.aTri, b: bId, bTri: dir.bTri });
      }
    }
  }
  return adj;
}

export const ADJACENCIES: Adjacency[] = buildAdjacencies(HEXES);

function computeBounds(hexes: Hex[]): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const h of hexes) {
    for (const v of HEX_VERTICES) {
      const x = h.cx + v.x;
      const y = h.cy + v.y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

export const BOARD_BOUNDS: Bounds = computeBounds(HEXES);

export const CELLS: Array<{ hex: number; tri: number }> = HEXES.flatMap((h) =>
  [0, 1, 2, 3, 4, 5].map((tri) => ({ hex: h.id, tri }))
);

export const cellKey = (hex: number, tri: number): CellKey => `${hex}:${tri}`;

export function parseCellKey(key: CellKey): { hex: number; tri: number } {
  const [hex, tri] = key.split(':').map(Number);
  return { hex, tri };
}

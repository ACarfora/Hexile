// Web Worker that runs the puzzle generator off the main thread.
// Vite handles this via the `?worker` import in the consuming code.

import { generate } from '$lib/game/generator';
import type { Difficulty, Puzzle } from '$lib/game/types';

interface GenerateRequest {
  type: 'generate';
  difficulty: Difficulty;
  seed?: number;
}

interface GenerateSuccess {
  type: 'success';
  puzzle: Puzzle;
}

interface GenerateError {
  type: 'error';
  message: string;
}

export type WorkerResponse = GenerateSuccess | GenerateError;

self.addEventListener('message', (e: MessageEvent<GenerateRequest>) => {
  if (e.data?.type !== 'generate') return;
  try {
    const puzzle = generate(e.data.difficulty, e.data.seed);
    const reply: GenerateSuccess = { type: 'success', puzzle };
    self.postMessage(reply);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const reply: GenerateError = { type: 'error', message };
    self.postMessage(reply);
  }
});

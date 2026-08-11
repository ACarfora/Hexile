import { browser } from '$app/environment';
import type { Difficulty } from '$lib/game/types';

const STORAGE_KEY = 'hexile:records';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export interface BestTime {
  timeMs: number;
  /** ISO date (yyyy-mm-dd) the record was set. */
  date: string;
}

type Records = Partial<Record<Difficulty, BestTime>>;

class RecordsStore {
  best = $state<Records>({});

  constructor() {
    if (browser) this.load();
  }

  /**
   * Submit a hint-free solve time. Stores it only when it beats the current
   * best for that difficulty (or none exists). Returns true when a new best
   * was set. Times must be positive — a zero elapsed time is never a record.
   */
  submit(difficulty: Difficulty, timeMs: number): boolean {
    if (!Number.isFinite(timeMs) || timeMs <= 0) return false;
    const current = this.best[difficulty];
    if (current && current.timeMs <= timeMs) return false;
    this.best = {
      ...this.best,
      [difficulty]: { timeMs, date: new Date().toISOString().slice(0, 10) }
    };
    this.persist();
    return true;
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return;
      const cleaned: Records = {};
      for (const d of DIFFICULTIES) {
        const entry = (parsed as Record<string, unknown>)[d];
        if (
          entry &&
          typeof entry === 'object' &&
          typeof (entry as BestTime).timeMs === 'number' &&
          Number.isFinite((entry as BestTime).timeMs) &&
          (entry as BestTime).timeMs > 0
        ) {
          cleaned[d] = {
            timeMs: (entry as BestTime).timeMs,
            date: typeof (entry as BestTime).date === 'string' ? (entry as BestTime).date : ''
          };
        }
      }
      this.best = cleaned;
    } catch {
      /* corrupt storage */
    }
  }

  private persist() {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.best));
    } catch {
      /* localStorage unavailable */
    }
  }
}

export const records = new RecordsStore();

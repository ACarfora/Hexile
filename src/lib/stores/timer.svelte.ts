import { browser } from '$app/environment';

const STORAGE_KEY = 'hexile:timer';

interface PersistedTimer {
  elapsed: number;
  started: boolean;
  paused: boolean;
}

class TimerStore {
  elapsed = $state(0);
  started = $state(false);
  paused = $state(false);

  private interval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (browser) this.load();
  }

  /** Mark first interaction; starts the clock if not paused. */
  begin() {
    if (!this.started) {
      this.started = true;
      this.persist();
    }
    if (!this.paused) this.start();
  }

  start() {
    if (!browser || this.interval) return;
    this.interval = setInterval(() => {
      this.elapsed += 1000;
      this.persist();
    }, 1000);
  }

  /** Stop the clock without changing the paused flag (used on win). */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  pause() {
    this.paused = true;
    this.stop();
    this.persist();
  }

  resume() {
    this.paused = false;
    if (this.started) this.start();
    this.persist();
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  reset() {
    this.stop();
    this.elapsed = 0;
    this.started = false;
    this.paused = false;
    this.persist();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const t = JSON.parse(raw) as Partial<PersistedTimer>;
      if (typeof t.elapsed === 'number') this.elapsed = t.elapsed;
      if (t.started) this.started = true;
      if (t.paused) this.paused = true;
      // Auto-resume the interval if a started, unpaused timer was loaded.
      if (this.started && !this.paused) this.start();
    } catch {
      /* corrupt storage */
    }
  }

  private persist() {
    if (!browser) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          elapsed: this.elapsed,
          started: this.started,
          paused: this.paused
        } satisfies PersistedTimer)
      );
    } catch {
      /* localStorage unavailable */
    }
  }
}

export const timer = new TimerStore();

/** Format ms as MM:SS, or H:MM:SS once past one hour. */
export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

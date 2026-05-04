import { browser } from '$app/environment';

const STORAGE_KEY = 'hexile:theme';
type Theme = 'light' | 'dark';

class ThemeStore {
  current = $state<Theme>('light');

  constructor() {
    if (browser) {
      const attr = document.documentElement.getAttribute('data-theme');
      this.current = attr === 'dark' ? 'dark' : 'light';
    }
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    this.persist();
  }

  set(value: Theme) {
    this.current = value;
    this.persist();
  }

  private persist() {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, this.current);
      document.documentElement.setAttribute('data-theme', this.current);
    } catch {
      /* localStorage unavailable */
    }
  }
}

export const theme = new ThemeStore();

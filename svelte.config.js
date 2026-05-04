import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Favicon is uploaded post-build into static/. Allow the prerender
        // check for that one path to fail silently.
        if (path === '/favicon.svg') return;
        throw new Error(message);
      }
    }
  }
};

export default config;

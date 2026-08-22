import { sites } from '@openai/sites-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    publicDir: 'astro-dist',
    plugins: [
      sites(),
      cloudflare({
        config: {
          name: 'server',
          main: 'sites-worker.mjs',
          compatibility_date: '2026-08-22',
          compatibility_flags: ['nodejs_compat'],
          assets: {
            binding: 'ASSETS',
            html_handling: 'auto-trailing-slash',
            run_worker_first: true,
          },
        },
      }),
    ],
  };
});

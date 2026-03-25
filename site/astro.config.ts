import { defineConfig } from 'astro/config';
import { examplesLoader } from './src/integrations/examples-loader';

export default defineConfig({
  output: 'static',
  site: 'https://takerg.github.io',
  base: '/followAI',
  integrations: [examplesLoader()],
  vite: {
    server: {
      fs: {
        allow: ['../examples'],
      },
    },
  },
});

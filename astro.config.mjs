import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://filebrik.pages.dev',
  output: 'static',
  build: {
    format: 'directory'
  }
});

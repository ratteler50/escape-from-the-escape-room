import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths, so the build works at the GitHub Pages sub-path and at the root alike.
  base: './',
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
